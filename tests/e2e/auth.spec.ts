import { expect, test } from "@playwright/test";
import { asNewVisitor, loginAsAdmin, submitLogin } from "./helpers";

test.describe("access", () => {
  test.use(asNewVisitor());

  test("admin pages send a logged-out visitor to login and back", async ({ page }) => {
    await page.goto("admin/testimonials");
    await expect(page).toHaveURL(/\/web-cdre\/admin\/login\?next=%2Fadmin%2Ftestimonials/);

    await submitLogin(page);
    await expect(page).toHaveURL(/\/web-cdre\/admin\/testimonials$/);
  });

  test("logout ends the session", async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByRole("button", { name: "Keluar" }).click();
    await expect(page).toHaveURL(/\/web-cdre\/admin\/login/);

    await page.goto("admin");
    await expect(page).toHaveURL(/\/web-cdre\/admin\/login\?next=%2Fadmin/);
  });

  test("an off-site redirect after login is ignored", async ({ page }) => {
    await page.goto(`admin/login?next=${encodeURIComponent("/\\evil.example")}`);

    await submitLogin(page);
    await expect(page).toHaveURL(/\/web-cdre\/admin$/);
  });
});

test.describe("wrong password", () => {
  test.use(asNewVisitor());

  test("shows a message, then blocks the 6th attempt even when correct", async ({ page }) => {
    await page.goto("admin/login");

    for (let attempt = 1; attempt <= 5; attempt++) {
      // The banner stays between attempts, so wait for the server's answer to each one.
      const answered = page.waitForResponse((response) => response.request().method() === "POST");
      await submitLogin(page, "password-salah");
      await answered;
      await expect(page.getByText("Username atau password salah.")).toBeVisible();
    }

    await submitLogin(page);
    await expect(page.getByText("Terlalu banyak percobaan")).toBeVisible();
    await expect(page).toHaveURL(/\/web-cdre\/admin\/login/);
  });
});
