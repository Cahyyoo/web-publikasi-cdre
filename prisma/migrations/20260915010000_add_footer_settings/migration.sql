-- CreateTable
CREATE TABLE `footer_settings` (
    `id` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `address` TEXT NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `facebookUrl` VARCHAR(191) NOT NULL,
    `instagramUrl` VARCHAR(191) NOT NULL,
    `youtubeUrl` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed the single row with the copy currently hardcoded in components/layout/Footer.tsx,
-- so nothing changes visually until an admin edits it.
INSERT INTO `footer_settings` (`id`, `description`, `address`, `phone`, `email`, `facebookUrl`, `instagramUrl`, `youtubeUrl`, `updatedAt`) VALUES
    (1,
     'Perusahaan sumber daya yang berkomitmen menjalankan operasional berkelanjutan sekaligus memberi dampak nyata bagi masyarakat sekitar melalui program CSR, PPM, dan pemberdayaan UMKM binaan.',
     'Kawasan Operasional PT Stargate Pasific Resource, Indonesia',
     '(021) 000-0000',
     'info@stargatepasificresource.co.id',
     '#',
     '#',
     '#',
     CURRENT_TIMESTAMP(3));
