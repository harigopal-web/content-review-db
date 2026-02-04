-- One-time cleanup: remove score-derived tags from all entries.
-- These tags are now computed on the fly from the score field and
-- should not be stored in the tags column.
UPDATE public.entries
SET tags = array_remove(array_remove(array_remove(tags, 'must-watch'), 'recommended'), 'entertaining')
WHERE tags IS NOT NULL
  AND (tags @> ARRAY['must-watch'] OR tags @> ARRAY['recommended'] OR tags @> ARRAY['entertaining']);
