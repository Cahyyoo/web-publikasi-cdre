/**
 * Upload limits shared by the browser (components/ui/ImageFileInput.tsx) and
 * the server (lib/upload.ts). Kept free of server-only imports so client
 * components can use it.
 */

/** Admin forms: room for a camera original if the browser cannot shrink it. */
export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024; // 60MB

/** Public testimonial form: anonymous visitors get a tighter cap. */
export const PUBLIC_MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

/** Longest edge kept for a photo, in the browser and on disk. */
export const MAX_EDGE = 2560;

/** iPhone photos. Most browsers outside Safari cannot decode these. */
export const HEIC_EXTENSIONS = [".heic", ".heif"];

/** Camera RAW files: not images a browser or this site can process. */
export const RAW_EXTENSIONS = [
  ".nef",
  ".cr2",
  ".cr3",
  ".arw",
  ".dng",
  ".raf",
  ".orf",
  ".rw2",
  ".pef",
  ".srw",
];

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}
