import google.generativeai as genai
from config import settings
from typing import List, Dict, Optional, Tuple
import json
import re


class GeminiService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def extract_placeholders(self, document_content: str) -> List[Dict[str, any]]:
        """
        Extract placeholders from document content using Gemini.
        Returns list of fields with name, placeholder, type, suggested order, and occurrence_index.
        """
        prompt = f"""You are an expert legal document analyzer. Analyze the following document and identify ALL placeholders that need to be filled in.

Document:
{document_content}

Instructions:
1. Find all placeholders (usually in brackets like [PLACEHOLDER], {{PLACEHOLDER}}, or <PLACEHOLDER>)
2. For each placeholder, determine:
   - A clear, user-friendly name (e.g., "Start Date" for [START_DATE])
   - The exact placeholder text as it appears in the document
   - The field type (text, date, number, email, phone, address)
   - A logical order for filling (most important/required first)

Return your response as a JSON array with this exact structure:
[
  {{
    "name": "Field name in plain English",
    "placeholder": "[EXACT_PLACEHOLDER_TEXT]",
    "type": "text|date|number|email|phone|address",
    "order": 1
  }}
]

IMPORTANT:
- Only return valid JSON, no additional text
- Preserve the exact placeholder format from the document
- Order fields logically (e.g., names before dates, essential info first)
- Use proper field types (date for dates, email for emails, etc.)
"""

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # Extract JSON from response (handle markdown code blocks)
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            elif response_text.startswith('```'):
                response_text = re.sub(r'```\w*\s*', '', response_text)
                response_text = response_text.rstrip('`').strip()

            fields = json.loads(response_text)
            # Add occurrence tracking for duplicate placeholders
            return self._add_occurrence_indices(fields)

        except json.JSONDecodeError as e:
            print(f"Error parsing Gemini response: {e}")
            print(f"Response text: {response_text}")
            # Fallback: try to extract placeholders with regex
            return self._fallback_placeholder_extraction(document_content)
        except Exception as e:
            print(f"Error extracting placeholders: {e}")
            return self._fallback_placeholder_extraction(document_content)

    def _fallback_placeholder_extraction(self, document_content: str) -> List[Dict[str, any]]:
        """Fallback method to extract placeholders using regex"""
        placeholders = []
        # Match [PLACEHOLDER], {PLACEHOLDER}, <PLACEHOLDER>
        patterns = [
            r'\[([A-Z_][A-Z0-9_]*)\]',
            r'\{([A-Z_][A-Z0-9_]*)\}',
            r'<([A-Z_][A-Z0-9_]*)>',
        ]

        found = set()
        for pattern in patterns:
            matches = re.finditer(pattern, document_content)
            for match in matches:
                placeholder_text = match.group(0)
                placeholder_name = match.group(1)

                if placeholder_text not in found:
                    found.add(placeholder_text)
                    # Convert SNAKE_CASE to Title Case
                    display_name = placeholder_name.replace('_', ' ').title()

                    # Guess type based on name
                    field_type = "text"
                    if "DATE" in placeholder_name or "TIME" in placeholder_name:
                        field_type = "date"
                    elif "EMAIL" in placeholder_name:
                        field_type = "email"
                    elif "PHONE" in placeholder_name or "TEL" in placeholder_name:
                        field_type = "phone"
                    elif "ADDRESS" in placeholder_name:
                        field_type = "address"
                    elif any(word in placeholder_name for word in ["AGE", "AMOUNT", "SALARY", "NUMBER"]):
                        field_type = "number"

                    placeholders.append({
                        "name": display_name,
                        "placeholder": placeholder_text,
                        "type": field_type,
                        "order": len(placeholders) + 1
                    })

        # Add occurrence tracking for duplicate placeholders
        return self._add_occurrence_indices(placeholders)

    def _add_occurrence_indices(self, fields: List[Dict[str, any]]) -> List[Dict[str, any]]:
        """
        Add occurrence_index to each field to handle duplicate placeholders.
        For example, if there are 3 fields with placeholder "[___]", they get indices 0, 1, 2.
        """
        # Track occurrence count for each placeholder
        placeholder_counts = {}

        for field in fields:
            placeholder = field["placeholder"]

            # Get current occurrence index for this placeholder
            occurrence_index = placeholder_counts.get(placeholder, 0)

            # Add occurrence_index to field
            field["occurrence_index"] = occurrence_index

            # Increment count for next occurrence
            placeholder_counts[placeholder] = occurrence_index + 1

        return fields

    def generate_question_for_field(self, field_name: str, field_type: str,
                                    placeholder: str, document_context: str = "") -> str:
        """
        Generate a conversational question to ask the user for a field value.
        """
        prompt = f"""You are a friendly AI assistant helping someone fill out a legal document.

Field to fill: {field_name}
Field type: {field_type}
Placeholder in document: {placeholder}

Context (nearby text from document):
{document_context[:500] if document_context else "No additional context"}

Generate a clear, conversational question to ask the user for this information. The question should:
1. Be friendly and natural (like a helpful assistant, not a form)
2. Clearly explain what information is needed
3. Include format hints if relevant (e.g., "MM/DD/YYYY" for dates)
4. Be concise (1-2 sentences maximum)

Return ONLY the question text, nothing else.
"""

        try:
            response = self.model.generate_content(prompt)
            question = response.text.strip()
            # Remove quotes if present
            question = question.strip('"\'')
            return question
        except Exception as e:
            print(f"Error generating question: {e}")
            # Fallback to simple question
            return self._fallback_question(field_name, field_type)

    def _fallback_question(self, field_name: str, field_type: str) -> str:
        """Fallback method to generate a simple question"""
        type_hints = {
            "date": " (MM/DD/YYYY)",
            "email": " (example@email.com)",
            "phone": " (XXX-XXX-XXXX)",
            "number": " (numbers only)",
        }
        hint = type_hints.get(field_type, "")
        return f"What is the {field_name}?{hint}"

    def validate_field_value(self, field_type: str, value: str) -> Tuple[bool, Optional[str]]:
        """
        Validate a field value based on its type.
        Returns (is_valid, error_message)
        """
        if not value or not value.strip():
            return False, "Value cannot be empty"

        if field_type == "email":
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, value):
                return False, "Please enter a valid email address"

        elif field_type == "phone":
            # Remove common separators
            phone_digits = re.sub(r'[^0-9]', '', value)
            if len(phone_digits) < 10:
                return False, "Please enter a valid phone number (at least 10 digits)"

        elif field_type == "number":
            try:
                float(value.replace(',', ''))
            except ValueError:
                return False, "Please enter a valid number"

        elif field_type == "date":
            # Basic date format check - could be enhanced
            date_patterns = [
                r'^\d{1,2}/\d{1,2}/\d{2,4}$',  # MM/DD/YYYY or M/D/YY
                r'^\d{4}-\d{2}-\d{2}$',         # YYYY-MM-DD
                r'^[A-Za-z]+ \d{1,2},? \d{4}$', # Month DD, YYYY
            ]
            if not any(re.match(pattern, value) for pattern in date_patterns):
                return False, "Please enter a valid date (e.g., MM/DD/YYYY)"

        return True, None

    def generate_completion_summary(self, filename: str, total_fields: int,
                                   completion_time_minutes: int) -> str:
        """Generate a friendly completion message"""
        return f"Congratulations! You've successfully completed all {total_fields} fields in '{filename}'. Total time: {completion_time_minutes} minutes. Your document is ready for download!"


# Singleton instance
gemini_service = GeminiService()
