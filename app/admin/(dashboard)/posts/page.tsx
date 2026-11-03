import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { formatDate, formatViews } from "@/lib/utils";
import { deletePost } from "./actions";
import TableThumbnail from "@/components/admin/TableThumbnail";
import FormAlert from "@/components/ui/FormAlert";
import {
  addButtonClass,
  editLinkClass,
  pageHeaderClass,
  rowClass,
  tableClass,
  tableWrapClass,
  theadClass,
} from "@/components/admin/formStyles";

export const metadata: Metadata = {
  title: "Artikel PPM & CSR",
};

async function getPosts() {
  return prisma.post.findMany({
    // The table only shows these columns; `include: { category: true }` would
    // also drag every post's full HTML `content` across the wire.
    select: {
      id: true,
      title: true,
      thumbnailUrl: true,
      publishedAt: true,
      viewCount: true,
      category: { select: { name: true, type: true } },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const posts = await getPosts();

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Artikel PPM & CSR</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ditampilkan di /ppm dan /csr sesuai tipe kategorinya.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className={addButtonClass}
        >
          <Plus size={16} /> Tambah
        </Link>
      </div>

      <FormAlert code={searchParams.flash} />

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className="px-4 py-3">Gambar</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="px-4 py-3">
                  <TableThumbnail src={item.thumbnailUrl} alt={item.title} variant="wide" />
                </td>
                <td className="max-w-sm truncate px-4 py-3 font-medium text-slate-800">
                  {item.title}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    {item.category.type} &middot; {item.category.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(item.publishedAt)}</td>
                <td className="px-4 py-3 text-slate-500">{formatViews(item.viewCount)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/posts/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deletePost.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Belum ada artikel. Buat kategori terlebih dahulu sebelum menambah artikel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
