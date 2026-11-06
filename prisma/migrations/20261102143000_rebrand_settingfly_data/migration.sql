-- Rebrand existing data to Settingfly
UPDATE `SetterConfig`
SET `businessName` = 'Settingfly',
    `bookingUrl` = 'https://settingfly.ai/demo'
WHERE `businessName` = 'Igluchat' OR `bookingUrl` = 'https://igluchat.ai/demo';

UPDATE `User`
SET `email` = 'demo@settingfly.ai'
WHERE `email` = 'demo@igluchat.ai';
