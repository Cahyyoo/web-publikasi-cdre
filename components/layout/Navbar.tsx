import { ChevronDown } from "lucide-react";
import Image from "@/components/ui/AppImage";
import Link from "next/link";
import MobileMenu, { type NavGroup } from "./MobileMenu";
import NavbarShell from "./NavbarShell";
import SearchBar from "./SearchBar";
import { getNavData } from "@/lib/nav";

export default async function Navbar() {
  const { csrCategories, ppmCategories, binaanGroups, activityCategories } = await getNavData();

  const navGroups: NavGroup[] = [
    { label: "Beranda", href: "/" },
    {
      label: "CSR & PPM",
      items: [
        { label: "Semua Publikasi CSR", href: "/csr" },
        ...csrCategories.map((c) => ({ label: c.name, href: `/csr?category=${c.id}` })),
        { label: "Semua Program PPM", href: "/ppm" },
        ...ppmCategories.map((c) => ({ label: c.name, href: `/ppm?category=${c.id}` })),
      ],
    },
    {
      label: "Binaan UMKM",
      items: [
        { label: "Semua Kelompok", href: "/binaan" },
        ...binaanGroups.map((g) => ({ label: g.name, href: `/binaan?group=${g.id}` })),
      ],
    },
    { label: "Penghargaan", href: "/penghargaan" },
    {
      label: "Galeri Kegiatan",
      items: [
        { label: "Semua Kegiatan", href: "/galeri-kegiatan" },
        ...activityCategories.map((c) => ({
          label: c.name,
          href: `/galeri-kegiatan?category=${c.id}`,
        })),
      ],
    },
  ];

  return (
    <NavbarShell>
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="PT Stargate Pasific Resource"
            width={505}
            height={494}
            // Deliberately not `priority`: a ~44px-tall logo preloading on
            // every page competes for bandwidth with the real LCP banner.
            sizes="44px"
            className="h-10 w-auto object-contain transition-[filter] duration-300 sm:h-11 group-data-[transparent=true]/nav:brightness-0 group-data-[transparent=true]/nav:invert"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <ul className="flex items-center">
            {navGroups.map((group) =>
              group.href ? (
                <li key={group.label}>
                  <Link
                    href={group.href}
                    className="relative px-4 py-2 text-[15px] font-medium text-stone-600 transition-colors after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 hover:text-brand hover:after:scale-x-100 group-data-[transparent=true]/nav:text-white/90 group-data-[transparent=true]/nav:after:bg-white group-data-[transparent=true]/nav:hover:text-white"
                  >
                    {group.label}
                  </Link>
                </li>
              ) : (
                <li key={group.label} className="group relative">
                  <button className="flex items-center gap-1 px-4 py-2 text-[15px] font-medium text-stone-600 transition-colors hover:text-brand group-data-[transparent=true]/nav:text-white/90 group-data-[transparent=true]/nav:hover:text-white">
                    {group.label}{" "}
                    <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-0 top-full w-60 translate-y-2 rounded-2xl bg-cream py-2 opacity-0 shadow-xl shadow-brand-dark/10 ring-1 ring-brand/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {group.items?.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-5 py-2.5 text-sm text-stone-600 transition-all duration-200 hover:bg-cream-dark hover:pl-6 hover:text-brand"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SearchBar />
          <MobileMenu groups={navGroups} />
        </div>
      </div>
    </NavbarShell>
  );
}
