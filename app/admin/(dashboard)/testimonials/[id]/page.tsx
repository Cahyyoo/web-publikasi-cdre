import Image from "@/components/ui/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, inputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { prisma } from "@/lib/prisma";
import { updateTestimonial } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";
import { parseId } from "@/lib/forms";

export const metadata: Metadata = {
  title: "Edit Testimoni",
};

export default async function EditTestimonialPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { flash?: string };
}) {
  const id = parseId(params.id);
  if (id === null) notFound();

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  });
  if (!testimonial) notFound();

  const updateTestimonialWithId = updateTestimonial.bind(null, testimonial.id);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Edit Testimoni</h1>

      <FormAlert code={searchParams.flash} />

      <form action={updateTestimonialWithId} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nama</label>
          <input id="name" name="name" required defaultValue={testimonial.name} className={inputClass} />
        </div>
        <div>
          <label htmlFor="title" className={labelClass}>Jabatan</label>
          <input id="title" name="title" required defaultValue={testimonial.title} className={inputClass} />
        </div>
        <div>
          <label htmlFor="quote" className={labelClass}>Isi Testimonial</label>
          <textarea id="quote" name="quote" required rows={4} defaultValue={testimonial.quote} className={inputClass} />
        </div>

        <div>
          <span className={labelClass}>Foto Saat Ini</span>
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
            <Image src={testimonial.imageUrl} alt={testimonial.name} fill sizes="64px" className="object-cover" />
          </div>
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>
            Ganti Foto <span className="font-normal text-slate-400">(kosongkan jika tidak diganti)</span>
          </label>
          <ImageFileInput className={fileInputClass} />
          <PhotoRequirements
            items={[
              "Format: JPG, PNG, WEBP, atau GIF",
              "Foto langsung dari kamera boleh (JPG/HEIC) — otomatis dikecilkan (maks. 60MB)",
              "Rasio persegi (1:1) disarankan, minimal 300x300px",
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <input id="isPublished" name="isPublished" type="checkbox" defaultChecked={testimonial.isPublished} className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand" />
          <label htmlFor="isPublished" className="text-sm text-slate-700">Tampilkan di halaman Beranda</label>
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/testimonials" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
