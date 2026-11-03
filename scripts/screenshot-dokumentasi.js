/**
 * Regenerates public/dokumentasi/ — a full-page screenshot of every route.
 *
 * Needs a one-off dev dependency and a running production server:
 *
 *   npm i -D puppeteer-core
 *   npm run build && npm run start      # port 3010
 *   node scripts/screenshot-dokumentasi.js
 *
 * It drives the Chrome already installed on the machine rather than
 * downloading its own, and mints an admin session straight from
 * SESSION_SECRET so the admin routes can be captured without a login flow.
 *
 * Afterwards, shrink the PNGs losslessly (about 67% smaller):
 *
 *   node -e "const s=require('sharp'),f=require('fs'),p=require('path'),d='public/dokumentasi';(async()=>{for(const n of f.readdirSync(d).filter(x=>x.endsWith('.png'))){const t=p.join(d,n);const b=await s(t).png({compressionLevel:9,effort:10}).toBuffer();if(b.length<f.statSync(t).size)f.writeFileSync(t,b)}})()"
 */
const fs = require("fs");
const path = require("path");
const { webcrypto } = require("crypto");
const puppeteer = require("puppeteer-core");

const PROJECT = path.resolve(__dirname, "..");
const BASE = process.env.BASE_URL || "http://localhost:3010";
const OUT = path.join(PROJECT, "public", "dokumentasi");
const CHROME =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const WIDTH = 1440;
const HEIGHT = 900;
// The admin sidebar is h-screen with an internally scrolling menu that needs
// ~794px; at 900px viewport the last items are cut off. A taller viewport
// shows the whole menu without touching the app's CSS.
const ADMIN_HEIGHT = 1050;

// Real ids pulled from the database so no dynamic route 404s.
const ID = {
  postSlug: "bantuan-beasiswa-pelajar-desa-alenggo",
  post: 1,
  category: 1,
  activityCategory: 1,
  activityPhoto: 3,
  binaanGroup: 1,
  gallery: 2,
  product: 1,
  testimonial: 1,
};

// [filename, url, options] — auth = send admin session cookie,
// editor = wait for CKEditor to mount before shooting.
const PAGES = [
  // ---- Publik -------------------------------------------------------
  ["01-publik-beranda", "/"],
  ["02-publik-ppm", "/ppm"],
  ["03-publik-csr", "/csr"],
  ["04-publik-artikel-detail", "/artikel/" + ID.postSlug],
  ["05-publik-binaan-umkm", "/binaan"],
  ["06-publik-penghargaan", "/penghargaan"],
  ["07-publik-galeri-kegiatan", "/galeri-kegiatan"],
  ["08-publik-pencarian", "/search?q=bantuan"],
  ["09-publik-testimoni-form", "/testimoni"],
  ["10-publik-testimoni-terkirim", "/testimoni?flash=testimoni-terkirim"],

  // ---- Admin --------------------------------------------------------
  ["11-admin-login", "/admin/login"],
  ["12-admin-login-gagal", "/admin/login?flash=login-failed"],
  ["13-admin-dashboard", "/admin", { auth: true }],
  ["14-admin-artikel-daftar", "/admin/posts", { auth: true }],
  ["15-admin-artikel-tambah", "/admin/posts/new", { auth: true, editor: true }],
  ["16-admin-artikel-edit", "/admin/posts/" + ID.post, { auth: true, editor: true }],
  ["17-admin-kategori-daftar", "/admin/categories", { auth: true }],
  ["18-admin-kategori-tambah", "/admin/categories/new", { auth: true }],
  ["19-admin-kategori-edit", "/admin/categories/" + ID.category, { auth: true }],
  ["20-admin-kategori-kegiatan-daftar", "/admin/activity-categories", { auth: true }],
  ["21-admin-kategori-kegiatan-tambah", "/admin/activity-categories/new", { auth: true }],
  ["22-admin-kategori-kegiatan-edit", "/admin/activity-categories/" + ID.activityCategory, { auth: true }],
  ["23-admin-galeri-kegiatan-daftar", "/admin/activity-gallery", { auth: true }],
  ["24-admin-galeri-kegiatan-tambah", "/admin/activity-gallery/new", { auth: true }],
  ["25-admin-galeri-kegiatan-edit", "/admin/activity-gallery/" + ID.activityPhoto, { auth: true }],
  ["26-admin-kelompok-binaan-daftar", "/admin/binaan-groups", { auth: true }],
  ["27-admin-kelompok-binaan-tambah", "/admin/binaan-groups/new", { auth: true }],
  ["28-admin-kelompok-binaan-edit", "/admin/binaan-groups/" + ID.binaanGroup, { auth: true }],
  ["29-admin-penghargaan-daftar", "/admin/gallery", { auth: true }],
  ["30-admin-penghargaan-tambah", "/admin/gallery/new", { auth: true }],
  ["31-admin-penghargaan-edit", "/admin/gallery/" + ID.gallery, { auth: true }],
  ["32-admin-produk-daftar", "/admin/products", { auth: true }],
  ["33-admin-produk-tambah", "/admin/products/new", { auth: true }],
  ["34-admin-produk-edit", "/admin/products/" + ID.product, { auth: true }],
  ["35-admin-testimoni-daftar", "/admin/testimonials", { auth: true }],
  ["36-admin-testimoni-tambah", "/admin/testimonials/new", { auth: true }],
  ["37-admin-testimoni-edit", "/admin/testimonials/" + ID.testimonial, { auth: true }],
  ["38-admin-hero-banner-daftar", "/admin/hero-images", { auth: true }],
  ["39-admin-hero-banner-edit", "/admin/hero-images/HOME_HERO", { auth: true }],
  ["40-admin-footer", "/admin/footer", { auth: true }],
  ["41-admin-sambutan", "/admin/sambutan", { auth: true }],

  // ---- Notifikasi (fitur yang baru ditambahkan) -----------------------
  ["42-admin-notifikasi-sukses", "/admin/sambutan?flash=updated", { auth: true }],
  ["43-admin-notifikasi-gagal", "/admin/categories?flash=in-use-category", { auth: true }],
];

async function mintSessionCookie() {
  const env = fs.readFileSync(path.join(PROJECT, ".env"), "utf8");
  const match = env.match(/^SESSION_SECRET=(.*)$/m);
  const secret = match && match[1].trim().replace(/^["']|["']$/g, "");
  if (!secret) throw new Error("SESSION_SECRET tidak ditemukan di .env");

  const key = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expiresAt = String(Date.now() + 8 * 3600 * 1000);
  const sig = await webcrypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(expiresAt)
  );
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return {
    name: "admin_session",
    value: expiresAt + "." + hex,
    domain: "localhost",
    path: "/",
  };
}

/**
 * next/image lazy-loads by default, so anything below the initial viewport is
 * never requested unless the page is scrolled — a fullPage screenshot would
 * capture empty boxes. Walk to the bottom, then return to the top.
 */
function autoScroll(page) {
  return page.evaluate(function () {
    return new Promise(function (resolve) {
      var y = 0;
      var step = 400;
      var timer = setInterval(function () {
        window.scrollTo(0, y);
        y += step;
        if (y > document.body.scrollHeight + window.innerHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve(undefined);
        }
      }, 60);
    });
  });
}

/** Waits for images, capped so one stuck request can't stall the run. */
function waitForImages(page, budgetMs) {
  return page.evaluate(function (budget) {
    var pending = Array.prototype.slice
      .call(document.images)
      .filter(function (img) {
        return !img.complete;
      })
      .map(function (img) {
        return new Promise(function (resolve) {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      });
    return Promise.race([
      Promise.all(pending).then(function () {
        return "all-loaded";
      }),
      new Promise(function (r) {
        setTimeout(function () {
          r("timeout");
        }, budget);
      }),
    ]);
  }, budgetMs);
}

/** Images still blank at screenshot time — reported so nothing ships silently broken. */
function brokenImages(page) {
  return page.evaluate(function () {
    return Array.prototype.slice
      .call(document.images)
      .filter(function (img) {
        return !img.complete || img.naturalWidth === 0;
      })
      .map(function (img) {
        return img.currentSrc || img.src;
      });
  });
}

(async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const cookie = await mintSessionCookie();

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    protocolTimeout: 300000,
    defaultViewport: { width: WIDTH, height: HEIGHT },
    args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
  });

  const results = [];

  for (const entry of PAGES) {
    const name = entry[0];
    const url = entry[1];
    const opts = entry[2] || {};

    // A fresh context per page keeps the unauthenticated login shots clean.
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();

    try {
      if (opts.auth) await ctx.setCookie(cookie);

      if (url.startsWith("/admin")) {
        await page.setViewport({ width: WIDTH, height: ADMIN_HEIGHT });
      }

      const res = await page.goto(BASE + url, {
        waitUntil: "networkidle2",
        timeout: 90000,
      });
      const status = res ? res.status() : 0;

      // Freeze transitions so carousels aren't captured mid-fade.
      await page.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important}",
      });

      if (opts.editor) {
        await page
          .waitForSelector(".ck-editor__editable", { timeout: 30000 })
          .catch(function () {
            console.log("     (editor tidak muncul: " + name + ")");
          });
      }

      await autoScroll(page);
      await page.waitForNetworkIdle({ idleTime: 700, timeout: 45000 }).catch(() => {});
      await waitForImages(page, 25000);
      await new Promise((r) => setTimeout(r, 400));

      const broken = await brokenImages(page);

      await page.screenshot({
        path: path.join(OUT, name + ".png"),
        fullPage: true,
      });

      const bytes = fs.statSync(path.join(OUT, name + ".png")).size;
      results.push({
        name: name,
        url: url,
        status: status,
        brokenImages: broken.length,
        bytes: bytes,
      });
      console.log(
        String(status).padEnd(4) +
          name.padEnd(38) +
          (broken.length ? broken.length + " gambar kosong" : "ok")
      );
      if (broken.length) {
        broken.slice(0, 3).forEach(function (s) {
          console.log("       " + s.slice(0, 110));
        });
      }
    } catch (err) {
      results.push({ name: name, url: url, status: "ERROR", error: err.message });
      console.log("ERR  " + name + " -> " + err.message);
    } finally {
      await ctx.close();
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(OUT, "_hasil.json"),
    JSON.stringify(results, null, 2)
  );

  const failed = results.filter((r) => r.status !== 200);
  const withBroken = results.filter((r) => r.brokenImages > 0);
  console.log(
    "\n" + (results.length - failed.length) + "/" + results.length + " halaman status 200"
  );
  console.log(
    withBroken.length
      ? withBroken.length + " halaman masih ada gambar kosong"
      : "semua gambar termuat"
  );
})();
