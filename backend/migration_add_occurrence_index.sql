-- Migration: Add occurrence_index column to fields table
-- Run this ONCE on existing databases to add the occurrence_index column
-- Date: 2025-01-17

-- Add occurrence_index column to fields table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'fields'
        AND column_name = 'occurrence_index'
    ) THEN
        ALTER TABLE fields ADD COLUMN occurrence_index INTEGER DEFAULT 0;

        -- Update existing rows to have occurrence_index = 0
        UPDATE fields SET occurrence_index = 0 WHERE occurrence_index IS NULL;

        RAISE NOTICE 'Added occurrence_index column to fields table';
    ELSE
        RAISE NOTICE 'occurrence_index column already exists in fields table';
    END IF;
END $$;
