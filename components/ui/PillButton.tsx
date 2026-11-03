import { ArrowRight } from "lucide-react";
import Link from "next/link";

const VARIANTS = {
  /** Forest green with a cream arrow box: the default on cream backgrounds. */
  solid: {
    pill: "bg-brand text-white hover:bg-brand-dark",
    box: "bg-cream text-brand",
  },
  /** Cream with a green arrow box: for photos and dark sections. */
  light: {
    pill: "bg-cream text-brand-dark hover:bg-white",
    box: "bg-brand text-white",
  },
  /** Outline over a photo. */
  ghost: {
    pill: "border border-white/40 text-white hover:bg-white/10",
    box: "border border-white/40 text-white",
  },
} as const;

/**
 * The site's call-to-action: a pill with a serif label and the arrow in its
 * own rounded box on the right, which nudges forward on hover.
 */
export default function PillButton({
  href,
  children,
  variant = "solid",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const styles = VARIANTS[variant];
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-4 rounded-xl py-1.5 pl-5 pr-1.5 font-serif text-base font-medium transition-colors duration-300 ${styles.pill} ${className}`}
    >
      {children}
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:translate-x-0.5 ${styles.box}`}
      >
        <ArrowRight size={16} />
      </span>
    </Link>
  );
}
