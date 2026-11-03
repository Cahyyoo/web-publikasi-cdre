import { CalendarDays, Eye, Tag } from "lucide-react";
import Link from "next/link";
import Image from "@/components/ui/AppImage";
import PillButton from "@/components/ui/PillButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { prisma } from "@/lib/prisma";
import { publishedFilter } from "@/lib/posts";
import { excerpt, formatDate, formatViews } from "@/lib/utils";

async function getLatestPosts() {
  const posts = await prisma.post.findMany({
    where: publishedFilter(),
    select: {
      id: true,
      slug: true,
      title: true,
      // Only for the teaser; reduced to plain text below so the HTML body
      // never reaches the page.
      content: true,
      thumbnailUrl: true,
      publishedAt: true,
      viewCount: true,
      category: { select: { name: true, type: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });
  return posts.map(({ content, ...post }) => ({ ...post, teaser: excerpt(content) }));
}

export default async function FeaturedPosts() {
  const posts = await getLatestPosts();
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading
        align="center"
        badge="Publikasi"
        title="Kabar Terbaru dari Program Kami"
      />

      <div className="mt-14 space-y-8">
        {posts.map((post) => (
          <article
            key={post.id}
            data-reveal
            className="grid grid-cols-1 items-center gap-8 rounded-3xl bg-cream-dark/70 p-5 sm:p-6 md:grid-cols-2 lg:gap-12"
          >
            <div className="order-2 px-1 pb-2 md:order-1 md:px-4">
              <h3 className="font-serif text-2xl font-medium leading-snug text-brand-dark sm:text-3xl">
                {post.title}
              </h3>
              {post.teaser && (
                <p className="mt-3 text-sm leading-relaxed text-stone-500">{post.teaser}</p>
              )}
              <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-brand/10 pt-5 text-sm text-stone-600 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <Tag size={14} className="text-brand" />
                  {post.category.type} · {post.category.name}
                </li>
                <li className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-brand" />
                  {formatDate(post.publishedAt)}
                </li>
                <li className="flex items-center gap-2">
                  <Eye size={14} className="text-brand" />
                  Dilihat {formatViews(post.viewCount)} kali
                </li>
              </ul>
              <PillButton href={`/artikel/${post.slug}`} className="mt-8">
                Baca Selengkapnya
              </PillButton>
            </div>

            {/* Same target as the button, so it stays out of the tab order. */}
            <Link
              href={`/artikel/${post.slug}`}
              tabIndex={-1}
              data-cursor="Baca"
              data-reveal="zoom"
              className="group relative order-1 block aspect-[4/3] overflow-hidden rounded-2xl md:order-2"
            >
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                data-reveal-media
                fill
                sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute left-4 top-4 rounded-lg bg-brand px-3 py-1.5 text-sm text-white">
                {post.category.name}
              </span>
            </Link>
          </article>
        ))}
      </div>

      <div data-reveal className="mt-12 flex flex-wrap justify-center gap-3">
        <PillButton href="/csr">Semua Publikasi CSR</PillButton>
        <PillButton href="/ppm">Semua Program PPM</PillButton>
      </div>
    </section>
  );
}
