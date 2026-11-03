import type { Metadata } from "next";
import SubmitButton from "@/components/ui/SubmitButton";
import FormAlert from "@/components/ui/FormAlert";
import SectionBadge from "@/components/ui/SectionBadge";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { PUBLIC_MAX_UPLOAD_BYTES } from "@/lib/upload-limits";
import { submitTestimonial } from "./actions";

export const metadata: Metadata = {
  title: "Bagikan Testimoni Anda",
  description:
    "Bagikan pengalaman Anda bersama PT Stargate Pasific Resource.",
};

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/10";
const labelClass = "mb-1.5 block text-sm font-medium text-brand-dark";

export default function TestimoniFormPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
      <SectionBadge>Testimoni</SectionBadge>
      <h1 className="mt-4 font-serif text-3xl font-medium text-brand sm:text-4xl">
        Bagikan Testimoni Anda
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-500">
        Ceritakan pengalaman Anda bersama PT Stargate Pasific Resource.
        Testimoni akan ditinjau terlebih dahulu oleh tim kami sebelum tampil
        di halaman Beranda.
      </p>

      <FormAlert code={searchParams.flash} />

      <form action={submitTestimonial} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Nama
          </label>
          <input id="name" name="name" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="title" className={labelClass}>
            Jabatan / Instansi
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="Kepala Desa, Ketua Kelompok UMKM, ..."
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="quote" className={labelClass}>
            Testimoni Anda
          </label>
          <textarea
            id="quote"
            name="quote"
            required
            rows={5}
            placeholder="Ceritakan pengalaman Anda..."
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>
            Foto{" "}
            <span className="font-normal text-stone-400">
              (opsional, JPG/PNG/WEBP/HEIC — foto besar otomatis dikecilkan)
            </span>
          </label>
          <ImageFileInput
            statusClassName="mt-1.5 text-xs text-stone-500"
            maxBytes={PUBLIC_MAX_UPLOAD_BYTES}
            className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark`}
          />
        </div>

        <SubmitButton
          pendingLabel="Mengirim..."
          className="w-full rounded-xl bg-brand px-4 py-3 font-serif text-base font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Kirim Testimoni
        </SubmitButton>
      </form>
    </div>
  );
}
