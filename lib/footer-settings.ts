import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

/**
 * Default copy for the site footer, used as a defensive fallback in case
 * the singleton row is ever missing (e.g. a fresh DB that skipped seeding).
 * The row itself is created by the `add_footer_settings` migration.
 */
const DEFAULT_FOOTER_SETTINGS = {
  description:
    "Perusahaan sumber daya yang berkomitmen menjalankan operasional berkelanjutan sekaligus memberi dampak nyata bagi masyarakat sekitar melalui program CSR, PPM, dan pemberdayaan UMKM binaan.",
  address: "Kawasan Operasional PT Stargate Pasific Resource, Indonesia",
  phone: "(021) 000-0000",
  email: "info@stargatepasificresource.co.id",
  facebookUrl: "#",
  instagramUrl: "#",
  youtubeUrl: "#",
};

export type FooterSettings = typeof DEFAULT_FOOTER_SETTINGS;

/**
 * Fetches the footer's contact info, description, and social links, with
 * hardcoded fallbacks.
 *
 * Cached: the Footer renders in the public layout, so this ran once per page
 * view for data that only changes from /admin/footer.
 */
export const getFooterSettings = unstable_cache(
  async (): Promise<FooterSettings> => {
    const row = await prisma.footerSettings.findUnique({ where: { id: 1 } });
    if (!row) return DEFAULT_FOOTER_SETTINGS;

    return {
      description: row.description ?? DEFAULT_FOOTER_SETTINGS.description,
      address: row.address ?? DEFAULT_FOOTER_SETTINGS.address,
      phone: row.phone ?? DEFAULT_FOOTER_SETTINGS.phone,
      email: row.email ?? DEFAULT_FOOTER_SETTINGS.email,
      facebookUrl: row.facebookUrl ?? DEFAULT_FOOTER_SETTINGS.facebookUrl,
      instagramUrl: row.instagramUrl ?? DEFAULT_FOOTER_SETTINGS.instagramUrl,
      youtubeUrl: row.youtubeUrl ?? DEFAULT_FOOTER_SETTINGS.youtubeUrl,
    };
  },
  ["footer-settings"],
  { tags: [CACHE_TAGS.footer] }
);
