import RevealText from "@/components/ui/RevealText";
import SectionBadge from "@/components/ui/SectionBadge";

/** Badge + serif heading (+ optional description) that opens a section. */
export default function SectionHeading({
  badge,
  title,
  description,
  align = "left",
  as = "h2",
  className = "",
}: {
  badge?: string;
  title: string;
  description?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}>
      {badge && (
        <div data-reveal>
          <SectionBadge>{badge}</SectionBadge>
        </div>
      )}
      <RevealText
        as={as}
        text={title}
        delayMs={badge ? 120 : 0}
        className={`${badge ? "mt-4" : ""} font-serif text-3xl font-medium leading-[1.1] text-brand sm:text-4xl lg:text-5xl`}
      />
      {description && (
        <p data-reveal className="mt-4 leading-relaxed text-stone-500 [--reveal-delay:200ms]">
          {description}
        </p>
      )}
    </div>
  );
}
