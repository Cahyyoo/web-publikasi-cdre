import Image from "@/components/ui/AppImage";

const VARIANTS = {
  square: { className: "h-12 w-12 rounded-md", sizes: "48px" },
  wide: { className: "h-12 w-20 rounded-md", sizes: "80px" },
  avatar: { className: "h-10 w-10 rounded-full", sizes: "40px" },
} as const;

export default function TableThumbnail({
  src,
  alt,
  variant = "square",
}: {
  src: string;
  alt: string;
  variant?: keyof typeof VARIANTS;
}) {
  const { className, sizes } = VARIANTS[variant];
  return (
    <div className={`relative shrink-0 overflow-hidden bg-slate-100 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}
