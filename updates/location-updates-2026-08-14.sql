-- Location Updates (2026-08-14)
-- Three family members with updated residence information

-- 1. Syed Sadeque Ali Rizvi (b. 1958) - Son of Wazir Ali
-- Moving to New Zealand
UPDATE people
SET residence = 'New Zealand'
WHERE id = 'syed-sadeque-ali-rizvi';

-- 2. Syeda Fatima Abbas Rizvi - Daughter of Abbas Raza
-- Residence updated to Canada (previously Dubai/Toronto)
UPDATE people
SET residence = 'Canada'
WHERE id = 'fatima-abbas-rizvi';

-- 3. Hussain Raza - Son of Ghulam Raza Rizvi
-- Moving to Adelaide in September 2026 (previously Dubai/US)
UPDATE people
SET residence = 'Adelaide'
WHERE id = 'hussain-raza';

-- Verify all updates
SELECT id, name, birth, residence FROM people
WHERE id IN ('syed-sadeque-ali-rizvi', 'fatima-abbas-rizvi', 'hussain-raza')
ORDER BY name;
