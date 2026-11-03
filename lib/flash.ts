/**
 * Flash messages for admin actions.
 *
 * Server actions communicate their outcome by redirecting with a `?flash=<code>`
 * query param; the destination page renders <FormAlert code={searchParams.flash} />.
 *
 * Codes are used instead of free-form text for two reasons: the Indonesian copy
 * lives in exactly one place, and an arbitrary `?flash=` typed into the address
 * bar can no longer render an official-looking banner (unknown codes render
 * nothing).
 */

export const FLASH = {
  // Success
  created: { tone: "success", text: "Data berhasil ditambahkan." },
  updated: { tone: "success", text: "Perubahan berhasil disimpan." },
  deleted: { tone: "success", text: "Data berhasil dihapus." },
  published: { tone: "success", text: "Testimoni sekarang tayang di Beranda." },
  unpublished: {
    tone: "success",
    text: "Testimoni disembunyikan dari Beranda.",
  },

  // Failure
  duplicate: {
    tone: "error",
    text: "Nama tersebut sudah dipakai. Gunakan nama lain.",
  },
  "duplicate-slug": {
    tone: "error",
    text: "Slug sudah dipakai artikel lain. Gunakan judul/slug yang berbeda.",
  },
  "in-use": {
    tone: "error",
    text: "Data masih dipakai oleh isi lain. Hapus isinya terlebih dahulu.",
  },
  "duplicate-category": {
    tone: "error",
    text: "Kategori dengan nama dan tipe yang sama sudah ada.",
  },
  "duplicate-activity-category": {
    tone: "error",
    text: "Kategori dengan nama tersebut sudah ada.",
  },
  "in-use-category": {
    tone: "error",
    text: "Kategori tidak bisa dihapus karena masih dipakai oleh artikel. Pindahkan atau hapus artikel terkait terlebih dahulu.",
  },
  "in-use-activity-category": {
    tone: "error",
    text: "Kategori tidak bisa dihapus karena masih dipakai oleh foto kegiatan. Pindahkan atau hapus foto terkait terlebih dahulu.",
  },
  "in-use-binaan-group": {
    tone: "error",
    text: "Kelompok tidak bisa dihapus karena masih memiliki produk. Hapus atau pindahkan produk terkait terlebih dahulu.",
  },
  "not-found": {
    tone: "error",
    text: "Data tidak ditemukan. Mungkin sudah dihapus.",
  },
  "upload-empty": { tone: "error", text: "File kosong." },
  "upload-large": { tone: "error", text: "Ukuran file terlalu besar." },
  "upload-type": {
    tone: "error",
    text: "Format file harus JPG, PNG, WEBP, GIF, atau HEIC.",
  },
  "upload-required": { tone: "error", text: "Foto wajib diunggah." },
  "save-failed": { tone: "error", text: "Gagal menyimpan. Silakan coba lagi." },
  "login-failed": { tone: "error", text: "Username atau password salah." },
  "testimoni-terkirim": {
    tone: "success",
    text: "Terima kasih! Testimoni Anda sudah kami terima dan akan tayang setelah disetujui oleh tim kami.",
  },
  "testimoni-wajib": {
    tone: "error",
    text: "Nama, jabatan/instansi, dan isi testimoni wajib diisi.",
  },
} as const satisfies Record<string, { tone: "success" | "error"; text: string }>;

export type FlashCode = keyof typeof FLASH;

/** Narrows an untrusted query-string value to a known flash code. */
export function toFlashCode(value: string | undefined): FlashCode | null {
  return value && value in FLASH ? (value as FlashCode) : null;
}

/** Appends `?flash=<code>` to a redirect target. */
export function withFlash(path: string, code: FlashCode): string {
  return `${path}${path.includes("?") ? "&" : "?"}flash=${code}`;
}
