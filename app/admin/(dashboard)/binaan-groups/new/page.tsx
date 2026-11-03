import Link from "next/link";
import type { Metadata } from "next";
import { inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { createBinaanGroup } from "../actions";
import SubmitButton from "@/components/ui/SubmitButton";
import FormAlert from "@/components/ui/FormAlert";

export const metadata: Metadata = {
  title: "Tambah Kelompok Binaan",
};

export default function NewBinaanGroupPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Kelompok Binaan</h1>

      <FormAlert code={searchParams.flash} />

      <form action={createBinaanGroup} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama Kelompok</label>
          <input id="name" name="name" required placeholder="Teras Pangan Alenggo" className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/admin/binaan-groups" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
