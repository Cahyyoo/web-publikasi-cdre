-- One image slot per homepage placement, so the collage, UMKM panel, FAQ and
-- call-to-action panels no longer borrow the section page banners.
ALTER TABLE `hero_images` MODIFY `slot` ENUM('HOME_HERO', 'HOME_SAMBUTAN', 'PPM_BANNER', 'CSR_BANNER', 'BINAAN_BANNER', 'PENGHARGAAN_BANNER', 'GALERI_KEGIATAN_BANNER', 'HOME_COLLAGE_2', 'HOME_COLLAGE_3', 'HOME_BINAAN_PANEL', 'HOME_FAQ', 'HOME_CTA_CSR', 'HOME_CTA_PPM', 'HOME_CTA_BINAAN') NOT NULL;

-- Defaults from the bundled banners until an admin uploads real photos.
INSERT INTO `hero_images` (`slot`, `imageUrl`, `updatedAt`) VALUES
    ('HOME_COLLAGE_2', '/banners/kegiatan-kesehatan.jpg', CURRENT_TIMESTAMP(3)),
    ('HOME_COLLAGE_3', '/banners/perbaikan-jalan-molore.jpg', CURRENT_TIMESTAMP(3)),
    ('HOME_BINAAN_PANEL', '/banners/parcel-lebaran.jpg', CURRENT_TIMESTAMP(3)),
    ('HOME_FAQ', '/banners/hero-sehat-bareng.jpg', CURRENT_TIMESTAMP(3)),
    ('HOME_CTA_CSR', '/banners/perbaikan-jalan-polora.jpg', CURRENT_TIMESTAMP(3)),
    ('HOME_CTA_PPM', '/banners/bantuan-dana-pendidikan.jpg', CURRENT_TIMESTAMP(3)),
    ('HOME_CTA_BINAAN', '/banners/bantuan-hewan-qurban.jpg', CURRENT_TIMESTAMP(3));

-- Activity photos an admin picked for the homepage/footer photo strips.
ALTER TABLE `activity_photos` ADD COLUMN `showOnHome` BOOLEAN NOT NULL DEFAULT false;
