import Image from "@/components/ui/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";
import { parseId } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Edit Produk",
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flash?: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const [product, groups] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.binaanGroup.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Edit Produk</h1>

      <FormAlert code={searchParams.flash} />

      <form action={updateProductWithId} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama Produk</label>
          <input id="name" name="name" required defaultValue={product.name} className={inputClass} />
        </div>
        <div>
          <label htmlFor="groupId" className={labelClass}>Kelompok Binaan</label>
          <select id="groupId" name="groupId" required defaultValue={product.groupId} className={inputClass}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="flavor" className={labelClass}>
            Varian <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input id="flavor" name="flavor" defaultValue={product.flavor ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Deskripsi</label>
          <textarea id="description" name="description" required rows={4} defaultValue={product.description} className={inputClass} />
        </div>

        <div>
          <span className={labelClass}>Foto Saat Ini</span>
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-slate-100">
            <Image src={product.imageUrl} alt={product.name} fill sizes="64px" className="object-cover" />
          </div>
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>
            Ganti Foto <span className="font-normal text-slate-400">(kosongkan jika tidak diganti)</span>
          </label>
          <ImageFileInput className={fileInputClass} />
          <PhotoRequirements
            items={[
              "Format: JPG, PNG, WEBP, atau GIF",
              "Foto langsung dari kamera boleh (JPG/HEIC) — otomatis dikecilkan (maks. 60MB)",
              "Rasio persegi (1:1) disarankan, minimal 400x400px, latar bersih",
            ]}
          />
        </div>
        <div>
          <label htmlFor="waNumber" className={labelClass}>Nomor WhatsApp</label>
          <input id="waNumber" name="waNumber" required defaultValue={product.waNumber} className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/products" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
