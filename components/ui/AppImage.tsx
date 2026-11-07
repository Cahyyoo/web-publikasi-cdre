"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { withBasePath } from "@/lib/base-path";

/**
 * next/image with the app's basePath applied to local `src` paths. Use this
 * instead of importing next/image directly, or local images 404 whenever the
 * app runs under a prefix (BASE_PATH, e.g. /web-cdre).
 *
 * Quality defaults to 85 rather than Next's 75: uploads are already WebP
 * (lib/upload.ts), and a second pass at 75 visibly softened photos. Visitors
 * still only download a variant sized to their screen via `sizes`.
 *
 * `fill` images show a shimmer until the photo is downloaded and decoded,
 * then fade in, so visitors never see an empty or half-drawn frame. The fade
 * sits on a wrapper so it can't clash with transitions/animations callers put
 * on the image itself. `priority` images (hero, banners) are never hidden:
 * they would otherwise stay invisible until JavaScript hydrates.
 */
export default function AppImage({
  src,
  alt,
  quality = 85,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const resolvedSrc = typeof src === "string" ? withBasePath(src) : src;

  if (!props.fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        quality={quality}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    );
  }

  return (
    <>
      {!loaded && <span aria-hidden className="img-shimmer absolute inset-0" />}
      <span
        className={`absolute inset-0 transition-opacity duration-500 ease-out ${
          loaded || props.priority ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src={resolvedSrc}
          alt={alt}
          quality={quality}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          // A broken image must not leave the shimmer running forever.
          onError={(e) => {
            setLoaded(true);
            onError?.(e);
          }}
          {...props}
        />
      </span>
    </>
  );
}
