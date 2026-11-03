"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/lib/action-helpers";
import { prisma } from "@/lib/prisma";
import { deleteUploadedImage, resolveImage } from "@/lib/upload";
import { slugify } from "@/lib/utils";
import { readInt, readString } from "@/lib/forms";

const ADMIN_PATH = "/admin/posts";

// The only unique constraint on Post is `slug`, so a P2002 here is always a
// slug clash and deserves a more specific message than the generic one.
const SLUG_CLASH = { duplicate: "duplicate-slug" } as const;

function readFields(formData: FormData) {
  return {
    title: readString(formData, "title"),
    slug: readString(formData, "slug"),
    content: readString(formData, "content"),
    categoryId: readInt(formData, "categoryId"),
    // A bare "YYYY-MM-DD" parses as UTC midnight, i.e. 07:00 WIB — which would
    // keep an article dated today hidden all morning (see publishedFilter).
    // The explicit time makes it local midnight instead.
    publishedAt: new Date(`${readString(formData, "publishedAt")}T00:00:00`),
  };
}

function resolveSlug(fields: ReturnType<typeof readFields>) {
  return fields.slug.trim() ? slugify(fields.slug) : slugify(fields.title);
}

function revalidate(slug?: string) {
  revalidatePath(ADMIN_PATH);
  // FeaturedPosts on the homepage derives from this content.
  revalidatePath("/");
  revalidatePath("/ppm");
  revalidatePath("/csr");
  if (slug) revalidatePath(`/artikel/${slug}`);
}

export async function createPost(formData: FormData) {
  return runAction(
    {
      onSuccess: ADMIN_PATH,
      onError: `${ADMIN_PATH}/new`,
      success: "created",
      errorOverrides: SLUG_CLASH,
    },
    async () => {
      const fields = readFields(formData);
      const slug = resolveSlug(fields);
      const thumbnailUrl = await resolveImage(formData, "posts");
      await prisma.post.create({ data: { ...fields, slug, thumbnailUrl } });
      revalidate();
    }
  );
}

export async function updatePost(id: number, formData: FormData) {
  return runAction(
    {
      onSuccess: ADMIN_PATH,
      onError: `${ADMIN_PATH}/${id}`,
      success: "updated",
      errorOverrides: SLUG_CLASH,
    },
    async () => {
      const fields = readFields(formData);
      const slug = resolveSlug(fields);
      const current = await prisma.post.findUniqueOrThrow({ where: { id } });
      const thumbnailUrl = await resolveImage(
        formData,
        "posts",
        current.thumbnailUrl
      );
      await prisma.post.update({
        where: { id },
        data: { ...fields, slug, thumbnailUrl },
      });
      if (thumbnailUrl !== current.thumbnailUrl) {
        await deleteUploadedImage(current.thumbnailUrl);
      }
      revalidate(slug);
    }
  );
}

export async function deletePost(id: number) {
  return runAction(
    { onSuccess: ADMIN_PATH, onError: ADMIN_PATH, success: "deleted" },
    async () => {
      const deleted = await prisma.post.delete({ where: { id } });
      revalidate(deleted.slug);
    }
  );
}
