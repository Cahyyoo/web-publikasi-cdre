import { Sprout } from "lucide-react";

/** Small sprout-icon pill that labels a section above its heading. */
export default function SectionBadge({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  /** `dark` for use over photos or the dark footer. */
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
        tone === "dark" ? "bg-white/10 text-white" : "bg-brand/[0.06] text-brand"
      }`}
    >
      <Sprout size={16} aria-hidden />
      {children}
    </span>
  );
}
