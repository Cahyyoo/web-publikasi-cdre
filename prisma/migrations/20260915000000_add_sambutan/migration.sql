-- CreateTable
CREATE TABLE `sambutan` (
    `id` INTEGER NOT NULL,
    `quote` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed the single row with the copy currently hardcoded in app/(public)/page.tsx,
-- so nothing changes visually until an admin edits it.
INSERT INTO `sambutan` (`id`, `quote`, `description`, `updatedAt`) VALUES
    (1,
     'Kami berkomitmen menjalankan operasional yang berkelanjutan dengan memberikan dampak positif bagi masyarakat sekitar.',
     'Melalui program CSR dan PPM, serta pemberdayaan UMKM binaan di wilayah operasional kami, kami percaya pertumbuhan perusahaan harus berjalan beriringan dengan kesejahteraan masyarakat sekitar.',
     CURRENT_TIMESTAMP(3));
