"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "@/components/ui/AppImage";
import { useEffect, useState } from "react";

type Photo = {
  id: number;
  imageUrl: string;
  caption: string | null;
};

const AUTOPLAY_INTERVAL_MS = 5000;

export default function ActivityCarousel({
  photos,
  priority = false,
}: {
  photos: Photo[];
  /**
   * Preload the first slide. Only the topmost carousel should set this: the
   * page renders one per category, and N preload hints compete with each
   * other and with the banner above them.
   */
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (photos.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setIndex((cur) => (cur + 1) % photos.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [photos.length, paused]);

  if (photos.length === 0) {
    return <p className="text-sm text-stone-400">Belum ada foto untuk kategori ini.</p>;
  }

  const current = photos[index];
  const goTo = (next: number) => setIndex((next + photos.length) % photos.length);

  // Every slide sits inside the viewport (hidden only by opacity), so mounting
  // them all makes the browser download the whole category up front. Keeping
  // just the neighbours mounted preserves the crossfade at a fraction of the
  // image payload.
  const isNearCurrent = (i: number) => {
    if (photos.length <= 3) return true;
    const rawDistance = Math.abs(i - index);
    return Math.min(rawDistance, photos.length - rawDistance) <= 1;
  };

  return (
    <div
      className="group relative overflow-hidden rounded-3xl bg-cream-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/9] w-full">
        {photos.map((photo, i) =>
          isNearCurrent(i) ? (
            <div
              key={photo.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={photo.imageUrl}
                alt={photo.caption ?? "Dokumentasi kegiatan"}
                fill
                // The rendered width inside app/(public)/(content)/layout.tsx:
                // max-w-6xl (72rem) minus its px-4/sm:px-6/lg:px-8 padding.
                // Under-stating it made browsers fetch an 828px variant and
                // upscale it, so keep these in step with that layout.
                sizes="(min-width: 1152px) 1088px, (min-width: 1024px) calc(100vw - 4rem), (min-width: 640px) calc(100vw - 3rem), calc(100vw - 2rem)"
                className="object-cover"
                priority={priority && i === 0}
              />
            </div>
          ) : null
        )}
        {current.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
            <p className="text-sm font-medium text-white">{current.caption}</p>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Foto sebelumnya"
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-cream/90 text-brand opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-cream"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Foto berikutnya"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-cream/90 text-brand opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-cream"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => goTo(i)}
                aria-label={`Foto ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
