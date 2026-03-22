-- Maverick - Supabase Schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  passphrase_hash TEXT NOT NULL UNIQUE,
  tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
  playlists JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_passphrase_hash ON library(passphrase_hash);
CREATE INDEX IF NOT EXISTS idx_library_updated_at ON library(updated_at);

-- RLS: we use service_role key on backend so no user-level RLS needed
-- But we enable it as a security layer
ALTER TABLE library ENABLE ROW LEVEL SECURITY;

-- Only service role can access (backend handles all operations)
CREATE POLICY "service_role_only" ON library
  USING (false)
  WITH CHECK (false);

-- Track structure (for reference, stored in JSONB):
-- {
--   "id": "uuid",
--   "title": "string",
--   "artist": "string",
--   "duration": "3:33",
--   "thumbnail": "url",
--   "sourceUrl": "url",
--   "platform": "youtube|soundcloud|tiktok|...",
--   "genre": "string|null",
--   "favorite": false,
--   "downloadedAt": "iso8601",
--   "bitrate": "320kbps"
-- }

-- Playlist structure (for reference, stored in JSONB):
-- {
--   "id": "uuid",
--   "name": "string",
--   "genre_tag": "string|null",
--   "track_ids": ["uuid", ...],
--   "created_at": "iso8601"
-- }
