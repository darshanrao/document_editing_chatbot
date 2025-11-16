-- Migration: Add field_id to conversation_memory table
-- This allows conversation_memory to serve both AI context and UI display purposes
-- Run this SQL in your Supabase SQL Editor

-- Add field_id column to conversation_memory
ALTER TABLE conversation_memory 
ADD COLUMN IF NOT EXISTS field_id UUID REFERENCES fields(id) ON DELETE SET NULL;

-- Create index for faster queries by field_id
CREATE INDEX IF NOT EXISTS idx_conversation_memory_field_id ON conversation_memory(field_id);

-- Add comment for documentation
COMMENT ON COLUMN conversation_memory.field_id IS 'Reference to the field this message is associated with (for UI context)';

