"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** How far the page scrolls before the transparent navbar turns solid. */
const SOLID_AFTER_PX = 24;

/**
 * The navbar's <header>. On the homepage it floats transparent over the hero
 * and turns cream once the page scrolls; elsewhere it is always solid. Child
 * elements restyle themselves with `group-data-[transparent=true]/nav:`.
 *
 * Also draws the scroll progress bar: a CSS scroll-driven animation where
 * supported, otherwise the same rAF-throttled scroll listener sets it.
 */
export default function NavbarShell({ children }: { children: React.ReactNode }) {
  const overHero = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const cssProgress = CSS.supports("animation-timeline: scroll()");
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // React skips the re-render when the value is unchanged.
      setScrolled(y > SOLID_AFTER_PX);
      if (!cssProgress && bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const transparent = overHero && !scrolled;

  return (
    <header
      data-transparent={transparent}
      className={`group/nav inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        overHero ? "fixed" : "sticky"
      } ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-brand/5 bg-cream/85 shadow-[0_10px_30px_-18px_rgba(14,46,29,0.35)] backdrop-blur-md"
      }`}
    >
      {children}
      <div
        ref={barRef}
        aria-hidden
        style={{ transform: "scaleX(0)" }}
        className="scroll-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand group-data-[transparent=true]/nav:bg-white/70"
      />
    </header>
  );
}
