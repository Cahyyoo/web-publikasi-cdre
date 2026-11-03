"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage, resolveImage } from "@/lib/upload";
import { readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/gallery";

function readFields(formData: FormData) {
  const period = readString(formData, "period");
  return {
    title: readString(formData, "title"),
    type: "PENGHARGAAN" as const,
    period: period ? period : null,
  };
}

function revalidate() {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/penghargaan");
}

export async function createGalleryItem(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/new`, success: "created" },
    async () => {
      const imageUrl = await resolveImage(formData, "gallery");
      await prisma.gallery.create({
        data: { ...readFields(formData), imageUrl },
      });
      revalidate();
    }
  );
}

export async function updateGalleryItem(id: number, formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/${id}`, success: "updated" },
    async () => {
      const current = await prisma.gallery.findUniqueOrThrow({ where: { id } });
      const imageUrl = await resolveImage(formData, "gallery", current.imageUrl);
      await prisma.gallery.update({
        where: { id },
        data: { ...readFields(formData), imageUrl },
      });
      // Only when the photo actually changed: resolveImage returns the
      // existing URL untouched when no new file was chosen.
      if (imageUrl !== current.imageUrl) {
        await deleteUploadedImage(current.imageUrl);
      }
      revalidate();
    }
  );
}

export async function deleteGalleryItem(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted" },
    async () => {
      await prisma.gallery.delete({ where: { id } });
      revalidate();
    }
  );
}
