"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";
import { readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/footer";

export async function updateFooterSettings(formData: FormData) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "updated" },
    async () => {
      const data = {
        description: readString(formData, "description"),
        address: readString(formData, "address"),
        phone: readString(formData, "phone"),
        email: readString(formData, "email"),
        facebookUrl: readString(formData, "facebookUrl") || "#",
        instagramUrl: readString(formData, "instagramUrl") || "#",
        youtubeUrl: readString(formData, "youtubeUrl") || "#",
      };

      await prisma.footerSettings.upsert({
        where: { id: 1 },
        create: { id: 1, ...data },
        update: data,
      });

      revalidateTag(CACHE_TAGS.footer);
      revalidatePath(ADMIN_PATH);
      // The footer renders in the public layout, so every public route needs it.
      revalidatePath("/", "layout");
    }
  );
}
