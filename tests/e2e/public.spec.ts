import { expect, test } from "@playwright/test";

const PUBLIC_PAGES = [
  "",
  "ppm",
  "csr",
  "binaan",
  "penghargaan",
  "galeri-kegiatan",
  "search",
  "testimoni",
  "admin/login",
];

for (const path of PUBLIC_PAGES) {
  test(`/${path} opens without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    expect(errors).toEqual([]);
  });
}

test("admin screenshots are not public", async ({ request }) => {
  const response = await request.get("dokumentasi/13-admin-dashboard.png");
  expect(response.status()).toBe(404);
});

test("favicon is served", async ({ request }) => {
  const response = await request.get("favicon.ico");
  expect(response.status()).toBe(200);
});
