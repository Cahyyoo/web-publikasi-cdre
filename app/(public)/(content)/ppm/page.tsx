import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import Pagination from "@/components/blog/Pagination";
import PageBanner from "@/components/ui/PageBanner";
import { getHeroImageUrl } from "@/lib/hero-images";
import { getPostsByType } from "@/lib/posts";

export const metadata: Metadata = {
  title: "PPM (Pengembangan & Pemberdayaan Masyarakat)",
  description: "Publikasi program PPM PT Stargate Pasific Resource.",
};

export default async function PpmPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const categoryId = searchParams.category
    ? Number(searchParams.category)
    : undefined;

  const [{ posts, totalPages }, bannerUrl] = await Promise.all([
    getPostsByType("PPM", page, categoryId),
    getHeroImageUrl("PPM_BANNER"),
  ]);

  return (
    <div>
      <div className="mb-10">
        <PageBanner
          badge="Program"
          src={bannerUrl}
          alt="Penyerahan bantuan dana pendidikan kepada mahasiswa binaan"
          title="PPM — Pengembangan & Pemberdayaan Masyarakat"
          subtitle="Berita dan publikasi program pengembangan masyarakat."
        />
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-stone-400">Belum ada artikel untuk ditampilkan.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              thumbnailUrl={post.thumbnailUrl}
              publishedAt={post.publishedAt}
              viewCount={post.viewCount}
              categoryName={post.category.name}
              revealIndex={i}
            />
          ))}
        </div>
      )}

      <Pagination
        basePath="/ppm"
        page={page}
        totalPages={totalPages}
        extraQuery={{ category: searchParams.category }}
      />
    </div>
  );
}
