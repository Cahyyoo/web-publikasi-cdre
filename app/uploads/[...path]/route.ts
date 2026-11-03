import { readFile } from "fs/promises";
import path from "path";
import { resolveUploadPath } from "@/lib/upload";

/**
 * `next start` only serves the files that were in /public at build time, so
 * every image uploaded through the admin afterwards returned 404 until the
 * next rebuild. Files that existed at build time are still served statically
 * (public files win over routes); only newer uploads fall through to here.
 */
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};

function notFound() {
  return new Response("Not Found", { status: 404 });
}

export async function GET(
  _request: Request,
  { params }: { params: { path: string[] } }
) {
  const target = resolveUploadPath(params.path.join("/"));
  if (!target) return notFound();

  const contentType = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!contentType) return notFound();

  let file: Buffer;
  try {
    file = await readFile(target);
  } catch {
    // ENOENT, or a directory (EISDIR) — nothing to serve either way.
    return notFound();
  }

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      // Upload filenames are random UUIDs and never overwritten in place.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
