import Link from "next/link";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { createGalleryItem } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Tambah Item Galeri",
};

export default function NewGalleryItemPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Item Galeri</h1>

      <FormAlert code={searchParams.flash} />

      <form action={createGalleryItem} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className={labelClass}>Judul</label>
          <input id="title" name="title" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="period" className={labelClass}>
            Periode/Tahun <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input id="period" name="period" placeholder="2024" className={inputClass} />
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>Gambar</label>
          <ImageFileInput required className={fileInputClass} />
          <PhotoRequirements
            items={[
              "Format: JPG, PNG, WEBP, atau GIF",
              "Foto langsung dari kamera boleh (JPG/HEIC) — otomatis dikecilkan (maks. 60MB)",
              "Rasio bebas (potret/lanskap), minimal 600px pada sisi terpanjang",
            ]}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/admin/gallery" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
