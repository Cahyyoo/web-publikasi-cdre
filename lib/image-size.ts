import path from "path";
import sharp from "sharp";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export type ImageSize = { width: number; height: number };

const PUBLIC_ROOT = path.resolve(process.cwd(), "public");

/**
 * Pixel size of an image served from /public (bundled banners and admin
 * uploads alike), or null for remote URLs and unreadable files. Cached:
 * upload names are random UUIDs that are never overwritten, and hero-image
 * actions revalidate the tag when a slot changes.
 */
export const getLocalImageSize = unstable_cache(
  async (url: string): Promise<ImageSize | null> => {
    if (!url.startsWith("/")) return null;
    const target = path.resolve(PUBLIC_ROOT, `.${url}`);
    // Never read outside /public, whatever the stored URL says.
    if (!target.startsWith(PUBLIC_ROOT + path.sep)) return null;
    try {
      const { width, height, orientation } = await sharp(target).metadata();
      if (!width || !height) return null;
      // EXIF orientations 5–8 are displayed rotated by 90°.
      return orientation && orientation >= 5 ? { width: height, height: width } : { width, height };
    } catch {
      return null;
    }
  },
  ["local-image-size"],
  { tags: [CACHE_TAGS.hero] }
);

/**
 * `sizes` for a full-screen `object-cover` image. `100vw` alone is only right
 * while the screen is wider than the photo: on a portrait phone the photo is
 * scaled to the screen's height, so it needs to be (height × aspect) wide,
 * and under-stating that makes the browser fetch a variant it then upscales.
 */
export function coverImageSizes(size: ImageSize | null): string {
  const { width, height } = size ?? { width: 16, height: 9 };
  const aspect = (width / height).toFixed(4);
  return `(max-aspect-ratio: ${width}/${height}) calc(100vh * ${aspect}), 100vw`;
}
