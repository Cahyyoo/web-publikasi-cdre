import Link from "next/link";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Tambah Produk",
};

async function getGroups() {
  return prisma.binaanGroup.findMany({ orderBy: { name: "asc" } });
}

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const groups = await getGroups();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Produk</h1>

      <FormAlert code={searchParams.flash} />

      {groups.length === 0 ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Belum ada kelompok binaan.{" "}
          <Link href="/admin/binaan-groups/new" className="font-semibold underline">
            Buat kelompok
          </Link>{" "}
          terlebih dahulu.
        </p>
      ) : (
        <form action={createProduct} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>Nama Produk</label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="groupId" className={labelClass}>Kelompok Binaan</label>
            <select id="groupId" name="groupId" required className={inputClass} defaultValue="">
              <option value="" disabled>Pilih kelompok</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="flavor" className={labelClass}>
              Varian <span className="font-normal text-slate-400">(opsional)</span>
            </label>
            <input id="flavor" name="flavor" placeholder="Original, Pedas, ..." className={inputClass} />
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>Deskripsi</label>
            <textarea id="description" name="description" required rows={4} className={inputClass} />
          </div>
          <div>
            <label htmlFor="photo" className={labelClass}>Foto Produk</label>
            <ImageFileInput required className={fileInputClass} />
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
            <input id="waNumber" name="waNumber" required placeholder="08xxxxxxxxxx" className={inputClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton>Simpan</SubmitButton>
            <Link href="/admin/products" className={secondaryButtonClass}>Batal</Link>
          </div>
        </form>
      )}
    </div>
  );
}
