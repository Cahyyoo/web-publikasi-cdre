import { HeroSlot } from "@prisma/client";
import Image from "@/components/ui/AppImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PhotoRequirements from "@/components/admin/PhotoRequirements";
import ImageFileInput from "@/components/ui/ImageFileInput";
import { fileInputClass, labelClass, secondaryButtonClass } from "@/components/admin/formStyles";
import { HERO_SLOTS } from "@/lib/hero-images";
import { prisma } from "@/lib/prisma";
import { updateHeroImage } from "../actions";
import FormAlert from "@/components/ui/FormAlert";
import SubmitButton from "@/components/ui/SubmitButton";

export const metadata: Metadata = {
  title: "Ganti Gambar Hero/Banner",
};

export default async function EditHeroImagePage({
  params,
  searchParams,
}: {
  params: { slot: string };
  searchParams: { flash?: string };
}) {
  const slot = params.slot as HeroSlot;
  const meta = HERO_SLOTS[slot];
  if (!meta) notFound();

  const current = await prisma.heroImage.findUnique({ where: { slot } });
  const currentImageUrl = current?.imageUrl ?? meta.defaultImageUrl;

  const updateHeroImageWithSlot = updateHeroImage.bind(null, slot);

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">{meta.label}</h1>
      <p className="mt-1 text-sm text-slate-500">{meta.page}</p>

      <FormAlert code={searchParams.flash} />

      <form action={updateHeroImageWithSlot} className="mt-6 space-y-4">
        <div>
          <span className={labelClass}>Gambar Saat Ini</span>
          <div className="relative h-28 w-full max-w-sm overflow-hidden rounded-md bg-slate-100">
            <Image src={currentImageUrl} alt={meta.label} fill sizes="384px" className="object-cover" />
          </div>
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>
            Ganti Gambar <span className="font-normal text-slate-400">(kosongkan jika tidak diganti)</span>
          </label>
          <ImageFileInput className={fileInputClass} />
          <PhotoRequirements
            items={[
              "Format: JPG, PNG, WEBP, atau GIF",
              "Foto langsung dari kamera boleh (JPG/HEIC) — otomatis dikecilkan (maks. 60MB)",
              `Rekomendasi dimensi: ${meta.recommendedSize}`,
              meta.hint,
            ]}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton>Simpan Perubahan</SubmitButton>
          <Link href="/admin/hero-images" className={secondaryButtonClass}>Batal</Link>
        </div>
      </form>
    </div>
  );
}
