"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage, resolveImage } from "@/lib/upload";
import { readBoolean, readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/testimonials";

function readFields(formData: FormData) {
  return {
    name: readString(formData, "name"),
    title: readString(formData, "title"),
    quote: readString(formData, "quote"),
    isPublished: readBoolean(formData, "isPublished"),
  };
}

function revalidate() {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/");
}

export async function createTestimonial(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/new`, success: "created" },
    async () => {
      const imageUrl = await resolveImage(formData, "testimonials");
      await prisma.testimonial.create({
        data: { ...readFields(formData), imageUrl },
      });
      revalidate();
    }
  );
}

export async function updateTestimonial(id: number, formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/${id}`, success: "updated" },
    async () => {
      const current = await prisma.testimonial.findUniqueOrThrow({
        where: { id },
      });
      const imageUrl = await resolveImage(
        formData,
        "testimonials",
        current.imageUrl
      );
      await prisma.testimonial.update({
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

export async function deleteTestimonial(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted" },
    async () => {
      await prisma.testimonial.delete({ where: { id } });
      revalidate();
    }
  );
}

export async function toggleTestimonialPublished(
  id: number,
  nextValue: boolean
) {
  return runAction(
    {
      onSuccess: ADMIN_PATH,
      onError: ADMIN_PATH,
      success: nextValue ? "published" : "unpublished",
    },
    async () => {
      await prisma.testimonial.update({
        where: { id },
        data: { isPublished: nextValue },
      });
      revalidate();
    }
  );
}
