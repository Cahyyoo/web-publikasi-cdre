import Link from "next/link";
import type { Metadata } from "next";
import { inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { createCategory } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Tambah Kategori",
};

export default function NewCategoryPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Kategori</h1>

      <FormAlert code={searchParams.flash} />

      <form action={createCategory} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama Kategori</label>
          <input id="name" name="name" required placeholder="Pendidikan, Kesehatan, Lingkungan..." className={inputClass} />
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>Tipe</label>
          <select id="type" name="type" required className={inputClass} defaultValue="PPM">
            <option value="PPM">PPM</option>
            <option value="CSR">CSR</option>
          </select>
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>
            Urutan <span className="font-normal text-slate-400">(angka lebih kecil tampil lebih dulu)</span>
          </label>
          <input id="order" name="order" type="number" defaultValue={0} className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/admin/categories" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
