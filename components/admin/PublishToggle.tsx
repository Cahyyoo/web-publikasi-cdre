"use client";

import { useFormStatus } from "react-dom";
import { disabledButtonClass } from "@/components/admin/formStyles";

/**
 * Child component so useFormStatus binds to the toggle's own <form> — declared
 * in the same component as its form it would read the ancestor's status
 * instead.
 */
function ToggleSubmit({ isPublished }: { isPublished: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
        isPublished
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
      } ${disabledButtonClass}`}
      title={
        isPublished
          ? "Klik untuk menyembunyikan dari Beranda"
          : "Klik untuk menayangkan di Beranda"
      }
    >
      {pending ? "..." : isPublished ? "Tayang" : "Menunggu"}
    </button>
  );
}

export default function PublishToggle({
  action,
  isPublished,
}: {
  action: () => Promise<void>;
  isPublished: boolean;
}) {
  return (
    <form action={action}>
      <ToggleSubmit isPublished={isPublished} />
    </form>
  );
}
