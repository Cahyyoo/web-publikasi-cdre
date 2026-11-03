import { Suspense } from "react";
import Image from "@/components/ui/AppImage";
import FeaturedPosts from "@/components/home/FeaturedPosts";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import PillButton from "@/components/ui/PillButton";
import RevealText from "@/components/ui/RevealText";
import SectionBadge from "@/components/ui/SectionBadge";
import SectionHeading from "@/components/ui/SectionHeading";
import { getHeroImageUrls } from "@/lib/hero-images";
import { coverImageSizes, getLocalImageSize } from "@/lib/image-size";
import { prisma } from "@/lib/prisma";
import { getSambutan } from "@/lib/sambutan";

// Content actions revalidate this path on save; the window is a backstop.
export const revalidate = 300;

async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    // Matches TestimonialSlider's props — these rows are serialized into the
    // client payload, so unused columns are pure page weight.
    select: { id: true, name: true, title: true, quote: true, imageUrl: true },
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const [testimonials, images, sambutan] = await Promise.all([
    getTestimonials(),
    // Admin → Gambar Hero & Banner.
    getHeroImageUrls(["HOME_HERO"]),
    getSambutan(),
  ]);
  const heroSize = await getLocalImageSize(images.HOME_HERO);

  return (
    <div>
      {/* Hero */}
      {/*
        The navbar floats over this section (NavbarShell), hence the full
        height. Phones get at least one screen too (growing if the copy needs
        more), so the image's `sizes` can be worked out from 100vh.
      */}
      <section className="relative flex min-h-[max(640px,100svh)] w-full items-center overflow-hidden bg-brand-dark text-white sm:h-[100svh] sm:min-h-[640px] sm:max-h-[980px]">
        <div className="hero-parallax absolute inset-0">
          <Image
            src={images.HOME_HERO}
            alt="Kegiatan Sehat Bareng STARGATE bersama masyarakat"
            fill
            priority
            sizes={coverImageSizes(heroSize)}
            className="animate-hero-zoom object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/5" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="hero-content relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <div className="animate-fade-up">
            <SectionBadge tone="dark">PT Stargate Pasific Resource</SectionBadge>
          </div>
          <RevealText
            as="h1"
            immediate
            delayMs={150}
            text="Operasional Berkelanjutan, Dampak Nyata bagi Masyarakat"
            className="mt-6 max-w-4xl font-serif text-4xl font-medium leading-[1.08] sm:text-6xl lg:text-[4.5rem]"
          />
          <p className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-white/80 [animation-delay:500ms] sm:text-lg">
            Publikasi resmi program CSR &amp; PPM, serta pemberdayaan UMKM
            binaan kami.
          </p>
          <div className="mt-10 flex animate-fade-up flex-wrap gap-3 [animation-delay:650ms]">
            <PillButton href="/ppm" variant="light">
              Program PPM
            </PillButton>
            <PillButton href="/csr" variant="ghost">
              Publikasi CSR
            </PillButton>
          </div>
        </div>
        <div
          aria-hidden
          className="absolute bottom-8 left-4 z-10 hidden animate-fade-in items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70 [animation-delay:900ms] sm:left-6 sm:flex lg:left-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          <span className="relative block h-12 w-px overflow-hidden bg-white/20">
            <span className="scroll-cue-line absolute inset-0 bg-white" />
          </span>
          Gulir
        </div>
      </section>

      {/* Mission statement */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <p className="scroll-fill max-w-5xl font-serif text-3xl font-medium leading-[1.25] text-brand sm:text-4xl lg:text-5xl">
          {sambutan.quote}
        </p>
        <p data-reveal className="mt-8 max-w-2xl leading-relaxed text-stone-500">
          {sambutan.description}
        </p>
      </section>

      {/*
        FeaturedPosts runs its own query; the Suspense boundary lets it stream
        in so the sections above paint without waiting on it.
      */}
      <Suspense fallback={<div className="h-96" />}>
        <FeaturedPosts />
      </Suspense>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="overflow-hidden py-24">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-end lg:px-8">
            <SectionHeading badge="Testimoni" title="Cerita yang Menginspirasi" />
            <div data-reveal className="max-w-sm">
              <p className="text-sm leading-relaxed text-stone-500">
                Pengalaman masyarakat dan mitra yang merasakan langsung manfaat
                program kami.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-3">
                  {testimonials.slice(0, 4).map((t) => (
                    <div
                      key={t.id}
                      className="relative h-10 w-10 overflow-hidden rounded-full bg-cream-dark ring-2 ring-cream"
                    >
                      <Image src={t.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-stone-500">{testimonials.length} testimoni</p>
              </div>
            </div>
          </div>
          <div data-reveal className="mt-14 px-4 [--reveal-delay:120ms]">
            <TestimonialSlider testimonials={testimonials} />
          </div>
          <div className="mt-8 text-center">
            <PillButton href="/testimoni" variant="light" className="ring-1 ring-brand/15">
              Bagikan Testimoni Anda
            </PillButton>
          </div>
        </section>
      )}

      {/* Gallery call to action (the last section before the footer) */}
      <section className="pb-24 pt-12">
        <SectionHeading
          align="center"
          badge="Galeri Kegiatan"
          title="Tumbuh Bersama Masyarakat"
          description="Dari bantuan pendidikan dan kesehatan hingga perbaikan infrastruktur — setiap kegiatan kami dokumentasikan untuk Anda."
          className="px-4"
        />
        <div data-reveal className="mt-8 text-center">
          <PillButton href="/galeri-kegiatan">Lihat Galeri Kegiatan</PillButton>
        </div>
      </section>
    </div>
  );
}
