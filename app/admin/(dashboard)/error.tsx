"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import {
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/admin/formStyles";

/**
 * Error boundary for the whole admin dashboard. Without this a database hiccup
 * renders Next's bare error screen with no way back.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="max-w-lg">
      <div className="flex items-start gap-2 text-red-600">
        <AlertCircle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
        <h1 className="text-xl font-bold">Terjadi kesalahan</h1>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Halaman ini gagal dimuat. Biasanya ini masalah sementara pada koneksi
        database. Coba muat ulang; jika masih gagal, hubungi pengelola sistem.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-slate-400">Kode: {error.digest}</p>
      )}

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className={primaryButtonClass}>
          <span className="flex items-center gap-1.5">
            <RotateCcw size={14} aria-hidden="true" />
            Coba lagi
          </span>
        </button>
        <Link href="/admin" className={secondaryButtonClass}>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
