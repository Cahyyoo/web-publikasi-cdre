import Image from "@/components/ui/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { updateGalleryItem } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";
import { parseId } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Edit Item Galeri",
};

export default async function EditGalleryItemPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flash?: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const item = await prisma.gallery.findUnique({
    where: { id },
  });
  if (!item) notFound();

  const updateGalleryItemWithId = updateGalleryItem.bind(null, item.id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Edit Item Galeri</h1>

      <FormAlert code={searchParams.flash} />

      <form action={updateGalleryItemWithId} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className={labelClass}>Judul</label>
          <input id="title" name="title" required defaultValue={item.title} className={inputClass} />
        </div>
        <div>
          <label htmlFor="period" className={labelClass}>
            Periode/Tahun <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input id="period" name="period" defaultValue={item.period ?? ""} className={inputClass} />
        </div>

        <div>
          <span className={labelClass}>Gambar Saat Ini</span>
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-slate-100">
            <Image src={item.imageUrl} alt={item.title} fill sizes="64px" className="object-cover" />
          </div>
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>
            Ganti Gambar <span className="font-normal text-slate-400">(kosongkan jika tidak diganti)</span>
          </label>
          <ImageFileInput className={fileInputClass} />
          <PhotoRequirements
            items={[
              "Format: JPG, PNG, WEBP, atau GIF",
              "Foto langsung dari kamera boleh (JPG/HEIC) — otomatis dikecilkan (maks. 60MB)",
              "Rasio bebas (potret/lanskap), minimal 600px pada sisi terpanjang",
            ]}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/gallery" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
