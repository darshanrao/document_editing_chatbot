"""
Conversation service using Google GenAI directly with LangChain memory
"""
from typing import List, Dict, Any, Optional, Tuple
from langchain.memory import ConversationBufferMemory
from langchain.schema import HumanMessage, AIMessage
from config import settings
import json
import re
from datetime import datetime
import google.generativeai as genai


class ConversationService:
    """Manages conversational flow with memory"""

    def __init__(self):
        # Use Google GenAI directly
        genai.configure(api_key=settings.GEMINI_API_KEY)

        # Light model for conversation generation (cheaper, faster)
        self.conversation_model = genai.GenerativeModel('gemini-2.5-flash-lite')
        self.conversation_config = genai.types.GenerationConfig(
            temperature=0.7,  # More creative for friendly questions
        )

        # Pro model for extraction (more accurate, critical task)
        self.extraction_model = genai.GenerativeModel('gemini-2.5-pro')
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

        prompt = f"""You are an intelligent field extraction system. Your job is to extract the EXACT value that should fill in the field from the user's response.

Field Details:
- Name: {field_name}
- Type: {field_type}
- Placeholder: {placeholder}

Previous conversation:
{chat_history}

Extraction Rules:
1. Extract ONLY the value that should replace the placeholder
2. Clean up the value (remove extra spaces, fix capitalization if needed)
3. For dates, convert to a standard format (MM/DD/YYYY)
4. For currency, include the dollar sign if mentioned
5. For names, ensure proper capitalization
6. Return ONLY the extracted value, nothing else

Validation Rules by Type:
- email: Must contain @ and domain
- phone: Must contain digits, can have formatting
- date: Must be a valid date
- number: Must be numeric
- name: Must be at least 2 characters
- text: Any non-empty text

If the response is ambiguous or doesn't contain the required information, respond with: INVALID: <reason>

Examples:
User says: "My email is john@example.com"
You extract: john@example.com

User says: "It's due on December 15, 2024"
You extract: 12/15/2024

User says: "I don't know"
You respond: INVALID: User did not provide a value

Now extract from this user response: "{user_response}"
"""

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

    def save_memory_to_db(self, db, document_id: str, memory: ConversationBufferMemory):
        """Save conversation memory to Supabase"""
        try:
            for message in memory.chat_memory.messages:
                message_type = "human" if isinstance(message, HumanMessage) else "ai"

                db.client.table("conversation_memory").insert({
                    "document_id": document_id,
                    "session_id": document_id,
                    "message_type": message_type,
                    "content": message.content,
                    "metadata": {}
                }).execute()
        except Exception as e:
            print(f"Error saving memory to DB: {e}")

    def load_memory_from_db(self, db, document_id: str) -> ConversationBufferMemory:
        """Load conversation memory from Supabase"""
        memory = self.create_memory(document_id)

        try:
            response = db.client.table("conversation_memory")\
                .select("*")\
                .eq("document_id", document_id)\
                .order("created_at")\
                .execute()

            for record in response.data:
                if record["message_type"] == "human":
                    memory.chat_memory.add_message(HumanMessage(content=record["content"]))
                elif record["message_type"] == "ai":
                    memory.chat_memory.add_message(AIMessage(content=record["content"]))

        except Exception as e:
            print(f"Error loading memory from DB: {e}")

        return memory


# Create singleton instance
conversation_service = ConversationService()
