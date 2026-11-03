import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  alertBaseClass,
  alertErrorClass,
  alertSuccessClass,
} from "@/components/admin/formStyles";
import { toFlashCode, FLASH } from "@/lib/flash";
import FlashUrlCleaner from "./FlashUrlCleaner";

/**
 * Renders the outcome of the last admin action. Server component: the only
 * client JS it pulls in is the ~20-line URL cleaner.
 *
 * Unknown or absent codes render nothing, so a `?flash=` typed by hand cannot
 * produce an official-looking banner.
 */
export default function FormAlert({ code }: { code?: string }) {
  const flashCode = toFlashCode(code);
  if (!flashCode) return null;

  const { tone, text } = FLASH[flashCode];
  const isSuccess = tone === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      // role/aria-live so screen readers announce the outcome; the plain <p>
      // this replaces was silent.
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`${alertBaseClass} ${isSuccess ? alertSuccessClass : alertErrorClass}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
      <FlashUrlCleaner />
    </div>
  );
}
