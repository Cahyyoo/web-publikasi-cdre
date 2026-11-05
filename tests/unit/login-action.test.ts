import { cookies, headers } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { login, logout } from "@/app/admin/login/actions";
import { isValidSessionToken, SESSION_COOKIE } from "@/lib/session";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const USERNAME = "admin";
const PASSWORD = "correct-password";
const cookieStore = { set: vi.fn(), delete: vi.fn() };

// The limiter keeps its counts for the whole file, so each test gets its own IP.
let ipCounter = 0;
function useNewIp() {
  useIp(`10.0.0.${++ipCounter}`);
}
function useIp(ip: string) {
  vi.mocked(headers).mockReturnValue(
    new Headers({ "x-forwarded-for": ip }) as unknown as ReturnType<typeof headers>
  );
}

function form(fields: { username?: string; password?: string; next?: string } = {}) {
  const data = new FormData();
  data.set("username", fields.username ?? USERNAME);
  data.set("password", fields.password ?? PASSWORD);
  if (fields.next !== undefined) data.set("next", fields.next);
  return data;
}
const wrongPassword = () => form({ password: "wrong" });

async function failLogin(times: number) {
  for (let i = 0; i < times; i++) {
    await expect(login(wrongPassword())).rejects.toThrow("flash=login-failed");
  }
}

beforeEach(() => {
  vi.stubEnv("ADMIN_USERNAME", USERNAME);
  vi.stubEnv("ADMIN_PASSWORD", PASSWORD);
  vi.stubEnv("SESSION_SECRET", "test-secret");
  vi.mocked(cookies).mockReturnValue(cookieStore as unknown as ReturnType<typeof cookies>);
  cookieStore.set.mockClear();
  cookieStore.delete.mockClear();
  useNewIp();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("login credentials", () => {
  it("sets a valid session cookie and redirects on success", async () => {
    await expect(login(form())).rejects.toThrow("REDIRECT:/admin");

    expect(cookieStore.set).toHaveBeenCalledOnce();
    const [name, token, options] = cookieStore.set.mock.calls[0];
    expect(name).toBe(SESSION_COOKIE);
    expect(await isValidSessionToken(token)).toBe(true);
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax" });
  });

  it.each([
    ["password", { password: "wrong" }],
    ["username", { username: "wrong" }],
  ])("rejects a wrong %s without a session cookie", async (_field, fields) => {
    await expect(login(form(fields))).rejects.toThrow("flash=login-failed");
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("rejects everyone when the credentials are not configured", async () => {
    vi.stubEnv("ADMIN_USERNAME", "");
    vi.stubEnv("ADMIN_PASSWORD", "");

    await expect(login(form({ username: "", password: "" }))).rejects.toThrow(
      "flash=login-failed"
    );
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("login rate limit", () => {
  it("blocks the 6th attempt even with the correct password", async () => {
    await failLogin(5);

    await expect(login(form())).rejects.toThrow("flash=rate-limited");
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("leaves other IPs alone", async () => {
    await failLogin(5);

    useNewIp();
    await expect(login(form())).rejects.toThrow("REDIRECT:/admin");
  });

  it("clears the count after a successful login", async () => {
    await failLogin(4);
    await expect(login(form())).rejects.toThrow("REDIRECT:/admin");

    await failLogin(4);
    await expect(login(form())).rejects.toThrow("REDIRECT:/admin");
  });
});

describe("redirect target after login", () => {
  it("keeps a same-site path", async () => {
    await expect(login(form({ next: "/admin/posts" }))).rejects.toThrow(
      /^REDIRECT:\/admin\/posts$/
    );
  });

  it.each(["//evil.com", "/\\evil.com", "/admin\\..\\evil", "https://evil.com", "evil.com"])(
    "falls back to /admin for %s",
    async (next) => {
      await expect(login(form({ next }))).rejects.toThrow(/^REDIRECT:\/admin$/);
    }
  );
});

describe("logout", () => {
  it("removes the session cookie and goes to the login page", async () => {
    await expect(logout()).rejects.toThrow("REDIRECT:/admin/login");
    expect(cookieStore.delete).toHaveBeenCalledWith(
      expect.objectContaining({ name: SESSION_COOKIE })
    );
  });
});
