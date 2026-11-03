"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { withFlash } from "@/lib/flash";
import { readString } from "@/lib/forms";
import {
  createSessionToken,
  isSecureCookie,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";
import { BASE_PATH } from "@/lib/base-path";

// Scoped to the app's prefix: the host serves other apps beside /web-cdre.
const COOKIE_PATH = BASE_PATH || "/";

/**
 * `next` reaches us from a query string, so an attacker can craft
 * /admin/login?next=https://evil.com and bounce the admin off-site right
 * after a successful login. Only same-origin paths are allowed through
 * ("//host" is rejected too — browsers read it as protocol-relative).
 */
function safeNextPath(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
}

export async function login(formData: FormData) {
  const username = readString(formData, "username");
  const password = readString(formData, "password");
  const next = safeNextPath(readString(formData, "next") || "/admin");

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  const isValid =
    !!validUsername &&
    !!validPassword &&
    username === validUsername &&
    password === validPassword;

  if (!isValid) {
    redirect(
      withFlash(
        `/admin/login?next=${encodeURIComponent(next)}`,
        "login-failed"
      )
    );
  }

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
