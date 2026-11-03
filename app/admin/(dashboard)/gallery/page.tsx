import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deleteGalleryItem } from "./actions";
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
  title: "Galeri Penghargaan",
};

async function getGalleryItems() {
  return prisma.gallery.findMany({ orderBy: { id: "desc" } });
}

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const items = await getGalleryItems();

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Galeri Penghargaan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ditampilkan di /penghargaan.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
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
              <th className="px-4 py-3">Periode</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="px-4 py-3">
                  <TableThumbnail src={item.imageUrl} alt={item.title} />
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">{item.title}</td>
                <td className="px-4 py-3 text-slate-500">{item.period ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/gallery/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteGalleryItem.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Belum ada item galeri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
