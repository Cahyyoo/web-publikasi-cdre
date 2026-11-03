"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/binaan-groups";

const IN_USE = { "in-use": "in-use-binaan-group" } as const;

function revalidate() {
  revalidateTag(CACHE_TAGS.nav);
  revalidatePath(ADMIN_PATH);
  revalidatePath("/binaan");
}

export async function createBinaanGroup(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/new`, success: "created" },
    async () => {
      await prisma.binaanGroup.create({
        data: { name: readString(formData, "name") },
      });
      revalidate();
    }
  );
}

export async function updateBinaanGroup(id: number, formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/${id}`, success: "updated" },
    async () => {
      await prisma.binaanGroup.update({
        where: { id },
        data: { name: readString(formData, "name") },
      });
      revalidate();
    }
  );
}

export async function deleteBinaanGroup(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted", errorOverrides: IN_USE },
    async () => {
      await prisma.binaanGroup.delete({ where: { id } });
      revalidate();
    }
  );
}
