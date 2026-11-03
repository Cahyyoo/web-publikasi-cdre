"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage, resolveImage } from "@/lib/upload";
import { readInt, readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/activity-gallery";

function readFields(formData: FormData) {
  const caption = readString(formData, "caption");
  return {
    caption: caption ? caption : null,
    categoryId: readInt(formData, "categoryId"),
    order: readInt(formData, "order"),
  };
}

function revalidate() {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/galeri-kegiatan");
}

export async function createActivityPhoto(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/new`, success: "created" },
    async () => {
      const imageUrl = await resolveImage(formData, "activity-gallery");
      await prisma.activityPhoto.create({
        data: { ...readFields(formData), imageUrl },
      });
      revalidate();
    }
  );
}

export async function updateActivityPhoto(id: number, formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/${id}`, success: "updated" },
    async () => {
      const current = await prisma.activityPhoto.findUniqueOrThrow({
        where: { id },
      });
      const imageUrl = await resolveImage(
        formData,
        "activity-gallery",
        current.imageUrl
      );
      await prisma.activityPhoto.update({
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

export async function deleteActivityPhoto(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted" },
    async () => {
      await prisma.activityPhoto.delete({ where: { id } });
      revalidate();
    }
  );
}
