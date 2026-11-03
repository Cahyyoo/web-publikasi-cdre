-- Remove Souvenir gallery items before the enum value is dropped
DELETE FROM `galleries` WHERE `type` = 'SOUVENIR';

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `galleries` MODIFY `type` ENUM('PENGHARGAAN') NOT NULL;

-- CreateTable
CREATE TABLE `activity_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `activity_categories_name_key`(`name`),
    INDEX `activity_categories_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_photos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `caption` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `categoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_photos_categoryId_idx`(`categoryId`),
    INDEX `activity_photos_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `categories_type_order_idx` ON `categories`(`type`, `order`);

-- CreateIndex
CREATE UNIQUE INDEX `categories_name_type_key` ON `categories`(`name`, `type`);

-- AddForeignKey
ALTER TABLE `activity_photos` ADD CONSTRAINT `activity_photos_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `activity_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
