"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { readInt, readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/activity-categories";

const DUPLICATE = { duplicate: "duplicate-activity-category" } as const;
const IN_USE = { "in-use": "in-use-activity-category" } as const;

function readFields(formData: FormData) {
  return {
    name: readString(formData, "name"),
    order: readInt(formData, "order"),
  };
}

function revalidate() {
  revalidateTag(CACHE_TAGS.nav);
  revalidatePath(ADMIN_PATH);
  revalidatePath("/galeri-kegiatan");
}

export async function createActivityCategory(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/new`, success: "created", errorOverrides: DUPLICATE },
    async () => {
      await prisma.activityCategory.create({ data: readFields(formData) });
      revalidate();
    }
  );
}

export async function updateActivityCategory(id: number, formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/${id}`, success: "updated", errorOverrides: DUPLICATE },
    async () => {
      await prisma.activityCategory.update({
        where: { id },
        data: readFields(formData),
      });
      revalidate();
    }
  );
}

export async function deleteActivityCategory(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted", errorOverrides: IN_USE },
    async () => {
      await prisma.activityCategory.delete({ where: { id } });
      revalidate();
    }
  );
}
