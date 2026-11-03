import { HeroSlot } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

/**
 * Metadata for each fixed hero/banner placement on the public site, in the
 * order they appear (homepage top to bottom, then the section pages).
 * Rows for every slot are created by the `add_hero_images` and
 * `home_image_slots` migrations; `defaultImageUrl` is only a defensive
 * fallback in case a row is ever missing (e.g. a fresh DB that skipped
 * seeding). Every homepage placement has its own slot so an admin can give
 * each one a different photo.
 */
export const HERO_SLOTS: Record<
  HeroSlot,
  {
    label: string;
    /**
     * "home": a homepage placement; "page": a section page banner;
     * "retired": no longer shown on the site (its section was removed), so
     * the admin hides it. Kept so the stored row and enum value survive if
     * the section comes back.
     */
    group: "home" | "page" | "retired";
    page: string;
    recommendedSize: string;
    hint: string;
    defaultImageUrl: string;
  }
> = {
  HOME_HERO: {
    label: "Hero Beranda",
    group: "home",
    page: "Beranda — foto utama layar penuh di bagian paling atas",
    recommendedSize: "minimal 2560×1440px (rasio 16:9)",
    hint: "Gambar lanskap, sebaiknya langsung dari kamera — tampil penuh satu layar (object-cover), jadi foto kecil akan terlihat pecah.",
    defaultImageUrl: "/banners/hero-sehat-bareng.jpg",
  },
  HOME_SAMBUTAN: {
    label: "Kolase Foto 1",
    group: "retired",
    page: "Beranda — kolase di bawah kutipan sambutan, foto kiri (paling besar)",
    recommendedSize: "1200×900px (rasio 4:3)",
    hint: "Gambar lanskap rasio 4:3, minimal lebar 1000px.",
    defaultImageUrl: "/banners/bantuan-hewan-qurban.jpg",
  },
  HOME_COLLAGE_2: {
    label: "Kolase Foto 2",
    group: "retired",
    page: "Beranda — kolase di bawah kutipan sambutan, foto tengah",
    recommendedSize: "1000×1000px (persegi)",
    hint: "Gambar persegi, minimal 800×800px. Bagian tengah foto yang akan terlihat.",
    defaultImageUrl: "/banners/kegiatan-kesehatan.jpg",
  },
  HOME_COLLAGE_3: {
    label: "Kolase Foto 3",
    group: "retired",
    page: "Beranda — kolase di bawah kutipan sambutan, foto kanan",
    recommendedSize: "1200×900px (rasio 4:3)",
    hint: "Gambar lanskap rasio 4:3 (tampil persegi di HP), minimal lebar 1000px.",
    defaultImageUrl: "/banners/perbaikan-jalan-molore.jpg",
  },
  HOME_BINAAN_PANEL: {
    label: "Latar Panel UMKM Binaan",
    group: "retired",
    page: "Beranda — foto latar layar penuh di bagian \"Pemberdayaan UMKM Binaan\"",
    recommendedSize: "1920×1080px (rasio 16:9)",
    hint: "Gambar lanskap, minimal lebar 1600px. Sisi kiri tertutup kartu, jadi subjek sebaiknya di kanan.",
    defaultImageUrl: "/banners/parcel-lebaran.jpg",
  },
  HOME_FAQ: {
    label: "Foto FAQ",
    group: "retired",
    page: "Beranda — foto di samping daftar FAQ (hanya tampil di layar lebar)",
    recommendedSize: "900×1125px (potret 4:5)",
    hint: "Gambar potret, minimal lebar 800px.",
    defaultImageUrl: "/banners/hero-sehat-bareng.jpg",
  },
  HOME_CTA_CSR: {
    label: "Panel Ajakan — CSR",
    group: "retired",
    page: "Beranda — panel kiri di bagian \"Jadilah Bagian dari Perubahan\"",
    recommendedSize: "900×1200px (potret 3:4)",
    hint: "Gambar potret, minimal lebar 800px. Teks putih tampil di bagian bawah foto.",
    defaultImageUrl: "/banners/perbaikan-jalan-polora.jpg",
  },
  HOME_CTA_PPM: {
    label: "Panel Ajakan — PPM",
    group: "retired",
    page: "Beranda — panel tengah di bagian \"Jadilah Bagian dari Perubahan\"",
    recommendedSize: "900×1200px (potret 3:4)",
    hint: "Gambar potret, minimal lebar 800px. Teks putih tampil di bagian bawah foto.",
    defaultImageUrl: "/banners/bantuan-dana-pendidikan.jpg",
  },
  HOME_CTA_BINAAN: {
    label: "Panel Ajakan — Binaan UMKM",
    group: "retired",
    page: "Beranda — panel kanan di bagian \"Jadilah Bagian dari Perubahan\"",
    recommendedSize: "900×1200px (potret 3:4)",
    hint: "Gambar potret, minimal lebar 800px. Teks putih tampil di bagian bawah foto.",
    defaultImageUrl: "/banners/bantuan-hewan-qurban.jpg",
  },
  PPM_BANNER: {
    label: "Banner PPM",
    group: "page",
    page: "/ppm — banner judul halaman",
    recommendedSize: "minimal 2560×960px (rasio ~8:3)",
    hint: "Gambar lanskap lebar, sebaiknya langsung dari kamera (otomatis dikecilkan).",
    defaultImageUrl: "/banners/bantuan-dana-pendidikan.jpg",
  },
  CSR_BANNER: {
    label: "Banner CSR",
    group: "page",
    page: "/csr — banner judul halaman",
    recommendedSize: "minimal 2560×960px (rasio ~8:3)",
    hint: "Gambar lanskap lebar, sebaiknya langsung dari kamera (otomatis dikecilkan).",
    defaultImageUrl: "/banners/perbaikan-jalan-polora.jpg",
  },
  BINAAN_BANNER: {
    label: "Banner Binaan UMKM",
    group: "page",
    page: "/binaan — banner judul halaman",
    recommendedSize: "minimal 2560×960px (rasio ~8:3)",
    hint: "Gambar lanskap lebar, sebaiknya langsung dari kamera (otomatis dikecilkan).",
    defaultImageUrl: "/banners/parcel-lebaran.jpg",
  },
  PENGHARGAAN_BANNER: {
    label: "Banner Penghargaan",
    group: "page",
    page: "/penghargaan — banner judul halaman",
    recommendedSize: "minimal 2560×960px (rasio ~8:3)",
    hint: "Gambar lanskap lebar, sebaiknya langsung dari kamera (otomatis dikecilkan).",
    defaultImageUrl: "/banners/perbaikan-jalan-molore.jpg",
  },
  GALERI_KEGIATAN_BANNER: {
    label: "Banner Galeri Kegiatan",
    group: "page",
    page: "/galeri-kegiatan — banner judul halaman",
    recommendedSize: "minimal 2560×960px (rasio ~8:3)",
    hint: "Gambar lanskap lebar, sebaiknya langsung dari kamera (otomatis dikecilkan).",
    defaultImageUrl: "/banners/kegiatan-kesehatan.jpg",
  },
};

export const HERO_SLOT_ORDER = Object.keys(HERO_SLOTS) as HeroSlot[];

/**
 * All stored hero images, keyed by slot. Cached as one row set rather than
 * per slot: there are only seven, and every content page needs one of them.
 */
const getStoredHeroImages = unstable_cache(
  async (): Promise<Partial<Record<HeroSlot, string>>> => {
    const rows = await prisma.heroImage.findMany({
      select: { slot: true, imageUrl: true },
    });
    return Object.fromEntries(rows.map((row) => [row.slot, row.imageUrl]));
  },
  ["hero-images"],
  { tags: [CACHE_TAGS.hero] }
);

/** Fetches the current image URL for a single hero slot, with a hardcoded fallback. */
export async function getHeroImageUrl(slot: HeroSlot): Promise<string> {
  const stored = await getStoredHeroImages();
  return stored[slot] ?? HERO_SLOTS[slot].defaultImageUrl;
}

/** Fetches image URLs for several hero slots at once (e.g. the homepage needs two). */
export async function getHeroImageUrls(
  slots: HeroSlot[]
): Promise<Record<HeroSlot, string>> {
  const stored = await getStoredHeroImages();
  return Object.fromEntries(
    slots.map((slot) => [slot, stored[slot] ?? HERO_SLOTS[slot].defaultImageUrl])
  ) as Record<HeroSlot, string>;
}
