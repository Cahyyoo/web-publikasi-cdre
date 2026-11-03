"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// `icon` is a rendered element, not the component: a server component can't
// pass a function (the lucide component) across to a client component.
export default function AdminNavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  // "/admin" is the prefix of every route, so the Dashboard link only matches exactly.
  const isActive =
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-brand/10 text-brand"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
