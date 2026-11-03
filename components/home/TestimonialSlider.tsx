"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "@/components/ui/AppImage";
import { useEffect, useState } from "react";

const AUTOPLAY_MS = 7000;

type Testimonial = {
  id: number;
  name: string;
  title: string;
  quote: string;
  imageUrl: string;
};

// Neighbours shown either side of the featured card, and the breakpoint at
// which each ring appears. A ring is skipped when there are too few
// testimonials to fill it without showing the same person twice.
const RINGS = [
  { offset: 1, minCount: 3, show: "hidden md:block" },
  { offset: 2, minCount: 5, show: "hidden xl:block" },
];

export default function TestimonialSlider({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  // Advances on a timer while the reader isn't hovering or focused inside the
  // slider. Depending on `index` restarts the countdown after a manual change.
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, count]);

  if (count === 0) return null;

  const at = (offset: number) => testimonials[(index + offset + count) % count];
  const goTo = (next: number) => setIndex((next + count) % count);
  const current = at(0);

  const side = (offset: number, show: string) => {
    const t = at(offset);
    return (
      <button
        key={`${offset}-${t.id}`}
        onClick={() => goTo(index + offset)}
        aria-label={`Tampilkan testimoni ${t.name}`}
        className={`${show} mt-32 w-56 shrink-0 animate-fade-in text-left opacity-80 transition-opacity hover:opacity-100`}
      >
        <div className="relative h-56 overflow-hidden rounded-2xl bg-cream-dark">
          <Image src={t.imageUrl} alt="" fill sizes="224px" className="object-cover" />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-2">
          <p className="truncate font-serif text-lg text-brand-dark">{t.name}</p>
          <p className="truncate text-xs text-stone-500">{t.title}</p>
        </div>
      </button>
    );
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-start justify-center gap-5">
        {RINGS.slice()
          .reverse()
          .filter((ring) => count >= ring.minCount)
          .map((ring) => side(-ring.offset, ring.show))}

        {/* Keyed so each testimonial mounts fresh and plays the fade-in. */}
        <figure key={current.id} className="w-full max-w-sm shrink-0 animate-fade-in">
          <div className="relative h-80 overflow-hidden rounded-3xl bg-cream-dark">
            <Image
              src={current.imageUrl}
              alt={current.name}
              fill
              sizes="384px"
              className="object-cover"
            />
          </div>
          <blockquote className="mt-5 font-serif text-xl leading-snug text-brand-dark">
            &ldquo;{current.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-5 flex items-baseline justify-between gap-3 border-t border-brand/10 pt-4">
            <span className="font-serif text-lg text-brand-dark">{current.name}</span>
            <span className="text-sm text-stone-500">{current.title}</span>
          </figcaption>
        </figure>

        {RINGS.filter((ring) => count >= ring.minCount).map((ring) =>
          side(ring.offset, ring.show)
        )}
      </div>

      {count > 1 && (
        <div className="mt-10 flex justify-center gap-3">
          <button
            onClick={() => goTo(index - 1)}
            aria-label="Testimoni sebelumnya"
            className="flex h-10 w-12 items-center justify-center rounded-lg bg-cream-dark text-brand transition-colors hover:bg-brand/10"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="Testimoni berikutnya"
            className="flex h-10 w-12 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-dark"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
