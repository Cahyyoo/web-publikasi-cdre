# Stargate Web CMS

Portal website & CMS kustom untuk PT Stargate Pasific Resource. Dibangun dengan Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, dan MySQL.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Salin `.env.example` menjadi `.env` dan sesuaikan nilainya:
   ```
   cp .env.example .env
   ```
   - `DATABASE_URL` — kredensial MySQL Anda.
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — login untuk `/admin`.
   - `SESSION_SECRET` — string acak panjang untuk menandatangani cookie sesi admin, mis. `openssl rand -hex 32`.
   - `COOKIE_SECURE` (opsional) — set `false` kalau `/admin` diakses lewat HTTP biasa tanpa TLS (mis. IP LAN); set `true` kalau nanti dipasang di belakang reverse proxy dengan HTTPS asli. Kalau dibiarkan kosong, defaultnya `true` saat `NODE_ENV=production` (termasuk saat `npm run start`).

3. Jalankan migrasi Prisma untuk membuat tabel di database:
   ```
   npm run prisma:migrate
   ```

4. (Opsional) Isi data contoh:
   ```
   npm run prisma:seed
   ```

5. Jalankan development server:
   ```
   npm run dev
   ```

## Admin CMS (`/admin`)

Panel admin untuk mengelola seluruh konten dinamis tanpa Prisma Studio: Testimoni, Kategori, Artikel PPM/CSR (Post), Kelompok Binaan, Produk, Galeri Penghargaan, Galeri Kegiatan (kategori + foto carousel), dan Gambar Hero/Banner situs publik.

- Login di `/admin/login` memakai `ADMIN_USERNAME`/`ADMIN_PASSWORD` dari `.env` (satu akun bersama, tidak ada tabel user).
- Autentikasi berbasis cookie HttpOnly yang ditandatangani (HMAC, Web Crypto API) — lihat `lib/session.ts` dan `middleware.ts`. Middleware melindungi semua route `/admin/**` kecuali `/admin/login`.
- Setiap resource punya pola CRUD yang sama: `list (page.tsx)` → `new/page.tsx` → `[id]/page.tsx` (edit), dengan Server Actions di `actions.ts` pada masing-masing folder (`app/admin/(dashboard)/<resource>/`).
- Field gambar (`imageUrl`, `photoUrl`, `thumbnailUrl`) berupa upload file langsung (JPG/PNG/WEBP/GIF, maks. 5MB) lewat `lib/upload.ts` — tersimpan di `public/uploads/<subfolder>/` (di-gitignore, data runtime) dan belum memakai storage eksternal (S3/Cloudinary/dll).
- Kategori dan Kelompok Binaan tidak bisa dihapus selama masih dipakai Artikel/Produk (dicegah lewat penanganan error foreign key `P2003`, bukan `onDelete: Cascade`).
- Testimoni yang masuk lewat form publik `/testimoni` otomatis tersimpan dengan `isPublished = false` dan harus disetujui manual di `/admin/testimonials` sebelum tampil di Beranda.
- `/admin/hero-images` mengelola 7 gambar hero/banner tetap di situs publik (hero Beranda, gambar Sambutan, dan banner judul `ppm`/`csr`/`binaan`/`penghargaan`/`galeri-kegiatan`) — slot-nya sudah tetap (dibuat lewat migrasi), admin hanya mengganti gambarnya; tiap form upload menampilkan rekomendasi dimensi per slot.
- `/admin/sambutan` dan `/admin/footer` mengelola teks (kutipan/deskripsi Sambutan di Beranda; deskripsi, kontak, dan link sosial media di footer) — masing-masing halaman settings tunggal (baris singleton `id=1` di database, tanpa list/create/delete).
- Field "Konten" Artikel memakai rich text editor CKEditor 5 (`components/admin/RichTextEditor.tsx`, format teks standar: heading, bold/italic/underline, list, blockquote, link) menggantikan textarea HTML manual — hasilnya tetap disimpan sebagai string HTML di `Post.content`.

**Ganti password default sebelum deploy** — `ADMIN_PASSWORD` di `.env.example` hanya placeholder.

## Struktur Proyek

- `prisma/schema.prisma` — Definisi seluruh model database (Testimonial, Category, Post, BinaanGroup, Product, Gallery, ActivityCategory, ActivityPhoto, HeroImage, Sambutan, FooterSettings).
- `lib/prisma.ts` — Singleton Prisma Client.
- `lib/session.ts` — Sesi admin (buat & verifikasi token bertanda tangan).
- `lib/upload.ts` — Validasi & penyimpanan file gambar yang diunggah ke `public/uploads/`.
- `lib/hero-images.ts` — Metadata (label, lokasi, rekomendasi ukuran) & query untuk tiap slot `HeroImage`, dipakai halaman publik & admin.
- `lib/sambutan.ts`, `lib/footer-settings.ts` — Query singleton (baris `id=1`) untuk teks Sambutan Beranda dan pengaturan footer, dengan fallback default kalau baris belum ada.
- `lib/posts.ts`, `lib/utils.ts` — Helper query & formatting bersama.
- `middleware.ts` — Menjaga akses ke `/admin/**`.
- `app/layout.tsx` — Root layout (hanya `<html>/<body>`, tanpa chrome situs publik).
- `app/(public)/layout.tsx` — Navbar + Footer publik, membungkus semua halaman pengunjung.
- `app/(public)/(content)/` — Route group full-width untuk halaman konten: `ppm`, `csr`, `binaan`, `penghargaan`, `galeri-kegiatan`, `artikel/[slug]`.
- `app/(public)/search`, `app/(public)/testimoni` — Halaman publik lain di luar route group `(content)`: pencarian artikel, dan form kirim testimoni (dengan moderasi admin).
- `app/admin/login/` — Halaman & Server Actions login/logout (di luar shell sidebar admin).
- `app/admin/(dashboard)/` — Dashboard + CRUD tiap resource (`categories`, `posts`, `binaan-groups`, `products`, `gallery`, `testimonials`, `activity-categories`, `activity-gallery`, `hero-images`, `sambutan`, `footer`), dibungkus `components/admin/AdminSidebar.tsx`. `hero-images` bukan CRUD penuh — hanya `list` dan `[slot]/page.tsx` (edit) karena slot-nya tetap, tanpa `new`/delete. `sambutan` dan `footer` malah lebih sederhana lagi — cuma satu halaman form settings, tanpa list sama sekali.
- `components/admin/` — `AdminSidebar`, `DeleteButton` (tombol hapus + confirm), `PhotoRequirements`, `RichTextEditor`/`RichTextEditorInner` (editor CKEditor 5 untuk field HTML, lihat catatan di bawah), `formStyles.ts` (kelas Tailwind form bersama).
- `components/home/` — Bagian-bagian halaman Beranda: `FeaturedPosts`, `TestimonialSlider`.
- `components/gallery/ActivityCarousel.tsx` — Carousel foto Galeri Kegiatan per kategori.
- `components/layout/` — `Navbar`, `MobileMenu`, `Footer` publik.
- `components/ui/PageBanner.tsx` — Banner judul halaman untuk route di `(content)`.
- `components/ui/ScrollReveal.tsx` — Animasi muncul saat di-scroll untuk elemen bertanda `data-reveal` (stagger via `revealProps()` di `lib/utils.ts`); dipasang sekali di layout publik. Animasi saat halaman dimuat (hero, banner) memakai kelas `animate-*` dari `tailwind.config.ts`.

## Catatan

- Hampir seluruh halaman (publik & admin) memakai `export const dynamic = "force-dynamic"` (di `app/layout.tsx`) karena datanya diambil langsung dari database di setiap request. Ini bisa disesuaikan per-route (mis. `revalidate`) setelah kebutuhan caching lebih jelas.
- Logo (`public/logo.png`) adalah aset asli perusahaan — kalau diganti, sesuaikan juga `width`/`height` pada `<Image>` di `components/layout/Navbar.tsx` dengan dimensi file barunya.
- `next.config.mjs` mengizinkan semua hostname `https` untuk `next/image` guna mempermudah development; batasi ke domain CDN/storage yang sebenarnya sebelum production.
- Warna utama situs (`brand.*`) didefinisikan sekali di `tailwind.config.ts` dan dipakai konsisten lewat kelas seperti `bg-brand`/`text-brand` — ubah di satu tempat untuk rebranding.
- File yang diunggah lewat admin/form publik disimpan di `public/uploads/` di server lokal — kalau deploy ke platform dengan filesystem ephemeral (mis. Vercel), file ini akan hilang saat redeploy; pertimbangkan storage eksternal untuk produksi.
- Cookie sesi admin (`admin_session`) memakai atribut `Secure` secara default saat `NODE_ENV=production` (termasuk `npm run start`). Kalau CMS diakses lewat HTTP biasa dari komputer lain di LAN (mis. `http://192.168.x.x:3010`, tanpa reverse proxy/TLS), browser di komputer itu akan diam-diam menolak menyimpan cookie tersebut — login tampak berhasil tapi klik menu apa pun langsung terlempar balik ke halaman login. Set `COOKIE_SECURE=false` di `.env` untuk deployment seperti ini.
- `RichTextEditor` (dipakai di field Konten Artikel) memuat CKEditor 5 (`ckeditor5` + `@ckeditor/ckeditor5-react`) secara client-only lewat `next/dynamic(..., { ssr: false })`, karena CKEditor butuh API browser dan tidak bisa di-server-side-render. Konfigurasinya memakai `licenseKey: "GPL"` (lisensi self-hosted gratis sesuai ketentuan GPL CKEditor) — ganti ke license key komersial kalau butuh plugin premium di kemudian hari.
- Styling konten HTML (`prose prose-slate`, dipakai untuk render `Post.content` di `app/(public)/(content)/artikel/[slug]/page.tsx`) memakai plugin `@tailwindcss/typography` yang didaftarkan di `tailwind.config.ts` — tanpa plugin ini, heading/list/blockquote dari CKEditor tampil polos tanpa style di halaman publik.
