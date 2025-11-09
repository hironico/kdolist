-- Migration: Add description column to gifts table
-- Date: 2025-11-06
-- Description: Adds description text field for storing more precise details about gifts

-- Add the nullable column
ALTER TABLE public."gifts"
ADD COLUMN IF NOT EXISTS "description" VARCHAR(4096) NULL;

-- Add comment for documentation
COMMENT ON COLUMN public."gifts"."description" IS 'Provide more details about a gifts if necessary';