"use server";

import { HeroSlot } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage, resolveImage } from "@/lib/upload";

const ADMIN_PATH = "/admin/hero-images";

// Public path revalidated for each slot after its image changes.
const REVALIDATE_PATH: Record<HeroSlot, string> = {
  HOME_HERO: "/",
  HOME_SAMBUTAN: "/",
  HOME_COLLAGE_2: "/",
  HOME_COLLAGE_3: "/",
  HOME_BINAAN_PANEL: "/",
  HOME_FAQ: "/",
  HOME_CTA_CSR: "/",
  HOME_CTA_PPM: "/",
  HOME_CTA_BINAAN: "/",
  PPM_BANNER: "/ppm",
  CSR_BANNER: "/csr",
  BINAAN_BANNER: "/binaan",
  PENGHARGAAN_BANNER: "/penghargaan",
  GALERI_KEGIATAN_BANNER: "/galeri-kegiatan",
};

export async function updateHeroImage(slot: HeroSlot, formData: FormData) {
  return runAction(
    {
      onSuccess: ADMIN_PATH,
      onError: `${ADMIN_PATH}/${slot}`,
      success: "updated",
    },
    async () => {
      const current = await prisma.heroImage.findUnique({ where: { slot } });
      const imageUrl = await resolveImage(formData, "hero", current?.imageUrl);

      await prisma.heroImage.upsert({
        where: { slot },
        create: { slot, imageUrl },
        update: { imageUrl },
      });

      if (imageUrl !== current?.imageUrl) {
        await deleteUploadedImage(current?.imageUrl);
      }

      revalidateTag(CACHE_TAGS.hero);
      revalidatePath(ADMIN_PATH);
      revalidatePath(REVALIDATE_PATH[slot]);
    }
  );
}
