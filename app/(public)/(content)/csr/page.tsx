import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import Pagination from "@/components/blog/Pagination";
import PageBanner from "@/components/ui/PageBanner";
import { getHeroImageUrl } from "@/lib/hero-images";
import { getPostsByType } from "@/lib/posts";

export const metadata: Metadata = {
  title: "CSR (Corporate Social Responsibility)",
  description: "Publikasi program CSR PT Stargate Pasific Resource.",
};

export default async function CsrPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const categoryId = searchParams.category
    ? Number(searchParams.category)
    : undefined;

  const [{ posts, totalPages }, bannerUrl] = await Promise.all([
    getPostsByType("CSR", page, categoryId),
    getHeroImageUrl("CSR_BANNER"),
  ]);

  return (
    <div>
      <div className="mb-10">
        <PageBanner
          badge="Publikasi"
          src={bannerUrl}
          alt="Bantuan perbaikan jalan untuk masyarakat sekitar"
          title="CSR — Corporate Social Responsibility"
          subtitle="Berita dan publikasi program tanggung jawab sosial perusahaan."
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
        basePath="/csr"
        page={page}
        totalPages={totalPages}
        extraQuery={{ category: searchParams.category }}
      />
    </div>
  );
}
