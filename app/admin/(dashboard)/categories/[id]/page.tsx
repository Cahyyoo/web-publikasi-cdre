import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { updateCategory } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";
import { parseId } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Edit Kategori",
};

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flash?: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) notFound();

  const updateCategoryWithId = updateCategory.bind(null, category.id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Edit Kategori</h1>

      <FormAlert code={searchParams.flash} />

      <form action={updateCategoryWithId} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama Kategori</label>
          <input id="name" name="name" required defaultValue={category.name} className={inputClass} />
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>Tipe</label>
          <select id="type" name="type" required defaultValue={category.type} className={inputClass}>
            <option value="PPM">PPM</option>
            <option value="CSR">CSR</option>
          </select>
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>
            Urutan <span className="font-normal text-slate-400">(angka lebih kecil tampil lebih dulu)</span>
          </label>
          <input id="order" name="order" type="number" defaultValue={category.order} className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/categories" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
