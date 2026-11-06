-- Final domain: settingfly.com
ALTER TABLE `SetterConfig` MODIFY `bookingUrl` VARCHAR(191) NOT NULL DEFAULT 'https://settingfly.com/demo';

UPDATE `SetterConfig`
SET `bookingUrl` = 'https://settingfly.com/demo'
WHERE `bookingUrl` = 'https://settingfly.ai/demo';

UPDATE `User`
SET `email` = REPLACE(`email`, '@settingfly.ai', '@settingfly.com')
WHERE `email` LIKE '%@settingfly.ai';
