import type { Metadata } from "next";
import ActivityCarousel from "@/components/gallery/ActivityCarousel";
import PageBanner from "@/components/ui/PageBanner";
import { getHeroImageUrl } from "@/lib/hero-images";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Galeri Kegiatan",
  description: "Dokumentasi kegiatan PT Stargate Pasific Resource per kategori.",
};

/**
 * Every photo of every category used to be loaded and serialized into the RSC
 * payload for the carousels, growing without bound as the archive grew.
 */
const MAX_PHOTOS_PER_CATEGORY = 50;

async function getActivityCategories(categoryId?: number) {
  return prisma.activityCategory.findMany({
    where: categoryId ? { id: categoryId } : undefined,
    select: {
      id: true,
      name: true,
      photos: {
        select: { id: true, imageUrl: true, caption: true },
        orderBy: [{ order: "asc" }, { id: "asc" }],
        take: MAX_PHOTOS_PER_CATEGORY,
      },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export default async function GaleriKegiatanPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryId = searchParams.category ? Number(searchParams.category) : undefined;
  const [categories, bannerUrl] = await Promise.all([
    getActivityCategories(categoryId),
    getHeroImageUrl("GALERI_KEGIATAN_BANNER"),
  ]);

  return (
    <div>
      <div className="mb-10">
        <PageBanner
          badge="Dokumentasi"
          src={bannerUrl}
          alt="Dokumentasi kegiatan pemberdayaan masyarakat PT Stargate Pasific Resource"
          title="Galeri Kegiatan"
          subtitle="Dokumentasi kegiatan perusahaan berdasarkan kategori."
        />
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-stone-400">Belum ada kategori kegiatan untuk ditampilkan.</p>
      ) : (
        <div className="space-y-14">
          {categories.map((category, i) => (
            <section key={category.id} id={`kategori-${category.id}`}>
              <h2 className="mb-5 font-serif text-2xl font-medium text-brand sm:text-3xl">
                {category.name}
              </h2>
              <ActivityCarousel
                priority={i === 0}
                photos={category.photos.map((p) => ({
                  id: p.id,
                  imageUrl: p.imageUrl,
                  caption: p.caption,
                }))}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
