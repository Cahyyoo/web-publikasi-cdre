# Panduan Deploy: Windows Server, pm2, dan Cloudflare

Panduan ini membuka web ke internet di `https://domain-anda.com`, sementara alamat internal `http://cdre.stargate.appinternal.com` lewat Caddy berjalan dengan build yang sama. Kedua alamat tanpa prefix `/web-cdre`.

```
Pengunjung → Cloudflare → Tunnel (cloudflared) ┐
                                               ├→ app di localhost:3020 → MySQL lokal
Pengguna internal → Caddy ─────────────────────┘
```

Ganti `domain-anda.com` dengan domain Anda di semua langkah. Jalankan perintah di PowerShell sebagai Administrator.

## 1. Cek sebelum mulai

Panduan ini bergantung pada beberapa hal. Pastikan dulu, karena kalau salah, langkah berikutnya berubah.

- [ ] **Caddy satu mesin dengan app, dan upstream-nya ditulis `localhost:3020`.** App di panduan ini hanya mendengarkan di `localhost`, yang di Windows berarti `::1`, jadi Caddy dengan upstream `127.0.0.1:3020` tidak akan tersambung. Kalau Caddy beda mesin, hilangkan opsi `-H localhost` di langkah 4, lalu izinkan port 3020 hanya dari IP Caddy. Port 3010 sudah dipakai app `atara`, jangan dipakai.
- [ ] **`cdre.stargate.appinternal.com` sudah punya catatan DNS lokal di UniFi** yang mengarah ke `192.168.100.205`, di tempat yang sama dengan catatan `stargate.appinternal.com`. Hasil build tidak memakai prefix, jadi app butuh host sendiri dan tidak bisa lagi menumpang di `stargate.appinternal.com/web-cdre`. Cek dari komputer klien dengan `nslookup cdre.stargate.appinternal.com`. Hasilnya harus `192.168.100.205`. Kalau hasilnya IP publik, catatan UniFi belum ada atau belum terbaca (jalankan `ipconfig /flushdns`). `appinternal.com` terdaftar di DNS publik, jadi tanpa catatan UniFi, browser mengirim request (termasuk cookie admin) ke server di internet. Kalau domain itu bukan milik perusahaan, server tersebut milik pihak lain.
- [ ] **Alamat Caddy tidak bisa diakses dari internet.** Blok Caddy yang sama juga melayani `starsjournal.id` dan `192.168.100.205`. Coba buka dari jaringan luar, misalnya data seluler. Kalau bisa terbuka, jalur itu melewati semua perlindungan Cloudflare, jadi tutup dulu.
- [ ] **Tunnel, Access, dan Turnstile masih gratis.** Cek di [halaman harga Cloudflare](https://www.cloudflare.com/plans/) sebelum membeli domain.

### Caddyfile

Tambahkan site block baru untuk app ini. Lalu ganti baris `reverse_proxy /web-cdre* localhost:3020` di blok lama dengan redirect, supaya link dan bookmark lama tetap jalan:

```
http://stargate.appinternal.com, http://starsjournal.id, http://localhost, http://192.168.100.205 {
    reverse_proxy /pica-dashboard* localhost:3000
    reverse_proxy /atara* localhost:3010

    # Link lama /web-cdre/... dialihkan ke host baru, tanpa prefix.
    redir /web-cdre http://cdre.stargate.appinternal.com/ 301
    handle_path /web-cdre/* {
        redir http://cdre.stargate.appinternal.com{uri} 301
    }
}

http://cdre.stargate.appinternal.com {
    reverse_proxy localhost:3020
}
```

`handle_path` membuang `/web-cdre` dari path sebelum `{uri}` dibaca. Setelah reload Caddy, uji dengan `curl.exe -I http://stargate.appinternal.com/web-cdre/csr`. Hasilnya harus `Location: http://cdre.stargate.appinternal.com/csr`.

## 2. Siapkan server

Blokir akses langsung dari luar ke port app dan database:

```powershell
New-NetFirewallRule -DisplayName "Blokir masuk app CDRE" -Direction Inbound -Protocol TCP -LocalPort 3020 -Action Block
New-NetFirewallRule -DisplayName "Blokir masuk MySQL" -Direction Inbound -Protocol TCP -LocalPort 3306 -Action Block
```

Atur MySQL hanya mendengarkan koneksi lokal di `my.ini`, lalu restart layanan MySQL:

```ini
[mysqld]
bind-address=127.0.0.1
```

Buat user database khusus, jangan memakai `root`:

```sql
CREATE USER 'cdre_app'@'localhost' IDENTIFIED BY 'password-acak-yang-panjang';
GRANT ALL PRIVILEGES ON `cms-stargate`.* TO 'cdre_app'@'localhost';
```

`GRANT ALL` di sini hanya berlaku untuk database aplikasi, dan dibutuhkan `prisma migrate deploy` untuk mengubah struktur tabel.

## 3. Isi `.env`

Salin dari `.env.example`, lalu ubah nilainya:

```ini
DATABASE_URL="mysql://cdre_app:password-acak-yang-panjang@localhost:3306/cms-stargate"
ADMIN_USERNAME="pilih-username-sendiri"
ADMIN_PASSWORD="password-acak-minimal-20-karakter"
SESSION_SECRET="hasil-perintah-di-bawah"
TURNSTILE_SITE_KEY="dari-langkah-7"
TURNSTILE_SECRET_KEY="dari-langkah-7"
```

Buat `SESSION_SECRET` dengan perintah berikut:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- Biarkan `BASE_PATH` dan `COOKIE_SECURE` kosong. Default-nya, app berjalan tanpa prefix dan cookie memakai atribut `Secure`.
- Kalau `BASE_PATH="/web-cdre"` atau `COOKIE_SECURE=false` pernah diset di server ini, hapus.
- **Login admin hanya bisa lewat HTTPS.** Caddy di server ini melayani HTTP biasa, jadi login admin di `http://cdre.stargate.appinternal.com/admin` akan langsung kembali ke halaman login. Login admin lewat `https://domain-anda.com/admin`. Kalau admin internal harus lewat Caddy, ganti site block menjadi `cdre.stargate.appinternal.com { tls internal ... }`, lalu pasang root CA Caddy di komputer admin.
- Batasi izin file `.env` hanya untuk akun yang menjalankan pm2 dan Administrator.
- Tanpa `TURNSTILE_SECRET_KEY`, form testimoni menolak semua kiriman.

## 4. Build dan jalankan

```powershell
npm ci
npx prisma migrate deploy
npm run build
npm install -g pm2
pm2 start node_modules/next/dist/bin/next --name web-cdre -- start -p 3020 -H localhost
pm2 save
```

- Jangan jalankan `prisma migrate dev` dan `prisma:seed` di server ini. `migrate dev` bisa mereset database, dan seed mengisi data contoh.
- Jalankan `next` langsung seperti di atas, bukan lewat `npm start`. Menjalankan `npm` lewat pm2 bermasalah di Windows, dan `npm start` memakai port 3010 serta membuat app mendengarkan di semua alamat jaringan.
- **Pakai `-H localhost`, jangan `-H 127.0.0.1`.** Dengan `127.0.0.1`, pengunjung yang belum login di `/admin` diarahkan ke `https://localhost:3020/...`, bukan ke domain Anda.
- Pakai satu instance mode fork, jangan `-i` atau cluster. Pembatas percobaan login dan testimoni disimpan di memori proses, jadi tidak akan akurat kalau proses lebih dari satu.
- Akun yang menjalankan pm2 harus punya izin tulis ke `public\uploads`.
- Kalau ada proses pm2 lama untuk app ini, hapus dulu dengan `pm2 delete <nama>`.

Rotasi log supaya disk tidak penuh:

```powershell
pm2 install pm2-logrotate
```

Pastikan app berjalan:

```powershell
curl.exe -I http://localhost:3020/
```

Hasil yang diharapkan: `HTTP/1.1 200 OK`.

### Jalan otomatis setelah server restart

`pm2 startup` tidak mendukung Windows, jadi pakai Task Scheduler. Set dulu `PM2_HOME` supaya pm2 selalu memakai folder yang sama:

```powershell
[Environment]::SetEnvironmentVariable("PM2_HOME", "C:\pm2", "Machine")
```

Tutup dan buka lagi PowerShell, lalu ulangi `pm2 start ...` dan `pm2 save` dari langkah 4. Setelah itu buat task-nya:

```powershell
$pm2 = (Get-Command pm2.cmd).Source
$action = New-ScheduledTaskAction -Execute $pm2 -Argument "resurrect"
$trigger = New-ScheduledTaskTrigger -AtStartup
$credential = Get-Credential -Message "Akun yang menjalankan pm2"
Register-ScheduledTask -TaskName "pm2 resurrect" -Action $action -Trigger $trigger -User $credential.UserName -Password $credential.GetNetworkCredential().Password -RunLevel Highest
```

Uji dengan me-restart server, lalu cek `pm2 list`.

## 5. Sambungkan domain

1. Beli domain, lalu tambahkan ke akun Cloudflare dengan paket Free.
2. Ganti nameserver di tempat Anda membeli domain ke dua nameserver yang diberikan Cloudflare. Tunggu sampai status domain di Cloudflare menjadi **Active**.
3. Di **SSL/TLS → Edge Certificates**, aktifkan **Always Use HTTPS**.

## 6. Buat Cloudflare Tunnel

Tunnel menghubungkan server ke Cloudflare lewat koneksi keluar, jadi tidak perlu membuka port masuk di router atau firewall.

1. Pasang `cloudflared` di server dari [halaman unduhan resmi](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
2. Di dashboard **Zero Trust → Networks → Tunnels**, buat tunnel baru bertipe **Cloudflared**.
3. Jalankan perintah yang diberikan dashboard di server. Perintah ini memasang layanan Windows:
   ```powershell
   cloudflared.exe service install <token-dari-dashboard>
   ```
4. Tambahkan **Public Hostname**:
   - Domain: `domain-anda.com`
   - Path: kosongkan
   - Service: `HTTP` → `localhost:3020`
   - **Jangan isi HTTP Host Header.** Kalau diisi, login dan semua form bisa gagal dengan error "Invalid Server Actions request".

Tunnel sengaja diarahkan langsung ke app, bukan ke Caddy, supaya aplikasi internal lain di Caddy tidak ikut terbuka ke internet.

## 7. Atur Cloudflare

Nama menu di dashboard Cloudflare bisa berubah sewaktu-waktu.

### Turnstile (form testimoni)

1. Buka **Turnstile → Add widget**.
2. Isi hostname `domain-anda.com` dan `cdre.stargate.appinternal.com`, supaya form berfungsi di kedua alamat.
3. Pilih **Widget Mode: Invisible**. Pengunjung tidak melihat kotak apa pun. Cloudflare mewajibkan rujukan ke Turnstile Privacy Addendum untuk mode ini, dan form testimoni sudah menampilkan rujukannya di bawah tombol kirim.
4. Salin **Site Key** dan **Secret Key** ke `.env`, lalu jalankan `pm2 restart web-cdre`.

Kunci di `.env.example` (`1x000...`) adalah kunci uji Cloudflare. Kunci ini selalu lolos dan menampilkan tulisan "For testing only", jadi jangan dipakai di server.

Paket Free cukup untuk situs ini: maksimal 20 widget per akun, 10 hostname per widget, dan jumlah verifikasi tak terbatas. Situs ini hanya memakai 1 widget dengan 2 hostname.

### Access (melindungi panel admin)

1. Buka **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Isi domain `domain-anda.com` dengan path `admin*`.
3. Buat policy **Allow** berisi alamat email para admin, dengan metode login **One-time PIN**.

Dengan ini, admin harus lolos verifikasi email dulu sebelum sampai ke halaman login aplikasi.

### Rate limit (form testimoni)

Free tier hanya memberi satu aturan, jadi pakai untuk form yang terbuka untuk umum. Buka **Security → WAF → Rate limiting rules**:

- URI Path sama dengan `/testimoni`
- Batas: 20 request per 10 detik per IP, tindakan **Block**

Batas ini sengaja longgar, karena free tier tidak bisa menyaring metode, sehingga kunjungan halaman biasa ikut terhitung.

### Cache (mengurangi beban server)

Cloudflare tidak meng-cache `/_next/image` secara default, karena tidak berekstensi gambar. Buka **Caching → Cache Rules**:

- URI Path sama dengan `/_next/image`
- Tindakan: **Eligible for cache**

### Redirect link lama (opsional)

Kalau alamat `https://domain-anda.com/web-cdre/...` pernah dibagikan, buka **Rules → Redirect Rules**:

- URI Path cocok dengan wildcard `/web-cdre/*`
- Dynamic redirect ke `https://domain-anda.com/${1}`, status **301**, centang **Preserve query string**

### Rocket Loader

Pastikan **Speed → Optimization → Rocket Loader** nonaktif, karena bisa mengganggu JavaScript Next.js.

## 8. Backup

Cloudflare tidak mem-backup apa pun. Yang wajib di-backup adalah database dan `public\uploads`, karena `public\uploads` tidak masuk git.

Simpan sebagai `C:\scripts\backup-cdre.ps1`, dan sesuaikan path-nya:

```powershell
$tujuan = "\\server-backup\cdre"   # Lokasi di luar server ini
$tanggal = Get-Date -Format "yyyy-MM-dd"
$app = "C:\path\ke\web-publikasi-cdre"

& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" `
  --defaults-extra-file="C:\scripts\mysql-backup.cnf" `
  --single-transaction --result-file="$tujuan\db-$tanggal.sql" "cms-stargate"
if ($LASTEXITCODE -ne 0) { throw "mysqldump gagal" }

robocopy "$app\public\uploads" "$tujuan\uploads" /E /R:2 /W:5 /NP /LOG:"$tujuan\uploads-$tanggal.log"
if ($LASTEXITCODE -ge 8) { throw "robocopy gagal" }
```

Kredensial disimpan di `C:\scripts\mysql-backup.cnf`, bukan di skrip, dan batasi izin file-nya:

```ini
[client]
user=cdre_app
password=password-acak-yang-panjang
```

Jadwalkan setiap malam:

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File C:\scripts\backup-cdre.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
$credential = Get-Credential -Message "Akun yang menjalankan backup"
Register-ScheduledTask -TaskName "Backup CDRE" -Action $action -Trigger $trigger -User $credential.UserName -Password $credential.GetNetworkCredential().Password
```

Uji pemulihan setidaknya sekali ke database percobaan. Backup yang belum pernah dipulihkan belum tentu bisa dipakai. File backup lama perlu dihapus berkala sesuai kapasitas penyimpanan.

## 9. Checklist setelah online

Jalankan dari jaringan luar, misalnya data seluler:

- [ ] `https://domain-anda.com` membuka beranda tanpa prefix.
- [ ] `https://domain-anda.com/admin` meminta verifikasi email Cloudflare Access.
- [ ] Setelah verifikasi, login admin berhasil, dan upload foto di admin berhasil.
- [ ] Tanpa sesi admin, `/admin` diarahkan ke `https://domain-anda.com/admin/login`, bukan ke `localhost`.
- [ ] Form testimoni menampilkan widget Turnstile, dan kiriman masuk ke `/admin/testimonials` dalam status belum tayang.
- [ ] `http://IP-SERVER:3020` tidak merespons.
- [ ] `https://domain-anda.com/dokumentasi/13-admin-dashboard.png` mengembalikan 404.
- [ ] Muat ulang sebuah foto di `/uploads/...` dua kali, lalu cek header `cf-cache-status: HIT`.
- [ ] Restart server, lalu pastikan app dan tunnel kembali berjalan sendiri.

Dari jaringan internal:

- [ ] `http://cdre.stargate.appinternal.com` bisa dibuka, dan gambar tampil.
- [ ] `http://stargate.appinternal.com/web-cdre/csr` dialihkan ke `http://cdre.stargate.appinternal.com/csr`.

## 10. Update rilis

```powershell
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart web-cdre
```

Jangan hapus `public\uploads` saat update, karena isinya data aplikasi yang tidak ada di git.

## Kalau ada masalah

| Gejala | Penyebab yang umum | Solusi |
|---|---|---|
| Login atau form gagal dengan "Invalid Server Actions request" | HTTP Host Header di tunnel diubah | Kosongkan di pengaturan Public Hostname |
| `/admin` diarahkan ke `localhost` | App dijalankan dengan `-H 127.0.0.1` | Jalankan dengan `-H localhost` |
| Error 502 di alamat internal setelah pindah ke `-H localhost` | Upstream Caddy memakai `127.0.0.1:3020` | Ganti upstream Caddy ke `localhost:3020` |
| Halaman tampil tanpa CSS, atau gambar 404, di alamat internal | Build masih memakai `BASE_PATH="/web-cdre"`, atau Caddy masih memakai `reverse_proxy /web-cdre*` | Hapus `BASE_PATH` dari `.env`, build ulang, dan pakai site block `cdre.stargate.appinternal.com` |
| Login berhasil, tapi langsung kembali ke halaman login | Cookie `Secure` di HTTP biasa | Login lewat `https://domain-anda.com/admin`, atau pakai `tls internal` di Caddy |
| "Terlalu banyak percobaan" saat login | 5 kali gagal dalam 15 menit | Tunggu 15 menit, atau `pm2 restart web-cdre` |
| Form testimoni selalu "Verifikasi keamanan gagal" | Kunci Turnstile salah, atau hostname belum didaftarkan | Cek `.env` dan pengaturan widget |
| Muncul tulisan "For testing only" di form testimoni | `.env` server masih memakai kunci uji `1x000...` | Ganti dengan kunci asli dari langkah 7, lalu `pm2 restart web-cdre` |
| Alamat internal tidak bisa dibuka, dan `nslookup` memberi IP publik | Catatan DNS lokal di UniFi belum ada | Tambahkan `cdre.stargate.appinternal.com` → `192.168.100.205` di UniFi, lalu `ipconfig /flushdns` di komputer klien |
| Error 502 atau 1033 dari Cloudflare | App atau `cloudflared` mati | Cek `pm2 list` dan layanan `cloudflared` |
