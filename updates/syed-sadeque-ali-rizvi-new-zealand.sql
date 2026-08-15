-- Update Syed Sadeque Ali Rizvi's residence to New Zealand
-- Date: 2026-08-14
-- Person: Syed Sadeque Ali Rizvi (b. 2 January 1958, son of Wazir Ali)

UPDATE people
SET residence = 'New Zealand'
WHERE id = 'syed-sadeque-ali-rizvi';

-- Verify the update
SELECT id, name, birth, residence FROM people WHERE id = 'syed-sadeque-ali-rizvi';
