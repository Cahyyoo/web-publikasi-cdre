"use client";

import { useFormStatus } from "react-dom";
import {
  disabledButtonClass,
  primaryButtonClass,
} from "@/components/admin/formStyles";

/**
 * Submit button that disables itself while its form is in flight.
 *
 * Uploads are written to disk synchronously and may take seconds on a slow
 * link; without this the button stays live and a second click creates a
 * duplicate record and a duplicate file.
 *
 * NOTE: useFormStatus reports the status of the nearest ANCESTOR <form>, so
 * this must be rendered inside the form it belongs to — never alongside it.
 */
export default function SubmitButton({
  children = "Simpan",
  pendingLabel = "Menyimpan...",
  className = primaryButtonClass,
}: {
  children?: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} ${disabledButtonClass}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
