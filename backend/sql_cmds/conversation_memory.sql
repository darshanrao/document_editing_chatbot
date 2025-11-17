-- Create conversation memory table for LangChain
CREATE TABLE IF NOT EXISTS conversation_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('human', 'ai', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversation_memory_document_id ON conversation_memory(document_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_session_id ON conversation_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_created_at ON conversation_memory(created_at);

-- Enable Row Level Security
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON conversation_memory FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON conversation_memory FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON conversation_memory FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON conversation_memory FOR DELETE USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_memory_updated_at
    BEFORE UPDATE ON conversation_memory
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_memory_updated_at();

-- Add comments for documentation
COMMENT ON TABLE conversation_memory IS 'Stores conversation history for LangChain memory management';
COMMENT ON COLUMN conversation_memory.document_id IS 'Reference to the document being processed';
COMMENT ON COLUMN conversation_memory.session_id IS 'Session identifier for grouping related messages';
COMMENT ON COLUMN conversation_memory.message_type IS 'Type of message: human (user), ai (assistant), or system';
COMMENT ON COLUMN conversation_memory.content IS 'The actual message content';
COMMENT ON COLUMN conversation_memory.metadata IS 'Additional metadata (field_id, validation_attempt, etc.)';
