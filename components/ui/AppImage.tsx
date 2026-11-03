import Image, { type ImageProps } from "next/image";
import { withBasePath } from "@/lib/base-path";

/**
 * next/image with the app's basePath applied to local `src` paths. Use this
 * instead of importing next/image directly, or local images 404 when the app
 * runs under a prefix such as /web-cdre.
 *
 * Quality defaults to 85 rather than Next's 75: uploads are already WebP
 * (lib/upload.ts), and a second pass at 75 visibly softened photos. Visitors
 * still only download a variant sized to their screen via `sizes`.
 */
export default function AppImage({ src, alt, quality = 85, ...props }: ImageProps) {
  return (
    <Image
      src={typeof src === "string" ? withBasePath(src) : src}
      alt={alt}
      quality={quality}
      {...props}
    />
  );
}
