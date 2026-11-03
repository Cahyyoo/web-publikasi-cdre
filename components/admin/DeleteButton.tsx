"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { disabledButtonClass } from "@/components/admin/formStyles";

/**
 * Split out as a child component on purpose: useFormStatus reads the nearest
 * ANCESTOR <form>, so a button declared in the same component as its own
 * <form> would report the parent form's status instead of its own.
 */
function DeleteSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 ${disabledButtonClass}`}
    >
      <Trash2 size={14} aria-hidden="true" />
      {pending ? "Menghapus..." : "Hapus"}
    </button>
  );
}

export default function DeleteButton({
  action,
  confirmMessage = "Hapus data ini? Tindakan ini tidak bisa dibatalkan.",
}: {
  action: (formData: FormData) => Promise<void>;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <DeleteSubmit />
    </form>
  );
}
