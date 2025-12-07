-- Add audio fields to stories table for music and sound effects support
-- Run this migration to add audio capabilities to existing stories

ALTER TABLE stories ADD COLUMN IF NOT EXISTS music_url TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS music_prompt TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS sound_effects JSONB;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS suno_task_id TEXT;

-- Add index for stories with audio (optional, for faster queries)
CREATE INDEX IF NOT EXISTS idx_stories_music_url ON stories(music_url) WHERE music_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_suno_task_id ON stories(suno_task_id) WHERE suno_task_id IS NOT NULL;

