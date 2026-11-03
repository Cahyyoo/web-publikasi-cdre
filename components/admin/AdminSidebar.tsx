import {
  FileText,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  Layers,
  LogOut,
  MessageSquareQuote,
  Package,
  PanelBottom,
  Quote,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import AdminNavLink from "./AdminNavLink";

const NAV_GROUPS = [
  {
    label: "Umum",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Beranda",
    items: [
      { href: "/admin/testimonials", label: "Testimoni", icon: MessageSquareQuote },
      { href: "/admin/sambutan", label: "Sambutan", icon: Quote },
    ],
  },
  {
    label: "Tampilan",
    items: [
      { href: "/admin/hero-images", label: "Gambar Hero & Banner", icon: ImageIcon },
      { href: "/admin/footer", label: "Footer", icon: PanelBottom },
    ],
  },
  {
    label: "PPM & CSR",
    items: [
      { href: "/admin/categories", label: "Kategori", icon: Tags },
      { href: "/admin/posts", label: "Artikel", icon: FileText },
    ],
  },
  {
    label: "Binaan UMKM",
    items: [
      { href: "/admin/binaan-groups", label: "Kelompok Binaan", icon: Users },
      { href: "/admin/products", label: "Produk", icon: Package },
    ],
  },
  {
    label: "Galeri",
    items: [{ href: "/admin/gallery", label: "Penghargaan", icon: Images }],
  },
  {
    label: "Galeri Kegiatan",
    items: [
      { href: "/admin/activity-categories", label: "Kategori Kegiatan", icon: Layers },
      { href: "/admin/activity-gallery", label: "Foto Kegiatan", icon: Images },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <p className="text-sm font-bold text-slate-900">Admin CMS</p>
        <p className="text-xs text-slate-500">PT Stargate Pasific Resource</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => (
                <AdminNavLink key={href} href={href} label={label} icon={<Icon size={16} />} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <Link
          href="/"
          target="_blank"
          className="mb-1 block rounded-md px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-100"
        >
          Lihat Situs Publik
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
