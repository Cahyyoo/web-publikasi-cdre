import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

/**
 * Default copy for the homepage "Sambutan" section, used as a defensive
 * fallback in case the singleton row is ever missing (e.g. a fresh DB that
 * skipped seeding). The row itself is created by the `add_sambutan` migration.
 */
const DEFAULT_SAMBUTAN = {
  quote:
    "Kami berkomitmen menjalankan operasional yang berkelanjutan dengan memberikan dampak positif bagi masyarakat sekitar.",
  description:
    "Melalui program CSR dan PPM, serta pemberdayaan UMKM binaan di wilayah operasional kami, kami percaya pertumbuhan perusahaan harus berjalan beriringan dengan kesejahteraan masyarakat sekitar.",
};

/** Fetches the Sambutan quote + description, with a hardcoded fallback. */
export const getSambutan = unstable_cache(
  async (): Promise<{ quote: string; description: string }> => {
    const row = await prisma.sambutan.findUnique({ where: { id: 1 } });
    return {
      quote: row?.quote ?? DEFAULT_SAMBUTAN.quote,
      description: row?.description ?? DEFAULT_SAMBUTAN.description,
    };
  },
  ["sambutan"],
  { tags: [CACHE_TAGS.sambutan] }
);
