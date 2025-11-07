-- Migration: Add isFavorite column to gift table
-- Date: 2025-01-07
-- Description: Adds a boolean flag to mark gifts as favorites
--              Favorites will be shown first in the gift list

-- Add the column with default value false
ALTER TABLE public."gifts" 
ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN "gifts"."isFavorite" IS 'If true, this gift is marked as a favorite by the list owner';

-- Optional: Update existing gifts if needed (all start as false by default)
UPDATE public."gifts" SET "isFavorite" = false WHERE "isFavorite" IS NULL;
