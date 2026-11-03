import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "./actions";
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
  title: "Produk Binaan",
};

async function getProducts() {
  return prisma.product.findMany({
    include: { group: true },
    orderBy: { name: "asc" },
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const products = await getProducts();

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Produk Binaan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ditampilkan sebagai katalog di /binaan.
          </p>
        </div>
        <Link
          href="/admin/products/new"
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
              <th className="px-4 py-3">Nama Produk</th>
              <th className="px-4 py-3">Kelompok</th>
              <th className="px-4 py-3">No. WA</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="px-4 py-3">
                  <TableThumbnail src={item.imageUrl} alt={item.name} />
                </td>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">
                  {item.name}
                  {item.flavor && <span className="ml-1 text-xs text-slate-400">({item.flavor})</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{item.group.name}</td>
                <td className="px-4 py-3 text-slate-500">{item.waNumber}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/products/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteProduct.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Belum ada produk. Buat kelompok binaan terlebih dahulu sebelum menambah produk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
