CREATE OR REPLACE FUNCTION update_gift_list_modified_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "public"."giftLists"
    SET    updatedAt = NOW()
    WHERE  id = NEW.giftListId;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_gift_list_modified_at
AFTER INSERT OR UPDATE ON "public"."gifts"
EXECUTE FUNCTION update_gift_list_modified_at();