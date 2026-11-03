import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { publishedFilter } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import SectionBadge from "@/components/ui/SectionBadge";

export const metadata: Metadata = {
  title: "Hasil Pencarian",
};

async function searchPosts(query: string) {
  if (!query) return [];
  return prisma.post.findMany({
    where: { ...publishedFilter(), title: { contains: query } },
    // Only what the result list renders — without this Prisma also pulls
    // each post's full HTML `content`.
    select: { id: true, slug: true, title: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const results = query ? await searchPosts(query) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
      <SectionBadge>Pencarian</SectionBadge>
      <h1 className="mt-4 font-serif text-3xl font-medium text-brand sm:text-4xl">
        Hasil pencarian untuk &ldquo;{query}&rdquo;
      </h1>

      {results.length === 0 ? (
        <p className="mt-6 text-sm text-stone-400">Tidak ada hasil ditemukan.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {results.map((post) => (
            <li key={post.id} className="rounded-2xl bg-cream-dark/70 px-5 py-4 transition-colors hover:bg-cream-dark">
              <Link
                href={`/artikel/${post.slug}`}
                className="font-serif text-lg text-brand-dark hover:text-brand"
              >
                {post.title}
              </Link>
              <p className="mt-1 text-xs text-stone-500">{formatDate(post.publishedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
