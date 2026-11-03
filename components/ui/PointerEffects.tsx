"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_TILT_DEG = 4;
// How quickly the cursor badge catches up with the pointer (0–1 per frame).
const FOLLOW = 0.2;

/**
 * Site-wide pointer effects, mounted once in the public layout next to
 * ScrollReveal:
 *  - `[data-tilt]` cards lean towards the pointer.
 *  - Over `[data-cursor="Label"]` a round badge with that label trails it.
 *
 * They only run with a mouse or trackpad (`hover: hover` and
 * `pointer: fine`) and without reduced motion, and their animation frame
 * loop stops as soon as the badge has caught up — nothing runs while idle.
 */
export default function PointerEffects() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    const badge = badgeRef.current;
    let tiltEl: HTMLElement | null = null;
    let cursorEl: HTMLElement | null = null;
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let badgeX = 0;
    let badgeY = 0;

    const resetTilt = () => {
      if (!tiltEl) return;
      tiltEl.style.setProperty("--rx", "0deg");
      tiltEl.style.setProperty("--ry", "0deg");
      tiltEl.classList.remove("is-tilting");
      tiltEl = null;
    };

    const tick = () => {
      frame = 0;
      if (tiltEl) {
        const rect = tiltEl.getBoundingClientRect();
        const x = (pointerX - rect.left) / rect.width - 0.5;
        const y = (pointerY - rect.top) / rect.height - 0.5;
        tiltEl.style.setProperty("--rx", `${(-y * MAX_TILT_DEG * 2).toFixed(2)}deg`);
        tiltEl.style.setProperty("--ry", `${(x * MAX_TILT_DEG * 2).toFixed(2)}deg`);
      }
      if (badge && cursorEl) {
        badgeX += (pointerX - badgeX) * FOLLOW;
        badgeY += (pointerY - badgeY) * FOLLOW;
        badge.style.transform = `translate(${badgeX}px, ${badgeY}px) translate(-50%, -50%)`;
        // Keep easing towards the pointer until it has (nearly) caught up.
        if (Math.abs(pointerX - badgeX) > 0.5 || Math.abs(pointerY - badgeY) > 0.5) {
          frame = requestAnimationFrame(tick);
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      const target = e.target instanceof Element ? e.target : null;

      const nextTilt = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (nextTilt !== tiltEl) {
        resetTilt();
        tiltEl = nextTilt;
        tiltEl?.classList.add("is-tilting");
      }

      const nextCursor = target?.closest<HTMLElement>("[data-cursor]") ?? null;
      if (nextCursor !== cursorEl) {
        if (nextCursor && !cursorEl) {
          // Appear at the pointer rather than sliding in from the last spot.
          badgeX = pointerX;
          badgeY = pointerY;
        }
        cursorEl = nextCursor;
        setLabel(nextCursor?.dataset.cursor ?? "");
        badge?.classList.toggle("is-visible", !!nextCursor);
      }

      if (tiltEl || cursorEl) schedule();
    };

    const onLeave = () => {
      resetTilt();
      cursorEl = null;
      badge?.classList.remove("is-visible");
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onLeave, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onLeave);
      cancelAnimationFrame(frame);
      resetTilt();
    };
  }, []);

  return (
    <div ref={badgeRef} aria-hidden className="cursor-badge">
      <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full bg-brand font-serif text-sm text-white shadow-xl shadow-brand-dark/25">
        <ArrowUpRight size={18} />
        {label}
      </div>
    </div>
  );
}
