-- Migration: add phone column to ContactRequest
-- Description: Campo de teléfono para calificar leads del formulario de contacto

ALTER TABLE `ContactRequest` ADD COLUMN `phone` VARCHAR(191) NULL;
