import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

/**
 * Site taxonomy for the navbar menus. The homepage reuses the binaan groups
 * for its UMKM panel, so the list is shared rather than queried twice.
 */
export const getNavData = unstable_cache(
  async () => {
    const [csrCategories, ppmCategories, binaanGroups, activityCategories] = await Promise.all([
      prisma.category.findMany({
        where: { type: "CSR" },
        select: { id: true, name: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
      prisma.category.findMany({
        where: { type: "PPM" },
        select: { id: true, name: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
      prisma.binaanGroup.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.activityCategory.findMany({
        select: { id: true, name: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    ]);
    return { csrCategories, ppmCategories, binaanGroups, activityCategories };
  },
  ["nav-data"],
  { tags: [CACHE_TAGS.nav] }
);
