import Link from "next/link";
import type { Metadata } from "next";
import { HERO_SLOT_ORDER, HERO_SLOTS } from "@/lib/hero-images";
import { prisma } from "@/lib/prisma";
import TableThumbnail from "@/components/admin/TableThumbnail";
import FormAlert from "@/components/ui/FormAlert";
import {
  editLinkClass,
  rowClass,
  tableClass,
  tableWrapClass,
  theadClass,
} from "@/components/admin/formStyles";

export const metadata: Metadata = {
  title: "Gambar Hero & Banner",
};

const SECTIONS = [
  {
    group: "home",
    title: "Foto Beranda",
    description: "Foto yang tampil di beranda.",
  },
  {
    group: "page",
    title: "Banner Halaman",
    description: "Banner judul di bagian atas halaman CSR, PPM, Binaan, Penghargaan dan Galeri Kegiatan.",
  },
] as const;

async function getHeroImages() {
  const rows = await prisma.heroImage.findMany();
  const bySlot = new Map(rows.map((row) => [row.slot, row]));
  return HERO_SLOT_ORDER.map((slot) => ({
    slot,
    ...HERO_SLOTS[slot],
    imageUrl: bySlot.get(slot)?.imageUrl ?? HERO_SLOTS[slot].defaultImageUrl,
    updatedAt: bySlot.get(slot)?.updatedAt ?? null,
  }));
}

export default async function HeroImagesAdminPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const items = await getHeroImages();

  return (
    <div>
      <div>
        <h1 className="text-xl font-bold text-slate-900">Gambar Hero &amp; Banner</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gambar-gambar utama yang tampil di halaman publik. Setiap slot sudah
          tetap posisinya — cukup ganti gambarnya, tidak perlu tambah/hapus baris.
        </p>
      </div>

      <FormAlert code={searchParams.flash} />

      {SECTIONS.map((section) => (
        <section key={section.group} className="mt-8">
          <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{section.description}</p>
          <div className={tableWrapClass}>
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className="px-4 py-3">Gambar</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Rekomendasi Ukuran</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items
                  .filter((item) => item.group === section.group)
                  .map((item) => (
                    <tr key={item.slot} className={rowClass}>
                      <td className="px-4 py-3">
                        <TableThumbnail src={item.imageUrl} alt={item.label} variant="wide" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.page}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.recommendedSize}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <Link
                            href={`/admin/hero-images/${item.slot}`}
                            className={editLinkClass}
                          >
                            Ganti Gambar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
