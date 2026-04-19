-- Migration: add isCollaborative flag to giftLists
-- When TRUE the list owner has granted one or more tribes write access via groupAccesses

ALTER TABLE "giftLists"
  ADD COLUMN IF NOT EXISTS "isCollaborative" BOOLEAN NOT NULL DEFAULT FALSE;
