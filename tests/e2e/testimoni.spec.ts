import { expect, test, type Page } from "@playwright/test";
import { asNewVisitor, E2E_PREFIX, imagePathInRow, loginAsAdmin, PHOTO } from "./helpers";

test.use(asNewVisitor());

const form = (page: Page) => page.locator("form", { has: page.getByLabel("Testimoni Anda") });
const turnstileToken = (page: Page) => form(page).locator('input[name="cf-turnstile-response"]');

async function fillForm(page: Page, name: string) {
  await page.getByLabel("Nama").fill(name);
  await page.getByLabel("Jabatan / Instansi").fill("Penguji");
  await page.getByLabel("Testimoni Anda").fill("Isi testimoni uji.");
}

test("the Turnstile widget returns after client-side navigation", async ({ page }) => {
  await page.goto("testimoni");
  await expect(turnstileToken(page)).toHaveValue(/.+/);

  await page.getByRole("link", { name: "Beranda" }).first().click();
  await expect(page).toHaveURL(/\/web-cdre\/?$/);

  await page.goBack();
  await expect(turnstileToken(page)).toHaveValue(/.+/);
});

test("a submission with a photo waits for moderation", async ({ page, request }) => {
  const name = `${E2E_PREFIX} kiriman publik`;

  await page.goto("testimoni");
  await fillForm(page, name);
  await page.getByLabel(/^Foto/).setInputFiles(PHOTO);
  await expect(turnstileToken(page)).toHaveValue(/.+/);
  await page.getByRole("button", { name: "Kirim Testimoni" }).click();
  await expect(page.getByText("Testimoni Anda sudah kami terima")).toBeVisible();

  await loginAsAdmin(page);
  await page.goto("admin/testimonials");
  const row = page.getByRole("row", { name });
  await expect(row.getByRole("button", { name: "Menunggu" })).toBeVisible();

  const imagePath = await imagePathInRow(page, name);
  expect(imagePath).toMatch(/^\/web-cdre\/uploads\/testimonials\/.+\.webp$/);
  const photo = await request.get(imagePath.replace("/web-cdre/", ""));
  expect(photo.status()).toBe(200);
  expect(photo.headers()["content-type"]).toBe("image/webp");
});

test("a submission without a Turnstile token is refused", async ({ page }) => {
  await page.route("**/turnstile/**", (route) => route.abort());

  await page.goto("testimoni");
  await fillForm(page, `${E2E_PREFIX} tanpa token`);
  await page.getByRole("button", { name: "Kirim Testimoni" }).click();

  await expect(page.getByText("Verifikasi keamanan gagal")).toBeVisible();
});
