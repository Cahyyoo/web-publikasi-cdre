import { headers } from "next/headers";

/**
 * In-memory fixed-window limiter. Counters live in this process and are lost on
 * restart, so the app must run as a single process (pm2 fork mode, not cluster).
 */
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const entries = new Map<string, { count: number; resetAt: number }>();

  return {
    isBlocked(key: string): boolean {
      const entry = entries.get(key);
      return !!entry && entry.resetAt > Date.now() && entry.count >= limit;
    },
    hit(key: string): void {
      const now = Date.now();
      entries.forEach((entry, entryKey) => {
        if (entry.resetAt <= now) entries.delete(entryKey);
      });
      const entry = entries.get(key);
      if (entry) entry.count += 1;
      else entries.set(key, { count: 1, resetAt: now + windowMs });
    },
    reset(key: string): void {
      entries.delete(key);
    },
  };
}

/**
 * Visitor IP: Cloudflare's header when arriving through the tunnel, otherwise
 * the first hop reported by the internal proxy (Caddy).
 */
export function getClientIp(): string {
  const requestHeaders = headers();
  return (
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
