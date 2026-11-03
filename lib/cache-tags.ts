/**
 * Cache tags for the near-static reads that every public page performs.
 *
 * The nav taxonomy, footer contact block, sambutan copy and hero images change
 * only when an admin edits them, but were re-queried on every single request —
 * five queries before a page rendered any of its own content. Each reader
 * wraps its query in unstable_cache with one of these tags, and the matching
 * admin action calls revalidateTag so edits still appear immediately.
 */
export const CACHE_TAGS = {
  /** Navbar taxonomy: CSR/PPM categories, binaan groups, activity categories. */
  nav: "nav",
  /** Footer contact info, description and social links. */
  footer: "footer",
  /** Homepage "Sambutan" quote and description. */
  sambutan: "sambutan",
  /** Hero/banner images per slot. */
  hero: "hero",
} as const;
