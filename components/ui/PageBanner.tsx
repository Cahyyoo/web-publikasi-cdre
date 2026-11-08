import Image from "@/components/ui/AppImage";
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
      className={`relative isolate h-64 w-full overflow-hidden sm:h-80 ${fullBleed ? "" : "rounded-3xl"}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="animate-hero-zoom object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent" />
      {/* One fade for the whole block, like the homepage hero. */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
        <div className="animate-fade-up">
          {badge && (
            <div className="mb-4">
              <SectionBadge tone="dark">{badge}</SectionBadge>
            </div>
          )}
          <h1 className="font-serif text-3xl font-medium leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
