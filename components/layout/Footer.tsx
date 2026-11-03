import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import Image from "@/components/ui/AppImage";
import Link from "next/link";
import RevealText from "@/components/ui/RevealText";
import { getFooterSettings } from "@/lib/footer-settings";
import { revealProps } from "@/lib/utils";

const NAV_COLUMNS = [
  [
    { label: "Beranda", href: "/" },
    { label: "Publikasi CSR", href: "/csr" },
    { label: "Program PPM", href: "/ppm" },
    { label: "Binaan UMKM", href: "/binaan" },
  ],
  [
    { label: "Penghargaan", href: "/penghargaan" },
    { label: "Galeri Kegiatan", href: "/galeri-kegiatan" },
    { label: "Bagikan Testimoni", href: "/testimoni" },
    { label: "Pencarian", href: "/search" },
  ],
];

export default async function Footer() {
  const footer = await getFooterSettings();
  // The footer form saves a blank URL as "#"; showing an icon that goes
  // nowhere looked broken, so those are left out.
  const socialLinks = [
    { href: footer.facebookUrl, label: "Facebook", icon: Facebook },
    { href: footer.instagramUrl, label: "Instagram", icon: Instagram },
    { href: footer.youtubeUrl, label: "YouTube", icon: Youtube },
  ].filter(({ href }) => href && href !== "#");

  return (
    <footer className="bg-brand-dark text-white/70">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div data-reveal>
            <Image
              src="/logo.png"
              alt="PT Stargate Pasific Resource"
              width={505}
              height={494}
              // Without `sizes` the browser picked a 1080px-wide variant of a
              // logo rendered ~56px tall, on every public page.
              sizes="57px"
              className="h-14 w-auto object-contain brightness-0 invert"
            />
          </div>
          <div>
            <RevealText
              text="Bersama Membangun Masa Depan"
              className="font-serif text-3xl font-medium leading-tight text-white sm:text-4xl"
            />
            <p data-reveal className="mt-5 max-w-md text-sm leading-relaxed">
              {footer.description}
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          <ul {...revealProps(0, 3)} className="space-y-3">
            {NAV_COLUMNS[0].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-serif text-lg text-white/90 transition-colors hover:text-brand-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul {...revealProps(1, 3)} className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-light" />
              <span>{footer.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="shrink-0 text-brand-light" />
              <a
                href={`tel:${footer.phone.replace(/[^\d+]/g, "")}`}
                className="transition-colors hover:text-white"
              >
                {footer.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="shrink-0 text-brand-light" />
              <a href={`mailto:${footer.email}`} className="transition-colors hover:text-white">
                {footer.email}
              </a>
            </li>
          </ul>

          <ul {...revealProps(2, 3)} className="space-y-3 lg:text-right">
            {NAV_COLUMNS[1].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-serif text-lg text-white/90 transition-colors hover:text-brand-light"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 py-6 text-xs sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} PT Stargate Pasific Resource. All rights reserved.</p>
          {socialLinks.length > 0 && (
            <div className="flex gap-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
