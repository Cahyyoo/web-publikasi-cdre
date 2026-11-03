-- CreateTable
CREATE TABLE `hero_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slot` ENUM('HOME_HERO', 'HOME_SAMBUTAN', 'PPM_BANNER', 'CSR_BANNER', 'BINAAN_BANNER', 'PENGHARGAAN_BANNER', 'GALERI_KEGIATAN_BANNER') NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hero_images_slot_key`(`slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default images matching the banners currently hardcoded in the
-- public pages, so nothing changes visually until an admin updates them.
INSERT INTO `hero_images` (`slot`, `imageUrl`, `updatedAt`) VALUES
    ('HOME_HERO', '/banners/hero-sehat-bareng.jpg', CURRENT_TIMESTAMP(3)),
    ('HOME_SAMBUTAN', '/banners/bantuan-hewan-qurban.jpg', CURRENT_TIMESTAMP(3)),
    ('PPM_BANNER', '/banners/bantuan-dana-pendidikan.jpg', CURRENT_TIMESTAMP(3)),
    ('CSR_BANNER', '/banners/perbaikan-jalan-polora.jpg', CURRENT_TIMESTAMP(3)),
    ('BINAAN_BANNER', '/banners/parcel-lebaran.jpg', CURRENT_TIMESTAMP(3)),
    ('PENGHARGAAN_BANNER', '/banners/perbaikan-jalan-molore.jpg', CURRENT_TIMESTAMP(3)),
    ('GALERI_KEGIATAN_BANNER', '/banners/kegiatan-kesehatan.jpg', CURRENT_TIMESTAMP(3));
