import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deleteActivityPhoto } from "./actions";
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
  title: "Foto Galeri Kegiatan",
};

async function getActivityPhotos() {
  return prisma.activityPhoto.findMany({
    include: { category: true },
    orderBy: [{ categoryId: "asc" }, { order: "asc" }],
  });
}

export default async function ActivityGalleryAdminPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const items = await getActivityPhotos();

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Foto Galeri Kegiatan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ditampilkan sebagai carousel per kategori di /galeri-kegiatan.
          </p>
        </div>
        <Link
          href="/admin/activity-gallery/new"
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
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="px-4 py-3">
                  <TableThumbnail src={item.imageUrl} alt={item.caption ?? item.category.name} />
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">{item.caption ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    {item.category.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{item.order}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/activity-gallery/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteActivityPhoto.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Belum ada foto kegiatan. Tambahkan kategori terlebih dahulu di menu Kategori Kegiatan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
