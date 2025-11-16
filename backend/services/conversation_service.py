"""
Conversation service using Google GenAI directly with LangChain memory
"""
from typing import List, Dict, Any, Optional, Tuple
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, AIMessage
from config import settings
import json
import re
from datetime import datetime, timedelta
import google.generativeai as genai
import threading


class ConversationService:
    """Manages conversational flow with memory"""

    # In-memory cache for conversation memories
    # Format: {document_id: {"memory": ConversationBufferMemory, "timestamp": datetime}}
    _memory_cache: Dict[str, Dict[str, Any]] = {}
    _cache_lock = threading.Lock()
    _cache_ttl_minutes = 30  # Cache expires after 30 minutes
    _sliding_window_size = 20  # Load only last 20 messages for context

    def __init__(self):
        # Use Google GenAI directly
        genai.configure(api_key=settings.GEMINI_API_KEY)

        # Light model for conversation generation (cheaper, faster)
        self.conversation_model = genai.GenerativeModel('gemini-2.5-flash-lite')
        self.conversation_config = genai.types.GenerationConfig(
            temperature=0.7,  # More creative for friendly questions
        )

        # Pro model for extraction (more accurate, critical task)
        self.extraction_model = genai.GenerativeModel('gemini-2.5-flash')
        self.extraction_config = genai.types.GenerationConfig(
            temperature=0.1,  # Very precise for extraction
        )

    def create_memory(self, document_id: str) -> ConversationBufferMemory:
        """Create a new conversation memory instance"""
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            input_key="input",
            output_key="output"
        )
        return memory

    def _get_cached_memory(self, document_id: str) -> Optional[ConversationBufferMemory]:
        """Retrieve memory from cache if it exists and hasn't expired"""
        with self._cache_lock:
            # Clean up expired entries
            self._cleanup_expired_cache()

            if document_id in self._memory_cache:
                cache_entry = self._memory_cache[document_id]
                expiry_time = cache_entry["timestamp"] + timedelta(minutes=self._cache_ttl_minutes)

                if datetime.now() < expiry_time:
                    return cache_entry["memory"]
                else:
                    # Expired, remove from cache
                    del self._memory_cache[document_id]

        return None

    def _cache_memory(self, document_id: str, memory: ConversationBufferMemory):
        """Store memory in cache with current timestamp"""
        with self._cache_lock:
            self._memory_cache[document_id] = {
                "memory": memory,
                "timestamp": datetime.now()
            }

    def _cleanup_expired_cache(self):
        """Remove expired cache entries (called with lock held)"""
        now = datetime.now()
        expired_keys = [
            doc_id for doc_id, entry in self._memory_cache.items()
            if now >= entry["timestamp"] + timedelta(minutes=self._cache_ttl_minutes)
        ]
        for key in expired_keys:
            del self._memory_cache[key]

    def clear_cache(self, document_id: str):
        """Clear cache for a specific document (e.g., when document is completed)"""
        with self._cache_lock:
            if document_id in self._memory_cache:
                del self._memory_cache[document_id]

    def _build_chat_history_string(self, memory: ConversationBufferMemory) -> str:
        """Convert LangChain memory to string format for Gemini"""
        if not memory or not memory.chat_memory.messages:
            return "No previous conversation."

        history = []
        for msg in memory.chat_memory.messages:
            role = "User" if isinstance(msg, HumanMessage) else "Assistant"
            history.append(f"{role}: {msg.content}")

        return "\n".join(history)

    def generate_field_question(
        self,
        field_name: str,
        field_type: str,
        placeholder: str,
        context: str,
        memory: ConversationBufferMemory,
        attempt: int = 1
    ) -> str:
        """Generate a conversational question for a field"""

        type_instructions = {
            "text": "any text value",
            "name": "a full name (first and last name)",
            "email": "a valid email address",
            "phone": "a phone number",
            "date": "a date (in format like MM/DD/YYYY or Month Day, Year)",
            "number": "a number",
            "currency": "a currency amount (e.g., $1,000 or 1000)",
            "address": "a complete address",
            "company": "a company or organization name",
            "percentage": "a percentage value"
        }

        type_hint = type_instructions.get(field_type.lower(), "a value")
        retry_message = ""
        if attempt > 1:
            retry_message = f"\n\nI need {type_hint}. Please try again with the correct format."

        chat_history = self._build_chat_history_string(memory)

        prompt = f"""You are a helpful legal document assistant helping users fill in document fields.

Your task is to ask for the field "{field_name}" (placeholder: {placeholder}) in a natural, conversational way.

Field Type: {field_type}
Expected Format: {type_hint}

Context from document: {context}

Previous conversation:
{chat_history}

Guidelines:
1. Be friendly and conversational
2. Keep questions concise and clear
3. For dates, ask in a natural way but mention expected format in parentheses
4. Don't repeat information the user has already provided
5. If this is a retry (attempt {attempt}), politely point out what format is needed{retry_message}

Generate ONLY the question to ask the user, nothing else."""

        try:
            # Use light model for question generation
            response = self.conversation_model.generate_content(
                prompt,
                generation_config=self.conversation_config
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error generating question: {e}")
            return f"What is the {field_name}?"

    def extract_and_validate_value(
        self,
        user_response: str,
        field_name: str,
        field_type: str,
        placeholder: str,
        memory: ConversationBufferMemory
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Extract value from user response and validate against field type
        """

        chat_history = self._build_chat_history_string(memory)

        prompt = f"""You are an intelligent field extraction and validation system for legal documents.

Field to extract: {field_name}
Field Type: {field_type}
Placeholder: {placeholder}

Previous conversation:
{chat_history}

User's response: "{user_response}"

---

EXTRACTION AND VALIDATION RULES BY FIELD TYPE:

## AMOUNTS (Purchase Amount, Valuation Cap, currency fields):
- Convert shorthand: "500k" → "$500,000", "10m" → "$10,000,000", "2.5M" → "$2,500,000"
- Convert words: "one million" → "$1,000,000", "five hundred thousand" → "$500,000"
- Convert currency notations: "₹5 lakh" → INVALID: Please provide the amount in USD
- Default currency is USD unless user specifies otherwise
- Remove extra spaces, periods (except decimal), commas in input
- Final format MUST be: $X,XXX,XXX (comma-separated with dollar sign)
- If meaning is unclear (e.g., "about 200k", "roughly 1M"), return: INVALID: Please provide the exact amount (e.g., Is it exactly $200,000?)

## DATES:
- Convert natural language:
  * "second week of June" → "June 10, 2025" (use Monday of that week, or ask if year unclear)
  * "mid-July" → "July 15, 2025"
  * "early March" → "March 1, 2025"
  * "end of December" → "December 31, 2025"
- Normalize formats: "10th June", "June 10 2025", "10/06/25", "6-10-25" → "June 10, 2025"
- Strict output format: Month DD, YYYY (e.g., "January 15, 2025")
- If vague ("sometime in October", "Q2 2025"), return: INVALID: Please provide a specific date

## JURISDICTION / STATE OF INCORPORATION:
- Correct misspellings: "Texes" → "Texas, USA", "Californya" → "California, USA"
- Add default country: "Delaware" → "Delaware, USA"
- If ambiguous location, return: INVALID: Do you mean [Location], USA or [Location] (the country)?
  Example: "Georgia" → INVALID: Do you mean Georgia, USA or Georgia (the country)?
- Output format: [State/Province], [Country]

## ADDRESSES:
- Expand abbreviations: "sf" → "San Francisco", "NYC" → "New York City"
- Fix capitalization: "123 main st" → "123 Main St"
- Remove emojis or irrelevant text
- Ensure complete format: Street, City, State/Province, Country, ZIP
- If missing key parts (city, state, zip), return: INVALID: Please provide the complete address including [missing part]

## COMPANY NAME:
- Capitalize properly: "acme inc" → "Acme Inc.", "google llc" → "Google LLC"
- Fix spacing: "Test  Company" → "Test Company"
- If user provides only partial name (e.g., "Acme"), return: INVALID: Is the legal entity name "Acme, Inc.", "Acme LLC", or something else?
- Keep legal suffixes: Inc., LLC, Corp., Ltd., etc.

## INVESTOR NAME:
- Capitalize properly: "john smith" → "John Smith"
- Remove unnecessary punctuation and emojis
- If company investor, apply company name rules
- Format: First Last for individuals, Legal Name for entities

## EMAIL:
- Extract email address
- Validate format (must have @ and domain)
- Convert to lowercase: "John@Example.COM" → "john@example.com"

## PHONE:
- Extract digits and formatting
- Accept various formats: (555) 123-4567, 555-123-4567, 5551234567
- Preserve formatting user provides
- Must have at least 10 digits

## TEXT / GENERAL:
- Extract relevant information
- Fix capitalization if appropriate
- Remove extra spaces and line breaks
- Minimum 2 characters

---

SPECIAL BEHAVIOR RULES:

1. Extract from full sentences:
   User: "We invested around 500k last year" → Extract: "$500,000"

2. Auto-fix spelling (unless ambiguous):
   User: "Californya" → Extract: "California, USA"

3. If multiple interpretations possible, ALWAYS ask for clarification:
   User: "200k" for a date field → INVALID: Did you mean $200,000 or a date?

4. NEVER return both clarification AND value - it's one or the other

5. Detect refusals and deferrals - return INVALID:
   - "I don't know" → INVALID: Please provide the {field_name} when you have it
   - "Skip this" → INVALID: This field is required, please provide the {field_name}
   - "TBD" / "N/A" / "Unknown" → INVALID: Please provide an actual value for {field_name}
   - "I'll get back to you" → INVALID: Please provide the {field_name} to continue

6. Extract ONLY the relevant variable from the response, ignore surrounding text

---

OUTPUT INSTRUCTIONS:

Return ONLY one of these two formats:
1. The extracted and normalized value (following field type rules above)
2. INVALID: <your clarification question to the user>

Do NOT include explanations, do NOT return both value and question."""

        try:
            # Use PRO model for critical extraction task (more accurate)
            response = self.extraction_model.generate_content(
                prompt,
                generation_config=self.extraction_config
            )
            extracted = response.text.strip()

            # Check if extraction failed
            if extracted.startswith("INVALID:"):
                error_msg = extracted.replace("INVALID:", "").strip()
                return False, None, error_msg

            # Additional validation based on field type
            is_valid, error = self._validate_field_value(extracted, field_type)

            if not is_valid:
                return False, None, error

            return True, extracted, None

        except Exception as e:
            print(f"Error extracting value: {e}")
            return False, None, f"Failed to process response: {str(e)}"

    def _validate_field_value(self, value: str, field_type: str) -> Tuple[bool, Optional[str]]:
        """Validate extracted value against field type"""

        if not value or value.strip() == "":
            return False, "Value cannot be empty"

        field_type = field_type.lower()

        # Email validation
        if field_type == "email":
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, value):
                return False, "Please provide a valid email address (e.g., user@example.com)"

        # Phone validation
        elif field_type == "phone":
            digits = re.sub(r'\D', '', value)
            if len(digits) < 10:
                return False, "Please provide a valid phone number with at least 10 digits"

        # Date validation
        elif field_type == "date":
            date_patterns = [
                r'\d{1,2}/\d{1,2}/\d{4}',
                r'\d{1,2}-\d{1,2}-\d{4}',
                r'[A-Za-z]+ \d{1,2},? \d{4}'
            ]
            if not any(re.search(pattern, value) for pattern in date_patterns):
                return False, "Please provide a valid date (e.g., 12/31/2024 or December 31, 2024)"

        # Number validation
        elif field_type in ["number", "currency", "percentage"]:
            clean_value = re.sub(r'[$ ,%]', '', value)
            try:
                float(clean_value)
            except ValueError:
                return False, f"Please provide a valid {field_type}"

        # Name validation
        elif field_type == "name":
            if len(value.strip()) < 2:
                return False, "Please provide a valid name (at least 2 characters)"
            if ' ' not in value.strip():
                return False, "Please provide both first and last name"

        # Text validation (minimal)
        elif field_type == "text":
            if len(value.strip()) < 1:
                return False, "Please provide a non-empty value"

        return True, None

    def generate_clarification_question(
        self,
        field_name: str,
        field_type: str,
        error_message: str,
        user_response: str,
        memory: ConversationBufferMemory
    ) -> str:
        """Generate a friendly clarification question when extraction fails"""

        chat_history = self._build_chat_history_string(memory)

        prompt = f"""You are a helpful assistant. The user tried to provide a value for "{field_name}" but there was an issue.

User's response: {user_response}
Issue: {error_message}
Field type: {field_type}

Previous conversation:
{chat_history}

Generate a friendly, conversational message that:
1. Acknowledges their response
2. Explains what format is needed
3. Asks them to try again

Be warm and encouraging. Don't be robotic. Generate ONLY the clarification message."""

        try:
            # Use light model for clarification messages
            response = self.conversation_model.generate_content(
                prompt,
                generation_config=self.conversation_config
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error generating clarification: {e}")
            return f"I need {field_type} for {field_name}. {error_message} Please try again."

    def save_single_message_to_db(self, db, document_id: str, message, message_type: str, field_id: Optional[str] = None):
        """
        Save a single message to Supabase and update cache

        Performance optimizations:
        - Updates cache immediately (fast in-memory operation)
        - Saves to DB for persistence (1 query instead of 2)
        - Removed duplicate check (relies on application logic)
        """
        try:
            # Update cache immediately
            cached_memory = self._get_cached_memory(document_id)
            if cached_memory:
                # Add message to cached memory
                if message_type == "human":
                    cached_memory.chat_memory.add_message(HumanMessage(content=message.content))
                elif message_type == "ai":
                    cached_memory.chat_memory.add_message(AIMessage(content=message.content))
                # Update cache timestamp
                self._cache_memory(document_id, cached_memory)

            # Insert new message to DB for persistence
            db.client.table("conversation_memory").insert({
                "document_id": document_id,
                "session_id": document_id,
                "message_type": message_type,
                "content": message.content,
                "field_id": field_id,
                "metadata": {}
            }).execute()

        except Exception as e:
            print(f"Error saving message to DB: {e}")

    def load_memory_from_db(self, db, document_id: str) -> ConversationBufferMemory:
        """
        Load conversation memory from Supabase with caching and sliding window

        Performance optimizations:
        - Checks cache first (0 DB queries on cache hit)
        - Uses sliding window (last 20 messages only)
        - Caches result for subsequent requests
        """
        # Check cache first
        cached_memory = self._get_cached_memory(document_id)
        if cached_memory:
            return cached_memory

        # Cache miss - load from database with sliding window
        memory = self.create_memory(document_id)

        try:
            # Load only the last N messages (sliding window)
            response = db.client.table("conversation_memory")\
                .select("*")\
                .eq("document_id", document_id)\
                .order("created_at", desc=True)\
                .limit(self._sliding_window_size)\
                .execute()

            # Reverse to get chronological order
            records = reversed(response.data)

            for record in records:
                if record["message_type"] == "human":
                    memory.chat_memory.add_message(HumanMessage(content=record["content"]))
                elif record["message_type"] == "ai":
                    memory.chat_memory.add_message(AIMessage(content=record["content"]))

        except Exception as e:
            print(f"Error loading memory from DB: {e}")

        # Cache the loaded memory
        self._cache_memory(document_id, memory)

        return memory


# Create singleton instance
conversation_service = ConversationService()
