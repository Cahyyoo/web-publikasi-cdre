import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifyError, runAction } from "@/lib/action-helpers";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";
import { UploadError } from "@/lib/upload";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
// The real redirect() also stops execution by throwing.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const OPTIONS = { onSuccess: "/ok", onError: "/form", success: "created" } as const;

function withSessionCookie(token?: string) {
  vi.mocked(cookies).mockReturnValue({
    get: (name: string) =>
      name === SESSION_COOKIE && token ? { name, value: token } : undefined,
  } as unknown as ReturnType<typeof cookies>);
}

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("error", {
    code,
    clientVersion: "test",
  });
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("runAction session check", () => {
  it.each([
    ["no cookie", undefined],
    ["a forged cookie", `${Date.now() + 3_600_000}.${"ab".repeat(32)}`],
    ["an expired cookie", "1000.abcd"],
  ])("does not run the work with %s", async (_label, token) => {
    withSessionCookie(token);
    const work = vi.fn(async () => {});

    await expect(runAction(OPTIONS, work)).rejects.toThrow("REDIRECT:/admin/login");
    expect(work).not.toHaveBeenCalled();
  });
});

describe("runAction outcome", () => {
  beforeEach(async () => {
    withSessionCookie(await createSessionToken());
  });

  it("runs the work and reports success", async () => {
    const work = vi.fn(async () => {});

    await expect(runAction(OPTIONS, work)).rejects.toThrow("REDIRECT:/ok?flash=created");
    expect(work).toHaveBeenCalledOnce();
  });

  it("reports a failure on the form it came from", async () => {
    const work = async () => {
      throw prismaError("P2002");
    };

    await expect(runAction(OPTIONS, work)).rejects.toThrow("REDIRECT:/form?flash=duplicate");
  });

  it("applies errorOverrides", async () => {
    const work = async () => {
      throw prismaError("P2003");
    };
    const options = { ...OPTIONS, errorOverrides: { "in-use": "in-use-category" } } as const;

    await expect(runAction(options, work)).rejects.toThrow(
      "REDIRECT:/form?flash=in-use-category"
    );
  });
});

describe("classifyError", () => {
  it.each([
    [prismaError("P2002"), "duplicate"],
    [prismaError("P2003"), "in-use"],
    [prismaError("P2025"), "not-found"],
    [prismaError("P9999"), "save-failed"],
    [new UploadError("upload-large"), "upload-large"],
    [new Error("boom"), "save-failed"],
    ["not an error", "save-failed"],
  ])("maps %s to %s", (error, expected) => {
    expect(classifyError(error)).toBe(expected);
  });
});
