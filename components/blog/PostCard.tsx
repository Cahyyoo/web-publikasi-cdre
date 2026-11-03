import { Eye } from "lucide-react";
import Image from "@/components/ui/AppImage";
import Link from "next/link";
import { formatDate, formatViews, revealProps } from "@/lib/utils";

type PostCardProps = {
  slug: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: Date;
  viewCount: number;
  categoryName: string;
  /** Position in its grid; when set, the card fades in on scroll, staggered. */
  revealIndex?: number;
};

export default function PostCard({
  slug,
  title,
  thumbnailUrl,
  publishedAt,
  viewCount,
  categoryName,
  revealIndex,
}: PostCardProps) {
  return (
    <Link
      href={`/artikel/${slug}`}
      {...(revealIndex !== undefined ? revealProps(revealIndex) : {})}
      data-tilt
      data-cursor="Baca"
      className="group flex flex-col rounded-3xl bg-cream-dark/70 p-3 hover:bg-cream-dark hover:shadow-xl hover:shadow-brand-dark/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-dark">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-lg bg-brand px-2.5 py-1 text-xs text-white">
          {categoryName}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h2 className="line-clamp-2 font-serif text-lg font-medium leading-snug text-brand-dark group-hover:text-brand">
          {title}
        </h2>
        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-stone-500">
          <span>{formatDate(publishedAt)}</span>
          <span className="flex items-center gap-1">
            <Eye size={12} /> {formatViews(viewCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
