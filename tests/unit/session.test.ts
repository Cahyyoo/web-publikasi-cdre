import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSessionToken,
  isSecureCookie,
  isValidSessionToken,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("session token", () => {
  it("accepts a token it created", async () => {
    const token = await createSessionToken();
    expect(await isValidSessionToken(token)).toBe(true);
  });

  it("rejects a forged signature", async () => {
    const [payload] = (await createSessionToken()).split(".");
    expect(await isValidSessionToken(`${payload}.${"ab".repeat(32)}`)).toBe(false);
  });

  it("rejects a token whose expiry was extended", async () => {
    const [, signature] = (await createSessionToken()).split(".");
    const later = Date.now() + 365 * 24 * 60 * 60 * 1000;
    expect(await isValidSessionToken(`${later}.${signature}`)).toBe(false);
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createSessionToken();
    vi.stubEnv("SESSION_SECRET", "another-secret");
    expect(await isValidSessionToken(token)).toBe(false);
  });

  it("rejects a token once it expires", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const token = await createSessionToken();

    vi.advanceTimersByTime(SESSION_MAX_AGE_SECONDS * 1000 - 1);
    expect(await isValidSessionToken(token)).toBe(true);

    vi.advanceTimersByTime(1);
    expect(await isValidSessionToken(token)).toBe(false);
  });

  it.each([undefined, "", "abc", "123.", ".abc", "123.zz"])(
    "rejects the malformed token %j",
    async (token) => {
      expect(await isValidSessionToken(token)).toBe(false);
    }
  );

  it("refuses to create a token without SESSION_SECRET", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    await expect(createSessionToken()).rejects.toThrow("SESSION_SECRET");
  });
});

describe("isSecureCookie", () => {
  it.each([
    ["true", "development", true],
    ["false", "production", false],
    ["", "production", true],
    ["", "development", false],
  ])("COOKIE_SECURE=%j NODE_ENV=%s -> %s", (override, nodeEnv, expected) => {
    vi.stubEnv("COOKIE_SECURE", override);
    vi.stubEnv("NODE_ENV", nodeEnv);
    expect(isSecureCookie()).toBe(expected);
  });
});
