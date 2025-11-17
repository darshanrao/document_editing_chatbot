# Chatbot Pipeline Documentation

## Overview
This document explains how the chatbot pipeline works, including when messages are saved to Supabase and how conversation context is managed.

## Pipeline Flow

### 1. Initial Question Generation (First Load)
**Endpoint:** `GET /api/chat/{document_id}/next`

**Flow:**
```
1. Get document from database
2. Get next pending field
3. 🔄 Load ALL conversation history from Supabase (load_memory_from_db)
4. Get document context for the field
5. Generate question using Gemini with full conversation history
6. ✅ Save AI message to Supabase immediately (save_single_message_to_db)
7. Return question to frontend
```

**Code Location:** `backend/routers/chat.py:10-57`

---

### 2. User Message Submission (Main Pipeline)
**Endpoint:** `POST /api/documents/{document_id}/fields`

**Flow:**
```
1. Get document and field from database
2. 🔄 Load ALL conversation history from Supabase (load_memory_from_db)
3. Create HumanMessage from user input
4. Add to in-memory LangChain memory
5. ✅ Save user message to Supabase immediately (save_single_message_to_db)
6. Extract and validate value using Gemini (with full history context)
7. 
   IF VALID:
     - Update field value in database
     - Reset validation attempts
     - Get next pending field
     - Generate next question using Gemini (with full history context)
     - Add AI message to in-memory memory
     - ✅ Save AI message to Supabase immediately (save_single_message_to_db)
     - Return next question
   
   IF INVALID:
     - Generate clarification question using Gemini (with full history context)
     - Add clarification to in-memory memory
     - ✅ Save clarification to Supabase immediately (save_single_message_to_db)
     - Update validation attempts counter
     - Return clarification (same field)
```

**Code Location:** `backend/routers/documents.py:147-280`

---

## Key Questions Answered

### ❓ When are messages pushed to Supabase?

**Answer: Messages are pushed to Supabase IMMEDIATELY after each action:**

1. **After AI generates a question:**
   - In `GET /api/chat/{document_id}/next` → Line 52
   - In `POST /api/documents/{document_id}/fields` → Lines 196, 249

2. **After user sends a message:**
   - In `POST /api/documents/{document_id}/fields` → Line 171

3. **After validation fails and clarification is generated:**
   - In `POST /api/documents/{document_id}/fields` → Line 196

**Implementation:** `conversation_service.save_single_message_to_db()`
- Checks for duplicates before inserting
- Saves immediately (synchronous)
- Includes `field_id` for UI context

---

### ❓ Is the whole context fetched each time user enters anything?

**Answer: YES - The entire conversation history is fetched EVERY time:**

**When the context is loaded:**
1. ✅ **Every time a user submits a message** (`POST /api/documents/{document_id}/fields`)
   - Line 165: `memory = conversation_service.load_memory_from_db(db, document_id)`

2. ✅ **Every time a new question is generated** (`GET /api/chat/{document_id}/next`)
   - Line 25: `memory = conversation_service.load_memory_from_db(db, document_id)`

3. ✅ **Every time a value is extracted/validated**
   - Uses the loaded memory which contains full history

**Implementation:** `conversation_service.load_memory_from_db()`
```python
# backend/services/conversation_service.py:317-337
def load_memory_from_db(self, db, document_id: str) -> ConversationBufferMemory:
    memory = self.create_memory(document_id)
    
    # 🔄 Fetches ALL messages for this document
    response = db.client.table("conversation_memory")\
        .select("*")\
        .eq("document_id", document_id)\
        .order("created_at")\
        .execute()
    
    # Rebuilds LangChain memory from all messages
    for record in response.data:
        if record["message_type"] == "human":
            memory.chat_memory.add_message(HumanMessage(content=record["content"]))
        elif record["message_type"] == "ai":
            memory.chat_memory.add_message(AIMessage(content=record["content"]))
    
    return memory
```

**What gets loaded:**
- ✅ ALL human messages (user inputs)
- ✅ ALL AI messages (questions, clarifications)
- ✅ Ordered by `created_at` timestamp
- ❌ No pagination or limits
- ❌ No caching (fetched fresh each time)

---

## Database Schema

### `conversation_memory` Table
```sql
- id: UUID (primary key)
- document_id: UUID (foreign key to documents)
- session_id: TEXT (same as document_id)
- message_type: TEXT ('human' | 'ai' | 'system')
- content: TEXT (the actual message)
- field_id: UUID (optional, links to specific field)
- metadata: JSONB (additional data)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Indexes:**
- `idx_conversation_memory_document_id` - Fast queries by document
- `idx_conversation_memory_created_at` - Maintains chronological order
- `idx_conversation_memory_field_id` - Links messages to fields

---

## Conversation Memory Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User Sends Message                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/documents/{id}/fields                            │
│                                                             │
│ 1. 🔄 Load ALL messages from Supabase                      │
│    SELECT * FROM conversation_memory                        │
│    WHERE document_id = {id}                                │
│    ORDER BY created_at                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Rebuild LangChain Memory                                 │
│    ConversationBufferMemory with all previous messages     │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ✅ Save User Message to Supabase                         │
│    INSERT INTO conversation_memory (...)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Extract & Validate Value (Gemini with full context)     │
│    Uses entire conversation history in prompt               │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    Valid?              Invalid?
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│ Update Field    │  │ Generate        │
│ Get Next Field  │  │ Clarification   │
│ Generate Q      │  │ (Gemini with    │
│ (Gemini with    │  │ full context)   │
│ full context)   │  │                 │
└────────┬────────┘  └────────┬────────┘
         │                   │
         └─────────┬─────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ✅ Save AI Message to Supabase                           │
│    INSERT INTO conversation_memory (...)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ Return Response to Frontend                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Considerations

### ⚠️ Potential Issues

1. **Full Context Fetch Every Time:**
   - For long conversations, this becomes expensive
   - All messages are loaded and rebuilt into LangChain memory
   - No caching mechanism

2. **Gemini Token Usage:**
   - Full conversation history is sent to Gemini each time
   - Can get expensive with long conversations
   - Context grows linearly with conversation length

3. **Database Queries:**
   - Multiple queries per user action:
     - Load all messages (SELECT)
     - Save user message (INSERT)
     - Save AI message (INSERT)
     - Update field (UPDATE)
     - Get next field (SELECT)

### ✅ Current Optimizations

1. **Duplicate Prevention:**
   - `save_single_message_to_db()` checks for duplicates before inserting
   - Prevents duplicate messages from being saved

2. **Indexed Queries:**
   - Indexes on `document_id`, `created_at`, and `field_id`
   - Fast retrieval even with many messages

3. **Immediate Persistence:**
   - Messages saved synchronously
   - No risk of losing conversation history

---

## Code References

### Key Files:
- **Chat Router:** `backend/routers/chat.py`
- **Documents Router:** `backend/routers/documents.py`
- **Conversation Service:** `backend/services/conversation_service.py`
- **Database Utils:** `backend/utils/database.py`
- **Frontend Fill Page:** `frontend/src/app/fill/[id]/page.tsx`

### Key Functions:
- `load_memory_from_db()` - Loads all messages from Supabase
- `save_single_message_to_db()` - Saves single message to Supabase
- `generate_field_question()` - Generates question with full context
- `extract_and_validate_value()` - Extracts value with full context
- `generate_clarification_question()` - Generates clarification with full context

---

## Summary

**Message Storage:**
- ✅ Messages are saved to Supabase **immediately** after each action
- ✅ Both user messages and AI messages are persisted
- ✅ Includes `field_id` for UI context

**Context Loading:**
- ⚠️ **YES** - The entire conversation history is fetched **every time**
- ⚠️ No pagination, caching, or limits
- ✅ Rebuilt into LangChain memory structure each time
- ✅ Full context sent to Gemini for each API call

**Trade-offs:**
- ✅ Simple, reliable, and always up-to-date
- ⚠️ Can become expensive for very long conversations
- ⚠️ Potential performance issues with hundreds of messages

