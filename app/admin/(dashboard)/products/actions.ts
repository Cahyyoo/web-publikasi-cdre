"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage, resolveImage } from "@/lib/upload";
import { readInt, readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/products";

function readFields(formData: FormData) {
  const flavor = readString(formData, "flavor");
  return {
    name: readString(formData, "name"),
    groupId: readInt(formData, "groupId"),
    flavor: flavor ? flavor : null,
    description: readString(formData, "description"),
    waNumber: readString(formData, "waNumber"),
  };
}

function revalidate() {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/binaan");
}

export async function createProduct(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/new`, success: "created" },
    async () => {
      const imageUrl = await resolveImage(formData, "products");
      await prisma.product.create({
        data: { ...readFields(formData), imageUrl },
      });
      revalidate();
    }
  );
}

export async function updateProduct(id: number, formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/${id}`, success: "updated" },
    async () => {
      const current = await prisma.product.findUniqueOrThrow({ where: { id } });
      const imageUrl = await resolveImage(formData, "products", current.imageUrl);
      await prisma.product.update({
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

export async function deleteProduct(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted" },
    async () => {
      await prisma.product.delete({ where: { id } });
      revalidate();
    }
  );
}
