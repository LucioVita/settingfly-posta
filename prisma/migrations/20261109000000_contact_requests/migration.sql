-- Migration: add ContactRequest model
-- Description: Solicitud de contacto / cotización personalizada (modelo ZeroChats)

CREATE TABLE `ContactRequest` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `userId` INTEGER NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `instagram` VARCHAR(191) NULL,
  `businessName` VARCHAR(191) NULL,
  `monthlyBudget` VARCHAR(191) NULL,
  `message` TEXT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `adminNote` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ContactRequest` ADD CONSTRAINT `ContactRequest_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;