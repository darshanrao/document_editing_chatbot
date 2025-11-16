-- Add validation_attempts column to fields table
ALTER TABLE fields
ADD COLUMN IF NOT EXISTS validation_attempts INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN fields.validation_attempts IS 'Number of validation attempts for this field (for retry logic)';
