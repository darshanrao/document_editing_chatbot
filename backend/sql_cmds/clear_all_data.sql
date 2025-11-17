-- ⚠️ WARNING: This script will DELETE ALL DATA from your database! ⚠️
-- This action is IRREVERSIBLE. Use with extreme caution!
--
-- Purpose: Clear all data from database tables and storage buckets
-- Use Case: Development/Testing cleanup, fresh start
--
-- Date: 2025-01-17
--
-- BEFORE RUNNING:
-- 1. Make sure you have a backup if you need the data
-- 2. Confirm you want to delete EVERYTHING
-- 3. This does NOT clear storage buckets (see instructions below)

-- =============================================================================
-- STEP 1: DELETE ALL RECORDS FROM DATABASE TABLES
-- =============================================================================

-- Delete in correct order (child tables first, then parent)
-- Due to foreign key constraints with ON DELETE CASCADE, we can delete in any order,
-- but we'll be explicit for clarity

-- Delete all data from tables
DO $$
BEGIN
    -- Delete conversation memory (if table exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversation_memory') THEN
        DELETE FROM conversation_memory;
        RAISE NOTICE 'Deleted all records from conversation_memory';
    END IF;

    -- Delete chat messages
    DELETE FROM chat_messages;
    RAISE NOTICE 'Deleted all records from chat_messages';

    -- Delete processing tasks
    DELETE FROM processing_tasks;
    RAISE NOTICE 'Deleted all records from processing_tasks';

    -- Delete fields
    DELETE FROM fields;
    RAISE NOTICE 'Deleted all records from fields';

    -- Delete documents (this will CASCADE delete related records automatically)
    DELETE FROM documents;
    RAISE NOTICE 'Deleted all records from documents';
END $$;

-- =============================================================================
-- VERIFICATION: Check that all tables are empty
-- =============================================================================

DO $$
DECLARE
    doc_count INT;
    field_count INT;
    chat_count INT;
    task_count INT;
    memory_count INT;
BEGIN
    SELECT COUNT(*) INTO doc_count FROM documents;
    SELECT COUNT(*) INTO field_count FROM fields;
    SELECT COUNT(*) INTO chat_count FROM chat_messages;
    SELECT COUNT(*) INTO task_count FROM processing_tasks;

    -- Check conversation_memory if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversation_memory') THEN
        SELECT COUNT(*) INTO memory_count FROM conversation_memory;
    ELSE
        memory_count := 0;
    END IF;

    RAISE NOTICE '=== CLEANUP VERIFICATION ===';
    RAISE NOTICE 'Documents: % records', doc_count;
    RAISE NOTICE 'Fields: % records', field_count;
    RAISE NOTICE 'Chat Messages: % records', chat_count;
    RAISE NOTICE 'Processing Tasks: % records', task_count;
    RAISE NOTICE 'Conversation Memory: % records', memory_count;
    RAISE NOTICE '===========================';

    IF doc_count = 0 AND field_count = 0 AND chat_count = 0 AND task_count = 0 AND memory_count = 0 THEN
        RAISE NOTICE '✓ All database tables cleared successfully!';
    ELSE
        RAISE WARNING '⚠ Some records remain in tables!';
    END IF;
END $$;

-- =============================================================================
-- STEP 2: CLEAR STORAGE BUCKETS (MANUAL STEPS)
-- =============================================================================

-- ⚠️ Storage buckets CANNOT be cleared via SQL
-- You must clear them manually using one of these methods:

-- METHOD 1: Supabase Dashboard (Recommended for small amounts of data)
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Storage section
-- 3. Select "original-documents" bucket
-- 4. Delete all files manually or select all and delete
-- 5. Repeat for "completed-documents" bucket

-- METHOD 2: Using Supabase Storage API (For programmatic clearing)
-- You can use the Python code below to clear all files:

/*
from supabase import create_client
from config import settings

client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Clear original-documents bucket
try:
    files = client.storage.from_('original-documents').list()
    for file in files:
        client.storage.from_('original-documents').remove([file['name']])
    print("✓ Cleared original-documents bucket")
except Exception as e:
    print(f"Error clearing original-documents: {e}")

# Clear completed-documents bucket
try:
    files = client.storage.from_('completed-documents').list()
    for file in files:
        client.storage.from_('completed-documents').remove([file['name']])
    print("✓ Cleared completed-documents bucket")
except Exception as e:
    print(f"Error clearing completed-documents: {e}")
*/

-- METHOD 3: Using Supabase CLI
-- supabase storage rm --bucket-id original-documents --path /
-- supabase storage rm --bucket-id completed-documents --path /

-- =============================================================================
-- CLEANUP COMPLETE!
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '✓ DATABASE CLEANUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Clear storage buckets manually (see instructions above)';
    RAISE NOTICE '2. Your database is now empty and ready for new data';
    RAISE NOTICE '====================================';
END $$;
