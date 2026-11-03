import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { updateBinaanGroup } from "../actions";
import SubmitButton from "@/components/ui/SubmitButton";
import FormAlert from "@/components/ui/FormAlert";
import { parseId } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Edit Kelompok Binaan",
};

export default async function EditBinaanGroupPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flash?: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const group = await prisma.binaanGroup.findUnique({
    where: { id },
  });
  if (!group) notFound();

  const updateBinaanGroupWithId = updateBinaanGroup.bind(null, group.id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Edit Kelompok Binaan</h1>

      <FormAlert code={searchParams.flash} />

      <form action={updateBinaanGroupWithId} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama Kelompok</label>
          <input id="name" name="name" required defaultValue={group.name} className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/binaan-groups" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
