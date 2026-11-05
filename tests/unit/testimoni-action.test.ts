import { headers } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitTestimonial } from "@/app/(public)/testimoni/actions";
import { TESTIMONIAL_MAX_LENGTH } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage, UploadError } from "@/lib/upload";
import { PUBLIC_MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { testimonial: { create: vi.fn() } },
}));
vi.mock("@/lib/upload", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/upload")>()),
  saveUploadedImage: vi.fn(),
}));

const SECRET = "test-secret";
const TOKEN = "test-token";
const fetchMock = vi.fn();

function turnstileAnswers(success: boolean) {
  // A new Response per call: a body can only be read once.
  fetchMock.mockImplementation(async () => new Response(JSON.stringify({ success })));
}

function form(
  overrides: { name?: string; title?: string; quote?: string; token?: string | null } = {},
  photo?: File
) {
  const data = new FormData();
  data.set("name", overrides.name ?? "Budi");
  data.set("title", overrides.title ?? "Kepala Desa");
  data.set("quote", overrides.quote ?? "Programnya bagus.");
  if (overrides.token !== null) data.set("cf-turnstile-response", overrides.token ?? TOKEN);
  if (photo) data.set("photo", photo);
  return data;
}

const photoFile = () => new File(["x"], "foto.png", { type: "image/png" });
const created = vi.mocked(prisma.testimonial.create);

// The limiter keeps its counts for the whole file, so each test gets its own IP.
let ipCounter = 0;

beforeEach(() => {
  vi.mocked(headers).mockReturnValue(
    new Headers({ "x-forwarded-for": `10.0.1.${++ipCounter}` }) as unknown as ReturnType<
      typeof headers
    >
  );
  vi.stubEnv("TURNSTILE_SECRET_KEY", SECRET);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  created.mockReset();
  vi.mocked(saveUploadedImage).mockReset();
  turnstileAnswers(true);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("valid submission", () => {
  it("is saved unpublished, with the placeholder when there is no photo", async () => {
    await expect(submitTestimonial(form())).rejects.toThrow("flash=testimoni-terkirim");

    expect(created).toHaveBeenCalledWith({
      data: {
        name: "Budi",
        title: "Kepala Desa",
        quote: "Programnya bagus.",
        imageUrl: "/avatar-placeholder.svg",
        isPublished: false,
      },
    });
  });

  it("sends the secret and token to Cloudflare", async () => {
    await expect(submitTestimonial(form())).rejects.toThrow("flash=testimoni-terkirim");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe(SECRET);
    expect(body.get("response")).toBe(TOKEN);
  });

  it("stores the photo under the public size limit", async () => {
    vi.mocked(saveUploadedImage).mockResolvedValue("/uploads/testimonials/a.webp");

    await expect(submitTestimonial(form({}, photoFile()))).rejects.toThrow(
      "flash=testimoni-terkirim"
    );

    expect(saveUploadedImage).toHaveBeenCalledWith(expect.any(File), "testimonials", {
      maxBytes: PUBLIC_MAX_UPLOAD_BYTES,
    });
    expect(created.mock.calls[0][0].data.imageUrl).toBe("/uploads/testimonials/a.webp");
  });

  it("reports an upload problem without saving", async () => {
    vi.mocked(saveUploadedImage).mockRejectedValue(new UploadError("upload-type"));

    await expect(submitTestimonial(form({}, photoFile()))).rejects.toThrow("flash=upload-type");
    expect(created).not.toHaveBeenCalled();
  });
});

describe("Turnstile", () => {
  async function expectRejected(data: FormData) {
    await expect(submitTestimonial(data)).rejects.toThrow("flash=turnstile-failed");
    expect(created).not.toHaveBeenCalled();
    expect(saveUploadedImage).not.toHaveBeenCalled();
  }

  it("rejects before touching the photo when Cloudflare says no", async () => {
    turnstileAnswers(false);
    await expectRejected(form({}, photoFile()));
  });

  it("fails closed when Cloudflare is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    fetchMock.mockRejectedValue(new Error("network down"));
    await expectRejected(form());
  });

  it("fails closed when Cloudflare answers with something else", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>"));
    await expectRejected(form());
  });

  it("rejects without calling Cloudflare when the secret is missing", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    await expectRejected(form());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects without calling Cloudflare when the token is missing", async () => {
    await expectRejected(form({ token: null }));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("field validation", () => {
  it.each(["name", "title", "quote"])("requires %s", async (field) => {
    await expect(submitTestimonial(form({ [field]: "   " }))).rejects.toThrow(
      "flash=testimoni-wajib"
    );
    expect(created).not.toHaveBeenCalled();
  });

  it.each(Object.entries(TESTIMONIAL_MAX_LENGTH))(
    "enforces the %s limit of %i characters",
    async (field, max) => {
      await expect(submitTestimonial(form({ [field]: "x".repeat(max + 1) }))).rejects.toThrow(
        "flash=testimoni-terlalu-panjang"
      );
      expect(created).not.toHaveBeenCalled();

      await expect(submitTestimonial(form({ [field]: "x".repeat(max) }))).rejects.toThrow(
        "flash=testimoni-terkirim"
      );
    }
  );
});

describe("rate limit", () => {
  it("blocks the 6th submission in the hour, counting failed ones too", async () => {
    turnstileAnswers(false);
    for (let i = 0; i < 5; i++) {
      await expect(submitTestimonial(form())).rejects.toThrow("flash=turnstile-failed");
    }
    fetchMock.mockClear();
    turnstileAnswers(true);

    await expect(submitTestimonial(form())).rejects.toThrow("flash=rate-limited");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(created).not.toHaveBeenCalled();
  });
});
