-- Update migrated stories to use your IP address
-- For local development, use '::1' (localhost)
-- For production, use your actual IP: 181.93.215.64

BEGIN;

-- Option 1: For local development (localhost)
UPDATE stories 
SET ip_address = '::1'
WHERE ip_address = 'migrated';

-- Option 2: For production (uncomment and comment Option 1)
-- UPDATE stories 
-- SET ip_address = '181.93.215.64'
-- WHERE ip_address = 'migrated';

-- Verify the update
SELECT COUNT(*) as updated_stories 
FROM stories 
WHERE ip_address = '::1';

COMMIT;

