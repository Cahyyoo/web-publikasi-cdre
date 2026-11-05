import { headers } from "next/headers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

afterEach(() => {
  vi.useRealTimers();
});

describe("createRateLimiter", () => {
  const WINDOW_MS = 1000;
  const limiter = () => createRateLimiter({ limit: 3, windowMs: WINDOW_MS });

  it("blocks only once the limit is reached", () => {
    const limit = limiter();
    limit.hit("a");
    limit.hit("a");
    expect(limit.isBlocked("a")).toBe(false);
    limit.hit("a");
    expect(limit.isBlocked("a")).toBe(true);
  });

  it("counts each key separately", () => {
    const limit = limiter();
    for (let i = 0; i < 3; i++) limit.hit("a");
    expect(limit.isBlocked("b")).toBe(false);
  });

  it("unblocks when the window ends", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const limit = limiter();
    for (let i = 0; i < 3; i++) limit.hit("a");

    vi.advanceTimersByTime(WINDOW_MS - 1);
    expect(limit.isBlocked("a")).toBe(true);

    vi.advanceTimersByTime(1);
    expect(limit.isBlocked("a")).toBe(false);
  });

  it("starts a new count after the window ends", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const limit = limiter();
    for (let i = 0; i < 3; i++) limit.hit("a");

    vi.advanceTimersByTime(WINDOW_MS);
    limit.hit("a");
    expect(limit.isBlocked("a")).toBe(false);
  });

  it("forgets a key on reset", () => {
    const limit = limiter();
    for (let i = 0; i < 3; i++) limit.hit("a");
    limit.reset("a");
    expect(limit.isBlocked("a")).toBe(false);
  });
});

describe("getClientIp", () => {
  function withHeaders(values: Record<string, string>) {
    vi.mocked(headers).mockReturnValue(
      new Headers(values) as unknown as ReturnType<typeof headers>
    );
  }

  it("prefers Cloudflare's header, which a visitor cannot set through the tunnel", () => {
    withHeaders({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" });
    expect(getClientIp()).toBe("1.1.1.1");
  });

  it("falls back to the first x-forwarded-for hop", () => {
    withHeaders({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" });
    expect(getClientIp()).toBe("2.2.2.2");
  });

  it('returns "unknown" without either header', () => {
    withHeaders({});
    expect(getClientIp()).toBe("unknown");
  });
});
