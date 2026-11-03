// Minimal signed-cookie session, implemented with the Web Crypto API so
// it works identically in both the Edge middleware runtime and the
// Node.js runtime used by Server Actions (no `Buffer`, no Node-only
// `crypto` module).

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Whether the session cookie should get the `Secure` attribute.
 * Controlled explicitly via COOKIE_SECURE=true|false; falls back to the
 * previous NODE_ENV-based behavior when unset, so existing HTTPS/production
 * deployments are unaffected.
 */
export function isSecureCookie(): boolean {
  const override = process.env.COOKIE_SECURE;
  if (override === "true") return true;
  if (override === "false") return false;
  return process.env.NODE_ENV === "production";
}

const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Creates a signed `expiresAt.signature` token proving a valid admin login. */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return `${payload}.${bytesToHex(signature)}`;
}

export async function isValidSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const [payload, signatureHex] = token.split(".");
  if (!payload || !signatureHex) return false;

  const key = await getKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    hexToBytes(signatureHex),
    encoder.encode(payload)
  );
  if (!valid) return false;

  return Number(payload) > Date.now();
}
