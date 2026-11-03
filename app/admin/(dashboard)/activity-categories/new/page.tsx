import Link from "next/link";
import type { Metadata } from "next";
import { inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { createActivityCategory } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Tambah Kategori Kegiatan",
};

export default function NewActivityCategoryPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Kategori Kegiatan</h1>

      <FormAlert code={searchParams.flash} />

      <form action={createActivityCategory} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama Kategori</label>
          <input id="name" name="name" required placeholder="Kunjungan Lapangan, Pelatihan, Bakti Sosial..." className={inputClass} />
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>
            Urutan <span className="font-normal text-slate-400">(angka lebih kecil tampil lebih dulu)</span>
          </label>
          <input id="order" name="order" type="number" defaultValue={0} className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/admin/activity-categories" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
