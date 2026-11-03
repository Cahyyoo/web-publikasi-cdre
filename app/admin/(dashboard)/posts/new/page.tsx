import Link from "next/link";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/utils";
import { createPost } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Tambah Artikel",
};

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const categories = await getCategories();
  const today = toDateInputValue(new Date());

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Artikel</h1>

      <FormAlert code={searchParams.flash} />

      {categories.length === 0 ? (
        <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Belum ada kategori.{" "}
          <Link href="/admin/categories/new" className="font-semibold underline">
            Buat kategori
          </Link>{" "}
          terlebih dahulu.
        </p>
      ) : (
        <form action={createPost} className="mt-6 space-y-4">
          <div>
            <label htmlFor="title" className={labelClass}>Judul</label>
            <input id="title" name="title" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug <span className="font-normal text-slate-400">(opsional, otomatis dari judul jika kosong)</span>
            </label>
            <input id="slug" name="slug" placeholder="bantuan-beasiswa-pelajar" className={inputClass} />
          </div>
          <div>
            <label htmlFor="categoryId" className={labelClass}>Kategori</label>
            <select id="categoryId" name="categoryId" required className={inputClass} defaultValue="">
              <option value="" disabled>Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.type} &middot; {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="photo" className={labelClass}>Gambar Thumbnail</label>
            <ImageFileInput required className={fileInputClass} />
            <PhotoRequirements
              items={[
                "Format: JPG, PNG, WEBP, atau GIF",
                "Foto langsung dari kamera boleh (JPG/HEIC) — otomatis dikecilkan (maks. 60MB)",
                "Rekomendasi: gambar lanskap minimal 1200×800px — dipakai sebagai thumbnail kartu dan gambar utama di halaman artikel",
              ]}
            />
          </div>
          <div>
            <label htmlFor="publishedAt" className={labelClass}>Tanggal Publikasi</label>
            <input id="publishedAt" name="publishedAt" type="date" required defaultValue={today} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Konten</label>
            <RichTextEditor name="content" />
          </div>

          <div className="flex gap-3 pt-2">
            <SubmitButton>Simpan</SubmitButton>
            <Link href="/admin/posts" className={secondaryButtonClass}>Batal</Link>
          </div>
        </form>
      )}
    </div>
  );
}
