import Image from "@/components/ui/AppImage";
import RevealText from "@/components/ui/RevealText";
import SectionBadge from "@/components/ui/SectionBadge";

export default function PageBanner({
  src,
  alt,
  title,
  subtitle,
  badge,
  fullBleed = false,
}: {
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  badge?: string;
  fullBleed?: boolean;
}) {
  return (
    <div
      // `isolate` keeps the rounded corners clipping the zooming image in Safari.
      data-reveal="zoom"
      className={`is-revealed reveal-animate relative isolate h-64 w-full overflow-hidden sm:h-80 ${fullBleed ? "" : "rounded-3xl"}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        data-reveal-media
        sizes="100vw"
        className="animate-hero-zoom object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
        {badge && (
          <div className="mb-4 animate-fade-up">
            <SectionBadge tone="dark">{badge}</SectionBadge>
          </div>
        )}
        <RevealText
          as="h1"
          text={title}
          immediate
          delayMs={150}
          className="font-serif text-3xl font-medium leading-tight text-white sm:text-5xl"
        />
        {subtitle && (
          <p className="mt-2 max-w-xl animate-fade-up text-sm text-white/80 [animation-delay:400ms] sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
