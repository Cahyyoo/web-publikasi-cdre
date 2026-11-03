import Link from "next/link";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { createActivityPhoto } from "../actions";
import { ACTIVITY_PHOTO_REQUIREMENTS } from "../photo-requirements";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Tambah Foto Kegiatan",
};

export default async function NewActivityPhotoPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const categories = await prisma.activityCategory.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Foto Kegiatan</h1>

      <FormAlert code={searchParams.flash} />

      {categories.length === 0 ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Belum ada kategori kegiatan. Tambahkan kategori terlebih dahulu di menu{" "}
          <Link href="/admin/activity-categories" className="font-semibold underline">
            Kategori Kegiatan
          </Link>
          .
        </p>
      ) : (
        <form action={createActivityPhoto} className="mt-6 space-y-4">
          <div>
            <label htmlFor="categoryId" className={labelClass}>Kategori</label>
            <select id="categoryId" name="categoryId" required className={inputClass} defaultValue="">
              <option value="" disabled>Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="caption" className={labelClass}>
              Keterangan <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <input id="caption" name="caption" className={inputClass} />
          </div>
          <div>
            <label htmlFor="order" className={labelClass}>
              Urutan <span className="font-normal text-slate-400">(angka lebih kecil tampil lebih dulu)</span>
            </label>
            <input id="order" name="order" type="number" defaultValue={0} className={inputClass} />
          </div>
          <div>
            <label htmlFor="photo" className={labelClass}>Gambar</label>
            <ImageFileInput required className={fileInputClass} />
            <PhotoRequirements items={ACTIVITY_PHOTO_REQUIREMENTS} />
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton>Simpan</SubmitButton>
            <Link href="/admin/activity-gallery" className={secondaryButtonClass}>Batal</Link>
          </div>
        </form>
      )}
    </div>
  );
}
