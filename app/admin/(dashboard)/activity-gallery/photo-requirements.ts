/**
 * Upload hints shared by the add and edit forms. Activity photos are shown in
 * the 16:9 carousel on /galeri-kegiatan (components/gallery/ActivityCarousel),
 * which crops anything else to fill its frame.
 */
export const ACTIVITY_PHOTO_REQUIREMENTS = [
  "Format: JPG, PNG, WEBP, GIF, atau HEIC",
  "Foto langsung dari kamera boleh — otomatis dikecilkan (maks. 60MB)",
  "Ukuran disarankan 2560×1440 px (minimal 1920×1080 px), rasio 16:9 — pas dengan bingkai carousel",
  "Foto dengan rasio lain dipotong otomatis di tengah agar memenuhi bingkai",
];
