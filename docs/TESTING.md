# Panduan Testing: Vitest dan Playwright

Proyek ini punya dua jenis test:

| | Unit test (Vitest) | E2E test (Playwright) |
|---|---|---|
| Lokasi | `tests/unit/` | `tests/e2e/` |
| Yang diuji | Fungsi dan Server Action, tanpa server | Aplikasi sungguhan di browser Chrome |
| Perintah | `npm test` | `npm run test:e2e` |
| Waktu | Sekitar 3 detik | 2–3 menit, termasuk build |
| Butuh | Tidak ada | MySQL, Chrome, internet |

Semua perintah di bawah dijalankan dari folder proyek.

## Vitest

### Menjalankan test

| Tujuan | Perintah |
|---|---|
| Semua test | `npm test` |
| Satu file | `npx vitest run tests/unit/flash.test.ts` |
| Test yang namanya mengandung kata tertentu | `npx vitest run -t "6th attempt"` |
| Otomatis mengulang setiap ada file berubah | `npx vitest` (tekan `q` untuk keluar) |

Mode terakhir paling nyaman saat sedang menulis kode.

### Membaca hasil

Kalau semua lulus:

```
 Test Files  10 passed (10)
      Tests  150 passed (150)
```

Kalau ada yang gagal, Vitest menunjukkan nama test, nilai yang diharapkan dan yang didapat, serta barisnya:

```
 FAIL  tests/unit/flash.test.ts > toFlashCode > rejects "__proto__", which a visitor can type into ?flash=
AssertionError: expected '__proto__' to be null
- Expected:
null
+ Received:
"__proto__"
 ❯ tests/unit/flash.test.ts:12:34
```

Artinya: `toFlashCode("__proto__")` seharusnya `null`, tapi mengembalikan `"__proto__"`.

### Menulis test baru

Buat file berakhiran `.test.ts` di `tests/unit/`:

```ts
import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/utils";

describe("slugify", () => {
  it("mengubah judul menjadi slug", () => {
    expect(slugify("Program CSR 2026")).toBe("program-csr-2026");
  });
});
```

Kode yang memakai `next/headers`, `next/navigation`, atau database perlu ditiruan dengan `vi.mock`. Contohnya ada di `tests/unit/login-action.test.ts`.

## Playwright

### Persiapan

1. Nyalakan MySQL.
2. Matikan `npm run dev`, karena E2E menjalankan `next build` di folder `.next` yang sama.
3. Tambahkan baris ini ke `.env`, hanya di laptop Anda:
   ```ini
   E2E_ALLOW_DATABASE=true
   ```

> **Jangan jalankan E2E di server produksi, dan jangan isi `E2E_ALLOW_DATABASE` di sana.** Test ini menulis ke database di `.env`.

Test hanya membuat testimoni dengan nama berawalan `__E2E__`, lalu menghapusnya beserta fotonya di akhir run. Data lain tidak disentuh.

### Menjalankan test

| Tujuan | Perintah |
|---|---|
| Semua test | `npm run test:e2e` |
| Satu file | `npx playwright test tests/e2e/auth.spec.ts` |
| Test yang namanya mengandung kata tertentu | `npx playwright test -g "6th attempt"` |
| Melihat browsernya berjalan | `npx playwright test --headed` |
| Maju langkah demi langkah | `npx playwright test --debug` |
| Tampilan interaktif untuk memilih dan mengulang test | `npx playwright test --ui` |

### Mempercepat dengan server sendiri

Setiap run melakukan build, sehingga butuh 2–3 menit. Kalau sedang mengulang test yang sama, jalankan server sendiri di terminal terpisah, supaya Playwright tidak perlu build dan satu file test selesai dalam hitungan detik:

```powershell
npm run build
$env:TURNSTILE_SITE_KEY = "1x00000000000000000000AA"
$env:TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
npx next start -p 3100 -H localhost
```

Lalu jalankan test di terminal lain seperti biasa.

**Playwright memakai server apa pun yang sudah berjalan di port 3100, jadi kode terbaru tidak otomatis ikut teruji.** Setelah mengubah kode aplikasi, matikan server itu dengan `Ctrl+C`, lalu build ulang.

### Membaca hasil

Kalau semua lulus:

```
  ok  2 tests\e2e\auth.spec.ts:7:7 › access › admin pages send a logged-out visitor to login and back (1.1s)
  19 passed (3.2m)
```

Baris yang gagal diawali `x`. Di bawah ringkasan, Playwright menampilkan penyebabnya dan letak file trace:

```
  x   5 tests\e2e\auth.spec.ts:36:7 › wrong password › shows a message, then blocks the 6th attempt even when correct (7.5s)
```

### Memeriksa test yang gagal

Setiap test yang gagal menyimpan rekaman (trace) di `test-results/`. Buka dengan perintah yang tercetak di hasil test, misalnya:

```powershell
npx playwright show-trace test-results\nama-folder-test\trace.zip
```

Trace menampilkan setiap langkah, screenshot, request jaringan, dan error di console. Folder `test-results/` dikosongkan otomatis saat run berikutnya dan tidak masuk git.

### Menulis test baru

Buat file berakhiran `.spec.ts` di `tests/e2e/`:

```ts
import { expect, test } from "@playwright/test";

test("halaman testimoni menampilkan judul", async ({ page }) => {
  await page.goto("testimoni");
  await expect(page.getByRole("heading", { name: "Bagikan Testimoni Anda" })).toBeVisible();
});
```

Aturan di proyek ini:

- **Tulis path tanpa `/` di depan:** `page.goto("testimoni")`, bukan `page.goto("/testimoni")`. Garis miring di depan menghilangkan prefix `/web-cdre`.
- **Data testimoni yang dibuat test harus berawalan `E2E_PREFIX`** dari `tests/e2e/helpers.ts`, supaya ikut terhapus. Data dari tabel lain tidak dibersihkan otomatis, jadi hapus sendiri di dalam test.
- **Pakai `test.use(asNewVisitor())` kalau test mengirim form login atau testimoni**, supaya tidak terkena pembatas percobaan dari test lain.
- **Untuk login admin, pakai `loginAsAdmin(page)`** dari `tests/e2e/helpers.ts`.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| `E2E test menulis ke database di .env` | `E2E_ALLOW_DATABASE` belum diisi | Tambahkan ke `.env` di laptop Anda |
| `Can't reach database server`, atau `next build` gagal | MySQL mati | Nyalakan MySQL |
| Test yang gagal tidak sesuai perubahan kode terbaru | Masih memakai server lama di port 3100 | Matikan server itu dengan `Ctrl+C`, lalu ulangi |
| Port 3100 terpakai, tapi terminal servernya tidak ditemukan | Proses lama masih berjalan | `Get-NetTCPConnection -LocalPort 3100 -State Listen` untuk melihat PID-nya, lalu `Stop-Process -Id <PID>` |
| Test di `testimoni.spec.ts` gagal, test lain lulus | Tidak ada internet, sedangkan Turnstile memanggil Cloudflare | Sambungkan internet |
| `Chromium distribution 'chrome' is not found` | Google Chrome belum terpasang | Pasang Chrome |
| Testimoni `__E2E__` masih ada setelah run dihentikan paksa | Pembersihan akhir tidak sempat berjalan | Jalankan E2E sekali lagi, karena data sisa dibersihkan di awal setiap run. Satu test saja cukup: `npx playwright test -g "favicon"` |
