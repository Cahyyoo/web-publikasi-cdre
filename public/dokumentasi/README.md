# Dokumentasi Tampilan — CMS Web CDRE

Tangkapan layar seluruh halaman aplikasi, diambil otomatis dari build produksi
(`next build` + `next start`) pada lebar 1440px, mode halaman penuh.

- **43 halaman**, semuanya berstatus HTTP 200 dan seluruh gambarnya termuat.
- Diambil pada **30 September 2026**.
- Ukuran total: **3,17 MB** (PNG, kompresi lossless).

> **Perhatian keamanan:** folder ini berada di dalam `public/`, sehingga **bisa
> diakses siapa saja** lewat `/dokumentasi/<nama-berkas>.png` — termasuk
> tangkapan layar panel admin beserta datanya. Pindahkan ke luar `public/` bila
> situs ini sudah tayang untuk umum.

## Halaman publik

| Halaman | Rute | Berkas |
| --- | --- | --- |
| Beranda | `/` | [01-publik-beranda.png](01-publik-beranda.png) |
| Publikasi PPM | `/ppm` | [02-publik-ppm.png](02-publik-ppm.png) |
| Publikasi CSR | `/csr` | [03-publik-csr.png](03-publik-csr.png) |
| Detail artikel | `/artikel/[slug]` | [04-publik-artikel-detail.png](04-publik-artikel-detail.png) |
| Katalog binaan UMKM | `/binaan` | [05-publik-binaan-umkm.png](05-publik-binaan-umkm.png) |
| Galeri penghargaan | `/penghargaan` | [06-publik-penghargaan.png](06-publik-penghargaan.png) |
| Galeri kegiatan | `/galeri-kegiatan` | [07-publik-galeri-kegiatan.png](07-publik-galeri-kegiatan.png) |
| Hasil pencarian | `/search?q=bantuan` | [08-publik-pencarian.png](08-publik-pencarian.png) |
| Form kirim testimoni | `/testimoni` | [09-publik-testimoni-form.png](09-publik-testimoni-form.png) |
| Testimoni terkirim (notifikasi) | `/testimoni?flash=testimoni-terkirim` | [10-publik-testimoni-terkirim.png](10-publik-testimoni-terkirim.png) |

## Panel admin

| Halaman | Rute | Berkas |
| --- | --- | --- |
| Login | `/admin/login` | [11-admin-login.png](11-admin-login.png) |
| Login gagal (notifikasi) | `/admin/login?flash=login-failed` | [12-admin-login-gagal.png](12-admin-login-gagal.png) |
| Dashboard | `/admin` | [13-admin-dashboard.png](13-admin-dashboard.png) |
| Artikel — daftar | `/admin/posts` | [14-admin-artikel-daftar.png](14-admin-artikel-daftar.png) |
| Artikel — tambah (CKEditor) | `/admin/posts/new` | [15-admin-artikel-tambah.png](15-admin-artikel-tambah.png) |
| Artikel — edit | `/admin/posts/[id]` | [16-admin-artikel-edit.png](16-admin-artikel-edit.png) |
| Kategori PPM & CSR — daftar | `/admin/categories` | [17-admin-kategori-daftar.png](17-admin-kategori-daftar.png) |
| Kategori — tambah | `/admin/categories/new` | [18-admin-kategori-tambah.png](18-admin-kategori-tambah.png) |
| Kategori — edit | `/admin/categories/[id]` | [19-admin-kategori-edit.png](19-admin-kategori-edit.png) |
| Kategori kegiatan — daftar | `/admin/activity-categories` | [20-admin-kategori-kegiatan-daftar.png](20-admin-kategori-kegiatan-daftar.png) |
| Kategori kegiatan — tambah | `/admin/activity-categories/new` | [21-admin-kategori-kegiatan-tambah.png](21-admin-kategori-kegiatan-tambah.png) |
| Kategori kegiatan — edit | `/admin/activity-categories/[id]` | [22-admin-kategori-kegiatan-edit.png](22-admin-kategori-kegiatan-edit.png) |
| Foto kegiatan — daftar | `/admin/activity-gallery` | [23-admin-galeri-kegiatan-daftar.png](23-admin-galeri-kegiatan-daftar.png) |
| Foto kegiatan — tambah | `/admin/activity-gallery/new` | [24-admin-galeri-kegiatan-tambah.png](24-admin-galeri-kegiatan-tambah.png) |
| Foto kegiatan — edit | `/admin/activity-gallery/[id]` | [25-admin-galeri-kegiatan-edit.png](25-admin-galeri-kegiatan-edit.png) |
| Kelompok binaan — daftar | `/admin/binaan-groups` | [26-admin-kelompok-binaan-daftar.png](26-admin-kelompok-binaan-daftar.png) |
| Kelompok binaan — tambah | `/admin/binaan-groups/new` | [27-admin-kelompok-binaan-tambah.png](27-admin-kelompok-binaan-tambah.png) |
| Kelompok binaan — edit | `/admin/binaan-groups/[id]` | [28-admin-kelompok-binaan-edit.png](28-admin-kelompok-binaan-edit.png) |
| Penghargaan — daftar | `/admin/gallery` | [29-admin-penghargaan-daftar.png](29-admin-penghargaan-daftar.png) |
| Penghargaan — tambah | `/admin/gallery/new` | [30-admin-penghargaan-tambah.png](30-admin-penghargaan-tambah.png) |
| Penghargaan — edit | `/admin/gallery/[id]` | [31-admin-penghargaan-edit.png](31-admin-penghargaan-edit.png) |
| Produk — daftar | `/admin/products` | [32-admin-produk-daftar.png](32-admin-produk-daftar.png) |
| Produk — tambah | `/admin/products/new` | [33-admin-produk-tambah.png](33-admin-produk-tambah.png) |
| Produk — edit | `/admin/products/[id]` | [34-admin-produk-edit.png](34-admin-produk-edit.png) |
| Testimoni — daftar | `/admin/testimonials` | [35-admin-testimoni-daftar.png](35-admin-testimoni-daftar.png) |
| Testimoni — tambah | `/admin/testimonials/new` | [36-admin-testimoni-tambah.png](36-admin-testimoni-tambah.png) |
| Testimoni — edit | `/admin/testimonials/[id]` | [37-admin-testimoni-edit.png](37-admin-testimoni-edit.png) |
| Gambar hero & banner — daftar | `/admin/hero-images` | [38-admin-hero-banner-daftar.png](38-admin-hero-banner-daftar.png) |
| Gambar hero & banner — ganti | `/admin/hero-images/[slot]` | [39-admin-hero-banner-edit.png](39-admin-hero-banner-edit.png) |
| Pengaturan footer | `/admin/footer` | [40-admin-footer.png](40-admin-footer.png) |
| Pengaturan sambutan | `/admin/sambutan` | [41-admin-sambutan.png](41-admin-sambutan.png) |

## Notifikasi aksi admin

Dua contoh umpan balik yang kini muncul setelah setiap aksi di panel admin.

| Halaman | Rute | Berkas |
| --- | --- | --- |
| Notifikasi sukses | `/admin/sambutan?flash=updated` | [42-admin-notifikasi-sukses.png](42-admin-notifikasi-sukses.png) |
| Notifikasi gagal | `/admin/categories?flash=in-use-category` | [43-admin-notifikasi-gagal.png](43-admin-notifikasi-gagal.png) |

## Catatan pengambilan

- Rute dinamis memakai data nyata dari database (artikel `id=1`, kategori
  `id=1`, foto kegiatan `id=3`, penghargaan `id=2`), jadi tidak ada halaman
  yang tertangkap dalam keadaan 404.
- Halaman admin diambil pada viewport 1440×1050 agar seluruh menu sidebar
  terlihat; pada 900px menu paling bawah terpotong karena sidebar memang
  `h-screen` dengan daftar menu yang menggulir sendiri.
- Browser digulir sampai dasar halaman sebelum pemotretan, karena `next/image`
  menunda pemuatan gambar di bawah layar — tanpa itu bagian bawah halaman
  tertangkap kosong.
- Transisi CSS dibekukan agar korsel tidak tertangkap saat sedang memudar.

## Cara memperbarui

```bash
npm i -D puppeteer-core        # sekali saja
npm run build && npm run start # server di port 3010
node scripts/screenshot-dokumentasi.js
```

Langkah kompresi lossless-nya ada di komentar paling atas
[`scripts/screenshot-dokumentasi.js`](../../scripts/screenshot-dokumentasi.js).
Skrip itu memakai Chrome yang sudah terpasang di mesin (bukan mengunduh
sendiri) dan membuat sesi admin langsung dari `SESSION_SECRET`, jadi halaman
admin bisa ditangkap tanpa proses login.
