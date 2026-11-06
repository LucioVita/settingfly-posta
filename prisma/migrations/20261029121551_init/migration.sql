-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SetterConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `aiEnabled` BOOLEAN NOT NULL DEFAULT true,
    `businessName` VARCHAR(191) NOT NULL DEFAULT 'Igluchat',
    `offerDescription` VARCHAR(191) NOT NULL DEFAULT 'Automatización de ventas para Instagram y cualificación con IA para agencias y creadores',
    `targetAudience` VARCHAR(191) NOT NULL DEFAULT 'Dueños de agencias B2B, formadores y negocios que reciben +20 DMs diarios',
    `priceRange` VARCHAR(191) NOT NULL DEFAULT '$500 - $1,500 USD',
    `setterName` VARCHAR(191) NOT NULL DEFAULT 'Asistente',
    `tone` ENUM('cercano', 'profesional', 'urgente') NOT NULL DEFAULT 'cercano',
    `useEmojis` ENUM('moderado', 'positivo', 'nunca') NOT NULL DEFAULT 'moderado',
    `dialect` ENUM('rioplatense', 'neutro', 'espana') NOT NULL DEFAULT 'rioplatense',
    `bookingType` ENUM('calendly', 'whatsapp', 'link') NOT NULL DEFAULT 'calendly',
    `bookingUrl` VARCHAR(191) NOT NULL DEFAULT 'https://igluchat.ai/demo',
    `ctaHook` VARCHAR(191) NOT NULL DEFAULT 'Sesión de diagnóstico de 15 minutos sin costo',
    `keywords` JSON NOT NULL,
    `triggerComments` BOOLEAN NOT NULL DEFAULT true,
    `triggerDms` BOOLEAN NOT NULL DEFAULT true,
    `triggerStories` BOOLEAN NOT NULL DEFAULT false,
    `qualificationQ1` VARCHAR(191) NOT NULL DEFAULT '¿Actualmente ya tenés un negocio en marcha o estás por comenzar?',
    `qualificationQ2` VARCHAR(191) NOT NULL DEFAULT '¿Qué volumen aproximado de prospectos o consultas recibís por semana?',
    `qualificationQ3` VARCHAR(191) NOT NULL DEFAULT '¿Cuentas con presupuesto para invertir en delegar esto si encaja con tu negocio?',
    `faqPrice` VARCHAR(191) NOT NULL DEFAULT 'El valor depende exactamente de tus necesidades y volumen de leads. En una llamada corta de 15 min vemos si aplicas y te paso el presupuesto exacto. ¿Qué día te queda mejor?',
    `faqInfo` VARCHAR(191) NOT NULL DEFAULT 'Te entiendo perfectamente. Como armamos una solución a medida, en la sesión de 15 min te comparto pantalla y te muestro el embudo funcionando en vivo. ¿Te paso el link?',
    `faqTime` VARCHAR(191) NOT NULL DEFAULT '¡Totalmente comprensible! Justamente este sistema te devuelve entre 10 y 15 horas por semana. ¿Te parece si agendamos para la semana que viene o te escribo el viernes?',
    `noClosedPrices` BOOLEAN NOT NULL DEFAULT true,
    `noRefundPromises` BOOLEAN NOT NULL DEFAULT true,
    `disqualifyPolite` BOOLEAN NOT NULL DEFAULT true,
    `customRedLines` VARCHAR(191) NOT NULL DEFAULT 'Nunca insultar, no hablar de política, ni prometer números de facturación irreales.',
    `scheduleMode` ENUM('daily', 'TwentyFourSeven', 'FueraHorario', 'SoloFinde') NOT NULL DEFAULT 'TwentyFourSeven',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    `delayMin` INTEGER NOT NULL DEFAULT 15,
    `delayMax` INTEGER NOT NULL DEFAULT 45,
    `takeoverOnRequest` BOOLEAN NOT NULL DEFAULT true,
    `takeoverOnScheduled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SetterConfig_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IgAccount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `instagramId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IgAccount_instagramId_key`(`instagramId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `igAccountId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `instagramUserId` VARCHAR(191) NOT NULL,
    `instagramUsername` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `history` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SetterConfig` ADD CONSTRAINT `SetterConfig_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IgAccount` ADD CONSTRAINT `IgAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_igAccountId_fkey` FOREIGN KEY (`igAccountId`) REFERENCES `IgAccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
