import Image from "@/components/ui/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { updateActivityPhoto } from "../actions";
import { ACTIVITY_PHOTO_REQUIREMENTS } from "../photo-requirements";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";
import { parseId } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Edit Foto Kegiatan",
};

export default async function EditActivityPhotoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flash?: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const [item, categories] = await Promise.all([
    prisma.activityPhoto.findUnique({ where: { id } }),
    prisma.activityCategory.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
  ]);
  if (!item) notFound();

  const updateActivityPhotoWithId = updateActivityPhoto.bind(null, item.id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Edit Foto Kegiatan</h1>

      <FormAlert code={searchParams.flash} />

      <form action={updateActivityPhotoWithId} className="mt-6 space-y-4">
        <div>
          <label htmlFor="categoryId" className={labelClass}>Kategori</label>
          <select id="categoryId" name="categoryId" required defaultValue={item.categoryId} className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="caption" className={labelClass}>
            Keterangan <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input id="caption" name="caption" defaultValue={item.caption ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>
            Urutan <span className="font-normal text-slate-400">(angka lebih kecil tampil lebih dulu)</span>
          </label>
          <input id="order" name="order" type="number" defaultValue={item.order} className={inputClass} />
        </div>

        <div>
          <span className={labelClass}>
            Gambar Saat Ini{" "}
            <span className="font-normal text-slate-400">(tampilan di carousel, 16:9)</span>
          </span>
          {/* Same frame and crop as the public carousel. */}
          <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-slate-100">
            <Image src={item.imageUrl} alt={item.caption ?? "Foto kegiatan"} fill sizes="384px" className="object-cover" />
          </div>
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>
            Ganti Gambar <span className="font-normal text-slate-400">(kosongkan jika tidak diganti)</span>
          </label>
          <ImageFileInput className={fileInputClass} />
          <PhotoRequirements items={ACTIVITY_PHOTO_REQUIREMENTS} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/activity-gallery" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
