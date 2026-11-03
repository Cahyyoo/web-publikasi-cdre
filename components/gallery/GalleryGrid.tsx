import Image from "@/components/ui/AppImage";
import type { GalleryType } from "@prisma/client";
import Pagination from "@/components/blog/Pagination";
import { prisma } from "@/lib/prisma";
import { revealProps } from "@/lib/utils";

const PAGE_SIZE = 12;

async function getGalleryItems(type: GalleryType, page: number) {
  const where = { type };
  const [items, totalCount] = await Promise.all([
    prisma.gallery.findMany({
      where,
      select: { id: true, title: true, period: true, imageUrl: true },
      orderBy: { id: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.gallery.count({ where }),
  ]);
  return {
    items,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
  };
}

export default async function GalleryGrid({
  type,
  page,
  basePath,
}: {
  type: GalleryType;
  page: number;
  /** Page this grid lives on, for the pagination links. */
  basePath: string;
}) {
  const { items, totalPages } = await getGalleryItems(type, page);

  if (items.length === 0) {
    return <p className="text-sm text-stone-400">Belum ada item untuk ditampilkan.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, i) => (
          <figure
            key={item.id}
            {...revealProps(i)}
            data-tilt
            className="group rounded-3xl bg-cream-dark/70 p-3 hover:bg-cream-dark hover:shadow-xl hover:shadow-brand-dark/10"
          >
            {/*
              Gallery rows don't store image dimensions, so a hardcoded 600x400
              with h-auto reserved a 3:2 box for images of every shape and the
              grid jumped as each one loaded. An explicit aspect box with `fill`
              is what every other Image in this codebase does.
            */}
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-cream-dark">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <figcaption className="px-2 pb-1 pt-3">
              <p className="font-serif text-lg font-medium text-brand-dark">{item.title}</p>
              {item.period && (
                <p className="text-xs text-stone-500">{item.period}</p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      <Pagination basePath={basePath} page={page} totalPages={totalPages} />
    </>
  );
}
