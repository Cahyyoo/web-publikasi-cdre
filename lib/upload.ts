import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { FlashCode } from "@/lib/flash";
import { MAX_EDGE, MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

/*
 * Admin forms accept photos straight off a camera (~30–50MB). The browser
 * normally shrinks them first (components/ui/ImageFileInput.tsx), so the
 * MAX_UPLOAD_BYTES cap only matters when that step fails and the original is
 * sent instead. The public testimonial form passes a tighter `maxBytes`.
 *
 * MAX_EDGE is the longest edge kept on disk: the full-screen hero needs
 * ~2560px to stay sharp on a retina laptop. Visitors never download this file
 * directly, since next/image serves a variant sized to their screen.
 */
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
const WEBP_QUALITY = 85;

// ISO-BMFF major brands used by HEIC/HEIF photos (iPhone and others).
const HEIF_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"]);

/**
 * True for HEIC/HEIF, judged by the file header: browsers often send an empty
 * or generic type for .heic files (Chrome on Windows does).
 */
function isHeif(buffer: Buffer): boolean {
  return (
    buffer.length > 12 &&
    buffer.toString("latin1", 4, 8) === "ftyp" &&
    HEIF_BRANDS.has(buffer.toString("latin1", 8, 12))
  );
}

/**
 * sharp's bundled libheif only reads AVIF, not the HEVC-coded HEIC that
 * iPhones produce, so those go through libheif compiled to WebAssembly.
 * Loaded on demand: it is only needed when a HEIC arrives. Returns null when
 * it cannot decode the file (e.g. an AVIF tagged "mif1"), so sharp can try.
 */
async function decodeHeif(buffer: Buffer): Promise<ReturnType<typeof sharp> | null> {
  try {
    const { default: decode } = await import("heic-decode");
    const { width, height, data } = await decode({ buffer });
    // libheif has already applied the photo's rotation.
    return sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), {
      raw: { width, height, channels: 4 },
    });
  } catch {
    return null;
  }
}

const UPLOAD_ROOT = path.resolve(process.cwd(), "public", "uploads");

/**
 * Maps a path relative to /uploads (e.g. "posts/<uuid>.webp") to its file on
 * disk, or null if it would resolve outside the upload folder — so a crafted
 * "../" can never reach the rest of the filesystem.
 */
export function resolveUploadPath(relative: string): string | null {
  const target = path.resolve(UPLOAD_ROOT, relative);
  return target.startsWith(UPLOAD_ROOT + path.sep) ? target : null;
}

/**
 * Upload failure. Carries a flash code rather than a message so the Indonesian
 * copy lives only in lib/flash.ts instead of being thrown, URL-encoded into a
 * redirect, and echoed back to the page.
 */
export type UploadErrorCode = Extract<
  FlashCode,
  "upload-empty" | "upload-large" | "upload-type" | "upload-required"
>;

export class UploadError extends Error {
  constructor(readonly code: UploadErrorCode) {
    super(code);
    this.name = "UploadError";
  }
}

/**
 * Saves an uploaded image to /public/uploads/<subfolder> and returns the public
 * URL path to store on the record (e.g. Testimonial.imageUrl).
 *
 * Originals used to be written to disk byte-for-byte, so a phone photo landed
 * as a multi-megabyte JPEG that the image optimizer then had to decode on every
 * cold request — and with its EXIF GPS coordinates intact in a public folder.
 * Everything is now re-encoded to WebP, capped at MAX_EDGE on its longest side,
 * and stripped of metadata (sharp drops EXIF unless withMetadata() is called).
 */
export async function saveUploadedImage(
  file: File,
  subfolder: string,
  { maxBytes = MAX_UPLOAD_BYTES }: { maxBytes?: number } = {}
): Promise<string> {
  if (file.size === 0) {
    throw new UploadError("upload-empty");
  }
  if (file.size > maxBytes) {
    throw new UploadError("upload-large");
  }

  const input = Buffer.from(await file.arrayBuffer());
  const heif = isHeif(input);
  if (!heif && !ALLOWED_TYPES.has(file.type)) {
    throw new UploadError("upload-type");
  }

  const image =
    (heif ? await decodeHeif(input) : null) ??
    sharp(input, { animated: true })
      // Honour the EXIF orientation flag before it is discarded, otherwise
      // portrait phone photos come out sideways.
      .rotate();

  let output: Buffer;
  try {
    output = await image
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, smartSubsample: true })
      .toBuffer();
  } catch (error) {
    // A HEIF neither decoder can read (an unsupported variant) is a format
    // problem the uploader can fix, not a server fault.
    if (heif) throw new UploadError("upload-type");
    throw error;
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const dir = path.join(UPLOAD_ROOT, subfolder);
  await mkdir(dir, { recursive: true });

  await writeFile(path.join(dir, filename), output);

  return `/uploads/${subfolder}/${filename}`;
}

/**
 * Deletes a previously uploaded file. Replacing an image used to orphan the old
 * one on disk forever.
 *
 * Resolves and re-checks the path so a malformed or crafted URL can never reach
 * outside /public/uploads. Never throws: losing a stale file is not worth
 * failing an otherwise successful save.
 */
export async function deleteUploadedImage(
  imageUrl: string | null | undefined
): Promise<void> {
  if (!imageUrl?.startsWith("/uploads/")) return;

  const target = resolveUploadPath(imageUrl.slice("/uploads/".length));
  if (!target) return;

  try {
    await unlink(target);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("[upload] gagal menghapus file lama", imageUrl, error);
    }
  }
}

/** Returns the uploaded File from a form field, or null if none was chosen. */
export function getOptionalFile(
  formData: FormData,
  field: string
): File | null {
  const value = formData.get(field);
  if (value instanceof File && value.size > 0) {
    return value;
  }
  return null;
}

/**
 * Resolves the image path to persist from a form's "photo" file field.
 * - If a file was uploaded, it's saved and its path returned.
 * - Otherwise, falls back to `fallback` (e.g. the record's current image
 *   when editing) if provided, or throws if the photo is required.
 */
export async function resolveImage(
  formData: FormData,
  subfolder: string,
  fallback?: string,
  options?: { maxBytes?: number }
): Promise<string> {
  const photo = getOptionalFile(formData, "photo");
  if (photo) {
    return saveUploadedImage(photo, subfolder, options);
  }
  if (fallback) return fallback;
  throw new UploadError("upload-required");
}
