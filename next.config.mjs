// Served behind a shared host at stargate.appinternal.com/web-cdre, whose
// proxy forwards the prefix as-is. Set BASE_PATH="" to run at the domain root.
const basePath = process.env.BASE_PATH ?? "/web-cdre";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  // next/image does not prefix local `src` paths with basePath; lib/base-path.ts
  // reads this to do it (inlined at build time, so client code sees it too).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // The default "X-Powered-By: Next.js" header just advertises the stack.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Room for an unshrunk camera photo (MAX_UPLOAD_BYTES in
      // lib/upload-limits.ts is 60MB) when the browser-side resize in
      // ImageFileInput is unavailable.
      bodySizeLimit: "65mb",
    },
    // HEIC decoder (lib/upload.ts) embeds a large WebAssembly build; load it
    // from node_modules at runtime instead of bundling it into the server.
    serverComponentsExternalPackages: ["heic-decode", "libheif-js"],
  },
  images: {
    // Uploads live under /public/uploads and need no entry here. The wildcard
    // that used to sit in this list let anyone use /_next/image as an open
    // image proxy for arbitrary hosts — add specific CDN/storage hostnames
    // here instead if content ever moves off local disk.
    //
    // picsum.photos is NOT referenced anywhere in the source: the URLs are
    // seed data stored in the database (testimonials, products, posts and
    // galleries). Removing this entry makes those rows throw "Invalid src
    // prop" and returns 500 on the homepage, so grep the DB, not just the
    // code, before dropping it.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
    // WebP only: AVIF encodes 5-10x slower and this runs on a single
    // self-hosted box where the optimizer competes with the app for CPU.
    formats: ["image/webp"],
    // Upload filenames are UUIDs and banner files are replaced by name only
    // on deploy, so optimized variants can be cached for a month instead of
    // the 60s default.
    minimumCacheTTL: 2592000,
    // Required for the local /avatar-placeholder.svg fallback; the CSP and
    // attachment disposition below are Next.js's prescribed mitigation.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
