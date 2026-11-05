"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { withFlash } from "@/lib/flash";
import { readString } from "@/lib/forms";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import {
  createSessionToken,
  isSecureCookie,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";
import { BASE_PATH } from "@/lib/base-path";

// Scoped to the app's prefix: the host serves other apps beside /web-cdre.
const COOKIE_PATH = BASE_PATH || "/";

const failedLogins = createRateLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000,
});

/**
 * `next` reaches us from a query string, so an attacker can craft
 * /admin/login?next=https://evil.com and bounce the admin off-site right
 * after a successful login. Only same-origin paths are allowed through
 * ("//host" is rejected too — browsers read it as protocol-relative, and they
 * treat a backslash as a slash, so "/\host" means the same thing).
 */
function safeNextPath(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
    ? next
    : "/admin";
}

/** Hashing first gives timingSafeEqual the equal-length inputs it requires. */
function safeEqual(a: string, b: string): boolean {
  const sha256 = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(sha256(a), sha256(b));
}

export async function login(formData: FormData) {
  const username = readString(formData, "username");
  const password = readString(formData, "password");
  const next = safeNextPath(readString(formData, "next") || "/admin");

  const ip = getClientIp();
  if (failedLogins.isBlocked(ip)) {
    redirect(
      withFlash(`/admin/login?next=${encodeURIComponent(next)}`, "rate-limited")
    );
  }

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  // One comparison, so the timing doesn't reveal whether the username was right.
  const isValid =
    !!validUsername &&
    !!validPassword &&
    safeEqual(`${username}\0${password}`, `${validUsername}\0${validPassword}`);

  if (!isValid) {
    failedLogins.hit(ip);
    redirect(
      withFlash(
        `/admin/login?next=${encodeURIComponent(next)}`,
        "login-failed"
      )
    );
  }

  failedLogins.reset(ip);

  const token = await createSessionToken();
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(next);
}

export async function logout() {
  cookies().delete({ name: SESSION_COOKIE, path: COOKIE_PATH });
  redirect("/admin/login");
}
