import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PT Stargate Pasific Resource",
    template: "%s | PT Stargate Pasific Resource",
  },
  description:
    "Publikasi resmi program CSR & PPM, serta pemberdayaan UMKM binaan PT Stargate Pasific Resource.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-white font-sans text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
