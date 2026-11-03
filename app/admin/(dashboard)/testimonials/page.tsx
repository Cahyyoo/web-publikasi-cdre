import { Plus } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deleteTestimonial, toggleTestimonialPublished } from "./actions";
import TableThumbnail from "@/components/admin/TableThumbnail";
import FormAlert from "@/components/ui/FormAlert";
import {
  addButtonClass,
  editLinkClass,
  pageHeaderClass,
  rowClass,
  tableClass,
  tableWrapClass,
  theadClass,
} from "@/components/admin/formStyles";
import PublishToggle from "@/components/admin/PublishToggle";

export const metadata: Metadata = {
  title: "Testimoni",
};

async function getTestimonials() {
  return prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
}

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: { flash?: string };
}) {
  const testimonials = await getTestimonials();
  const pendingCount = testimonials.filter((t) => !t.isPublished).length;

  return (
    <div>
      <div className={pageHeaderClass}>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Testimoni</h1>
          <p className="mt-1 text-sm text-slate-500">
            Testimonial yang tampil di slider halaman Beranda.
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {pendingCount} menunggu moderasi
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className={addButtonClass}
        >
          <Plus size={16} /> Tambah
        </Link>
      </div>

      <FormAlert code={searchParams.flash} />

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th className="px-4 py-3">Gambar</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Jabatan</th>
              <th className="px-4 py-3">Quote</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {testimonials.map((item) => (
              <tr key={item.id} className={rowClass}>
                <td className="px-4 py-3">
                  <TableThumbnail src={item.imageUrl} alt={item.name} variant="avatar" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-slate-500">{item.title}</td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-500">
                  {item.quote}
                </td>
                <td className="px-4 py-3">
                  <PublishToggle
                    isPublished={item.isPublished}
                    action={toggleTestimonialPublished.bind(
                      null,
                      item.id,
                      !item.isPublished
                    )}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <Link
                      href={`/admin/testimonials/${item.id}`}
                      className={editLinkClass}
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteTestimonial.bind(null, item.id)} />
                  </div>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Belum ada testimoni.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
