import type { CSSProperties } from "react";

/**
 * Text that rises in word by word as it scrolls into view, driven by the
 * `[data-reveal="text"]` rules in app/globals.css and ScrollReveal. Screen
 * readers get the whole string from `aria-label`, not the split words.
 */
export default function RevealText({
  text,
  as: Tag = "h2",
  className = "",
  delayMs = 0,
  immediate = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Extra delay before the first word, e.g. to follow a badge. */
  delayMs?: number;
  /**
   * Animate on page load rather than on scroll. ScrollReveal treats anything
   * already on screen as revealed without animating, so above-the-fold
   * headings (hero, page banners) need this to play at all.
   */
  immediate?: boolean;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag
      data-reveal="text"
      aria-label={text}
      className={`${immediate ? "is-revealed reveal-animate" : ""} ${className}`}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden>
          <span className="rt-word" style={{ "--i": i } as CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
