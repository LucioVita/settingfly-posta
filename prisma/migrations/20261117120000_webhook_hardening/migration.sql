-- Migration: webhook hardening
-- Description:
--   * Conversation.lastUserMessageAt / lastOutboundAt / lastOutboundMid: base para la
--     ventana de mensajería de 24h y para distinguir el echo de nuestros envíos del de
--     un operador humano.
--   * WebhookEvent: deduplicación de eventos (Meta reintenta entregas y eso duplica DMs).

ALTER TABLE `Conversation`
  ADD COLUMN `lastUserMessageAt` DATETIME(3) NULL,
  ADD COLUMN `lastOutboundAt` DATETIME(3) NULL,
  ADD COLUMN `lastOutboundMid` VARCHAR(191) NULL;

ALTER TABLE `IgAccount`
  ADD COLUMN `revokedAt` DATETIME(3) NULL,
  ADD COLUMN `lastErrorAt` DATETIME(3) NULL,
  ADD COLUMN `lastErrorKind` VARCHAR(32) NULL;

CREATE TABLE `WebhookEvent` (
  `id` VARCHAR(160) NOT NULL,
  `source` VARCHAR(32) NOT NULL DEFAULT 'instagram',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `WebhookEvent_createdAt_idx`(`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
