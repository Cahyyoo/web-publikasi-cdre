import { expect, test } from "@playwright/test";
import { deleteUploadedImage } from "@/lib/upload";
import { asNewVisitor, E2E_PREFIX, imagePathInRow, loginAsAdmin, PHOTO } from "./helpers";

test.use(asNewVisitor());

test("an admin can add, edit, publish, and delete a testimonial", async ({ page }) => {
  const name = `${E2E_PREFIX} kelola admin`;
  const row = page.getByRole("row", { name });

  await loginAsAdmin(page);

  await test.step("add", async () => {
    await page.goto("admin/testimonials/new");
    await page.getByLabel("Nama").fill(name);
    await page.getByLabel("Jabatan").fill("Jabatan awal");
    await page.getByLabel("Isi Testimonial").fill("Isi testimoni uji.");
    await page.getByLabel("Foto Profil").setInputFiles(PHOTO);
    await page.getByRole("button", { name: "Simpan" }).click();

    await expect(page.getByText("Data berhasil ditambahkan.")).toBeVisible();
    await expect(row.getByRole("button", { name: "Tayang" })).toBeVisible();
  });

  // Deleting a testimonial leaves its photo on disk, so the photo is removed here.
  const imagePath = await imagePathInRow(page, name);

  try {
    await test.step("edit", async () => {
      await row.getByRole("link", { name: "Edit" }).click();
      await page.getByLabel("Jabatan").fill("Jabatan baru");
      await page.getByRole("button", { name: /Simpan/ }).click();

      await expect(page.getByText("Perubahan berhasil disimpan.")).toBeVisible();
      await expect(row).toContainText("Jabatan baru");
    });

    await test.step("hide and publish", async () => {
      await row.getByRole("button", { name: "Tayang" }).click();
      await expect(page.getByText("Testimoni disembunyikan dari Beranda.")).toBeVisible();
      await expect(row.getByRole("button", { name: "Menunggu" })).toBeVisible();

      await row.getByRole("button", { name: "Menunggu" }).click();
      await expect(page.getByText("Testimoni sekarang tayang di Beranda.")).toBeVisible();
      await expect(row.getByRole("button", { name: "Tayang" })).toBeVisible();
    });

    await test.step("cancelling the confirmation keeps the row", async () => {
      page.once("dialog", (dialog) => dialog.dismiss());
      await row.getByRole("button", { name: "Hapus" }).click();
      await expect(row).toBeVisible();
    });

    await test.step("delete", async () => {
      page.once("dialog", (dialog) => dialog.accept());
      await row.getByRole("button", { name: "Hapus" }).click();

      await expect(page.getByText("Data berhasil dihapus.")).toBeVisible();
      await expect(row).toHaveCount(0);
    });
  } finally {
    await deleteUploadedImage(imagePath.replace("/web-cdre", ""));
  }
});
