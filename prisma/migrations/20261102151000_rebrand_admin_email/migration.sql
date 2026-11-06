-- Rename remaining accounts on the old brand domain
UPDATE `User`
SET `email` = 'admin@settingfly.ai'
WHERE `email` = 'admin@igluchat.ai';
