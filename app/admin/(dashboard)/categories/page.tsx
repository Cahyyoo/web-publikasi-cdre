import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "./actions";
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
  title: "Kategori",
};

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: [{ type: "asc" }, { order: "asc" }, { name: "asc" }],
  });
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const categories = await getCategories();

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kategori PPM & CSR</h1>
          <p className="mt-1 text-sm text-slate-500">
            Digunakan untuk mengelompokkan artikel di /ppm dan /csr.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
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
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Jumlah Artikel</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="px-4 py-3 text-slate-500">{item.order}</td>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">{item.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{item._count.posts}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/categories/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteCategory.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Belum ada kategori.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
