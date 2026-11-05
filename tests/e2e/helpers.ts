import { expect, type Page } from "@playwright/test";

/** Marks rows created by tests. Cleanup deletes only rows whose name starts with this. */
export const E2E_PREFIX = "__E2E__";

/** A 1x1 PNG, for setInputFiles. */
export const PHOTO = {
  name: "uji.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  ),
};

/**
 * Login attempts and testimonials are limited per IP in the server's memory, so
 * a random address stays clear of what other specs and earlier runs have counted.
 */
export function asNewVisitor() {
  const octet = () => Math.floor(Math.random() * 254) + 1;
  return { extraHTTPHeaders: { "x-forwarded-for": `10.${octet()}.${octet()}.${octet()}` } };
}

export async function submitLogin(page: Page, password = process.env.ADMIN_PASSWORD!) {
  await page.getByLabel("Username").fill(process.env.ADMIN_USERNAME!);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

export async function loginAsAdmin(page: Page) {
  await page.goto("admin/login");
  await submitLogin(page);
  await expect(page).toHaveURL(/\/web-cdre\/admin$/);
}

/** Path of the image a row's thumbnail shows, read from the next/image URL. */
export async function imagePathInRow(page: Page, rowName: string) {
  const src = await page.getByRole("row", { name: rowName }).locator("img").getAttribute("src");
  return new URL(src!, page.url()).searchParams.get("url")!;
}
