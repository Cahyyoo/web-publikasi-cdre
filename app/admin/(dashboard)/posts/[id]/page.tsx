import Image from "@/components/ui/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/utils";
import { updatePost } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";
import { parseId } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Edit Artikel",
};

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flash?: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900">Edit Artikel</h1>

      <FormAlert code={searchParams.flash} />

      <form action={updatePostWithId} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className={labelClass}>Judul</label>
          <input id="title" name="title" required defaultValue={post.title} className={inputClass} />
        </div>
        <div>
          <label htmlFor="slug" className={labelClass}>Slug</label>
          <input id="slug" name="slug" defaultValue={post.slug} className={inputClass} />
        </div>
        <div>
          <label htmlFor="categoryId" className={labelClass}>Kategori</label>
          <select id="categoryId" name="categoryId" required defaultValue={post.categoryId} className={inputClass}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.type} &middot; {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={labelClass}>Thumbnail Saat Ini</span>
          <div className="relative h-24 w-36 overflow-hidden rounded-md bg-slate-100">
            <Image src={post.thumbnailUrl} alt={post.title} fill sizes="144px" className="object-cover" />
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
              "Rekomendasi: gambar lanskap minimal 1200×800px — dipakai sebagai thumbnail kartu dan gambar utama di halaman artikel",
            ]}
          />
        </div>
        <div>
          <label htmlFor="publishedAt" className={labelClass}>Tanggal Publikasi</label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="date"
            required
            defaultValue={toDateInputValue(post.publishedAt)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Konten</label>
          <RichTextEditor name="content" defaultValue={post.content} />
        </div>
        <p className="text-xs text-slate-400">
          Total dilihat: {post.viewCount.toLocaleString("id-ID")} kali (bertambah otomatis, tidak bisa diedit manual).
        </p>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/posts" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
