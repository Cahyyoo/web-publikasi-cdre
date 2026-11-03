import { prisma } from "@/lib/prisma";
import type { CategoryType } from "@prisma/client";

const PAGE_SIZE = 8;

/**
 * Posts dated in the future stay hidden from the public site until that date,
 * so an admin can schedule an article ahead of time. Admin pages don't use it.
 */
export function publishedFilter() {
  return { publishedAt: { lte: new Date() } };
}

export async function getPostsByType(
  type: CategoryType,
  page: number,
  categoryId?: number
) {
  const where = {
    ...publishedFilter(),
    category: {
      type,
      ...(categoryId ? { id: categoryId } : {}),
    },
  };

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      // Only what PostCard renders. `include: { category: true }` pulled the
      // full @db.Text article body for all 8 cards and threw it away.
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnailUrl: true,
        publishedAt: true,
        viewCount: true,
        category: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  };
}
