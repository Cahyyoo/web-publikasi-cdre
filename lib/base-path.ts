/** The URL prefix the app is served under (e.g. "/web-cdre"), or "". */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefixes a root-relative path with BASE_PATH. Next.js does this itself for
 * <Link>, router.push and redirect(), but not for next/image `src` — and the
 * stored image URLs (`/uploads/...`, `/banners/...`) are root-relative.
 * Absolute URLs (https://, //cdn) and already-prefixed paths are returned as-is.
 */
export function withBasePath(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}
