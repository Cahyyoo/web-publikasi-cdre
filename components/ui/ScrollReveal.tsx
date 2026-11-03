"use client";

import { useLayoutEffect } from "react";

const SELECTOR = "[data-reveal]";
// Shared by the first pass and the observer: the bottom 10% of the screen
// doesn't count, so a section that only peeks in at load still animates.
const BOTTOM_MARGIN = 0.1;

function inViewport(el: Element) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * (1 - BOTTOM_MARGIN) && rect.bottom > 0;
}

/**
 * Fades `[data-reveal]` elements in as they scroll into view, once each.
 * Mounted once in the public layout; renders nothing.
 *
 * The hidden state only applies after this runs (it adds `reveal-ready` to
 * <html>), so content stays visible without JavaScript. Anything already on
 * screen is revealed in the same pre-paint pass, so nothing flickers.
 */
export default function ScrollReveal() {
  useLayoutEffect(() => {
    const root = document.documentElement;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed", "reveal-animate");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: `0px 0px -${BOTTOM_MARGIN * 100}% 0px` }
    );

    const track = (el: Element) => {
      if (!el.classList.contains("is-revealed")) io.observe(el);
    };

    // Server-rendered content that is already visible must not fade out and
    // back in on hydration, so it is marked revealed without `reveal-animate`.
    document.querySelectorAll(SELECTOR).forEach((el) => {
      if (inViewport(el)) el.classList.add("is-revealed");
      else track(el);
    });
    root.classList.add("reveal-ready");

    // Client navigations (route changes, pagination, filters) insert new
    // elements without remounting the layout.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) track(node);
          node.querySelectorAll(SELECTOR).forEach(track);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
