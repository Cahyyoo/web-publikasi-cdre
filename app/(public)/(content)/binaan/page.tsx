import { MessageCircle } from "lucide-react";
import Image from "@/components/ui/AppImage";
import Link from "next/link";
import type { Metadata } from "next";
import Pagination from "@/components/blog/Pagination";
import PageBanner from "@/components/ui/PageBanner";
import { getHeroImageUrl } from "@/lib/hero-images";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppLink, revealProps } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Binaan UMKM",
  description:
    "Katalog produk UMKM binaan PT Stargate Pasific Resource.",
};

const PAGE_SIZE = 12;

async function getBinaanGroups() {
  return prisma.binaanGroup.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

async function getProducts(page: number, groupId?: number) {
  const where = groupId ? { groupId } : undefined;
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      // `include: { group: true }` re-fetched the same group rows that
      // getBinaanGroups() already loads below; the name is mapped from there.
      select: {
        id: true,
        name: true,
        groupId: true,
        flavor: true,
        description: true,
        imageUrl: true,
        waNumber: true,
      },
      // `id` breaks ties so products with the same name never shift between pages.
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);
  return {
    products,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  };
}

export default async function BinaanPage({
  searchParams,
}: {
  searchParams: { group?: string; page?: string };
}) {
  const groupId = searchParams.group ? Number(searchParams.group) : undefined;
  const page = Number(searchParams.page ?? 1) || 1;
  const [groups, { products, totalPages }, bannerUrl] = await Promise.all([
    getBinaanGroups(),
    getProducts(page, groupId),
    getHeroImageUrl("BINAAN_BANNER"),
  ]);

  const groupNameById = new Map(groups.map((group) => [group.id, group.name]));

  return (
    <div>
      <div className="mb-10">
        <PageBanner
          badge="Produk Lokal"
          src={bannerUrl}
          alt="Penyaluran bantuan parcel Lebaran kepada masyarakat sekitar"
          title="Binaan UMKM"
          subtitle="Produk-produk dari kelompok UMKM binaan PT Stargate Pasific Resource."
        />
      </div>

      {/* Group filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/binaan"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !groupId
              ? "bg-brand text-white"
              : "bg-cream-dark text-stone-600 hover:bg-brand/10 hover:text-brand"
          }`}
        >
          Semua Kelompok
        </Link>
        {groups.map((group) => (
          <Link
            key={group.id}
            href={`/binaan?group=${group.id}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              groupId === group.id
                ? "bg-brand text-white"
                : "bg-cream-dark text-stone-600 hover:bg-brand/10 hover:text-brand"
            }`}
          >
            {group.name}
          </Link>
        ))}
      </div>

      {/* Product grid */}
      {products.length === 0 ? (
        <p className="text-sm text-stone-400">Belum ada produk untuk ditampilkan.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product, i) => (
            <article
              key={product.id}
              {...revealProps(i)}
              data-tilt
              className="group flex flex-col rounded-3xl bg-cream-dark/70 p-3 hover:bg-cream-dark hover:shadow-xl hover:shadow-brand-dark/10"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream-dark">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-brand">
                  {groupNameById.get(product.groupId)}
                </p>
                <h2 className="mt-1 font-serif text-xl font-medium text-brand-dark">
                  {product.name}
                </h2>
                {product.flavor && (
                  <p className="text-xs text-stone-500">Varian: {product.flavor}</p>
                )}
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-stone-500">
                  {product.description}
                </p>
                <a
                  href={buildWhatsAppLink(
                    product.waNumber,
                    `Halo, saya tertarik dengan produk ${product.name}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1EBE5A]"
                >
                  <MessageCircle size={16} />
                  Pesan Via WA
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination
        basePath="/binaan"
        page={page}
        totalPages={totalPages}
        extraQuery={{ group: searchParams.group }}
      />
    </div>
  );
}
