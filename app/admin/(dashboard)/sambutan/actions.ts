"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/sambutan";

export async function updateSambutan(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "updated" },
    async () => {
      const quote = readString(formData, "quote");
      const description = readString(formData, "description");

      await prisma.sambutan.upsert({
        where: { id: 1 },
        create: { id: 1, quote, description },
        update: { quote, description },
      });

      revalidateTag(CACHE_TAGS.sambutan);
      revalidatePath(ADMIN_PATH);
      revalidatePath("/");
    }
  );
}
