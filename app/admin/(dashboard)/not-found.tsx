import Link from "next/link";
import { secondaryButtonClass } from "@/components/admin/formStyles";

export default function AdminNotFound() {
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-slate-900">
        Data tidak ditemukan
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Data yang Anda buka tidak ada atau sudah dihapus.
      </p>
      <div className="mt-6">
        <Link href="/admin" className={secondaryButtonClass}>
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
