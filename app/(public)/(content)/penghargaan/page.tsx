import type { Metadata } from "next";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import PageBanner from "@/components/ui/PageBanner";
import { getHeroImageUrl } from "@/lib/hero-images";

export const metadata: Metadata = {
  title: "Penghargaan",
  description: "Galeri penghargaan PT Stargate Pasific Resource.",
};

export default async function PenghargaanPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const bannerUrl = await getHeroImageUrl("PENGHARGAAN_BANNER");

  return (
    <div>
      <div className="mb-10">
        <PageBanner
          badge="Apresiasi"
          src={bannerUrl}
          alt="Dokumentasi kegiatan CSR PT Stargate Pasific Resource"
          title="Penghargaan"
          subtitle="Penghargaan dan pengakuan yang telah diterima perusahaan."
        />
      </div>
      <GalleryGrid type="PENGHARGAAN" page={page} basePath="/penghargaan" />
    </div>
  );
}
