import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deleteActivityCategory } from "./actions";
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
  title: "Kategori Galeri Kegiatan",
};

async function getActivityCategories() {
  return prisma.activityCategory.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export default async function ActivityCategoriesPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const categories = await getActivityCategories();

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kategori Galeri Kegiatan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Digunakan untuk mengelompokkan carousel foto di /galeri-kegiatan.
          </p>
        </div>
        <Link
          href="/admin/activity-categories/new"
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
              <th className="px-4 py-3">Urutan</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Jumlah Foto</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="px-4 py-3 text-slate-500">{item.order}</td>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-slate-500">{item._count.photos}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/activity-categories/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteActivityCategory.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Belum ada kategori kegiatan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
