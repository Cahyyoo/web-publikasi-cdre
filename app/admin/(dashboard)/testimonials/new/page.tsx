import Link from "next/link";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { createTestimonial } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Tambah Testimoni",
};

export default function NewTestimonialPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Tambah Testimoni</h1>

      <FormAlert code={searchParams.flash} />

      <form action={createTestimonial} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama</label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="title" className={labelClass}>Jabatan</label>
          <input id="title" name="title" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="quote" className={labelClass}>Isi Testimonial</label>
          <textarea id="quote" name="quote" required rows={4} className={inputClass} />
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>Foto Profil</label>
          <ImageFileInput required className={fileInputClass} />
          <PhotoRequirements
            items={[
              "Format: JPG, PNG, WEBP, atau GIF",
              "Foto langsung dari kamera boleh (JPG/HEIC) — otomatis dikecilkan (maks. 60MB)",
              "Rasio persegi (1:1) disarankan, minimal 300x300px",
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <input id="isPublished" name="isPublished" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
          <label htmlFor="isPublished" className="text-sm text-slate-700">Tampilkan di halaman Beranda</label>
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan</SubmitButton>
          <Link href="/admin/testimonials" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
