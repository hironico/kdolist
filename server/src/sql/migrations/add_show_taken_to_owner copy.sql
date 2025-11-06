-- Migration: Add showTakenToOwner column to giftList table
-- Date: 2025-01-06
-- Description: Adds a boolean flag to allow list owners to optionally see which gifts are marked as taken
--              Useful for tracking collections or series

-- Add the column with default value false
ALTER TABLE public."giftLists"
ADD COLUMN IF NOT EXISTS "showTakenToOwner" BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public."giftLists"."showTakenToOwner" IS 'If true, the owner can see which gifts are marked as taken. Useful for collections/series tracking.';

-- Optional: Update existing lists if needed (all start as false by default)
UPDATE public."giftLists" SET "showTakenToOwner" = false WHERE "showTakenToOwner" IS NULL;