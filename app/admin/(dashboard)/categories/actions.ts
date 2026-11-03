"use server";

import { CategoryType } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { readInt, readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/categories";

// Context-specific copy: the generic "duplicate"/"in-use" wording loses the
// detail that used to be hand-written into each page.
const DUPLICATE = { duplicate: "duplicate-category" } as const;
const IN_USE = { "in-use": "in-use-category" } as const;

function readFields(formData: FormData) {
  const rawType = readString(formData, "type");
  return {
    name: readString(formData, "name"),
    // Validated rather than cast: a hand-crafted POST with type=BOGUS used to
    // pass TypeScript and reach Prisma as an opaque 500.
    type: rawType in CategoryType ? (rawType as CategoryType) : CategoryType.PPM,
    order: readInt(formData, "order"),
  };
}

function revalidate() {
  revalidateTag(CACHE_TAGS.nav);
  revalidatePath(ADMIN_PATH);
  // Category names also appear on the homepage's featured-post cards.
  revalidatePath("/");
  revalidatePath("/ppm");
  revalidatePath("/csr");
}

export async function createCategory(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/new`, success: "created", errorOverrides: DUPLICATE },
    async () => {
      await prisma.category.create({ data: readFields(formData) });
      revalidate();
    }
  );
}

export async function updateCategory(id: number, formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: `${ADMIN_PATH}/${id}`, success: "updated", errorOverrides: DUPLICATE },
    async () => {
      await prisma.category.update({ where: { id }, data: readFields(formData) });
      revalidate();
    }
  );
}

export async function deleteCategory(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted", errorOverrides: IN_USE },
    async () => {
      await prisma.category.delete({ where: { id } });
      revalidate();
    }
  );
}
