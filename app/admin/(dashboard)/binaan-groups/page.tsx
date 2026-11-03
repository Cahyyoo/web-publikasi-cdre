import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deleteBinaanGroup } from "./actions";
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
  title: "Kelompok Binaan",
};

async function getGroups() {
  return prisma.binaanGroup.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export default async function BinaanGroupsPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const groups = await getGroups();

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Kelompok Binaan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelompok UMKM binaan, mis. &ldquo;Teras Pangan Alenggo&rdquo;.
          </p>
        </div>
        <Link
          href="/admin/binaan-groups/new"
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
              <th className="px-4 py-3">Nama Kelompok</th>
              <th className="px-4 py-3">Jumlah Produk</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {groups.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-800">{item.name}</td>
                <td className="px-4 py-3 text-slate-500">{item._count.products}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/binaan-groups/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteBinaanGroup.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Belum ada kelompok binaan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
