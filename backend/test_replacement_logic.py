"""
Test script to debug the replace_nth_occurrence logic
"""

def replace_nth_occurrence(text: str, placeholder: str, replacement: str, n: int) -> str:
    """
    Replace only the Nth occurrence of a placeholder in text.
    n is 0-indexed (0 = first occurrence, 1 = second occurrence, etc.)
    """
    print(f"\n=== replace_nth_occurrence called ===")
    print(f"placeholder: {placeholder}")
    print(f"replacement: {replacement}")
    print(f"n (occurrence_index): {n}")
    print(f"text before: {text[:100]}...")
    
    # Split the text by the placeholder
    parts = text.split(placeholder)
    
    print(f"After split, got {len(parts)} parts (= {len(parts)-1} occurrences)")
    
    # If we don't have enough occurrences, return unchanged
    if len(parts) <= n + 1:
        print(f"❌ Not enough occurrences! Need at least {n+1} occurrences, but only have {len(parts)-1}")
        return text
    
    # Join: take all parts before n, add replacement, then all parts after n
    before = placeholder.join(parts[:n+1])
    after = placeholder.join(parts[n+1:])
    result = before + replacement + after
    
    print(f"✓ Replaced occurrence #{n}")
    print(f"text after: {result[:150]}...")
    
    return result


# Simulate the scenario
print("=" * 80)
print("SIMULATING DOCUMENT PREVIEW GENERATION")
print("=" * 80)

# Initial HTML from Mammoth
html_content = "Purchase Amount: $[_____________]. Valuation Cap: $[_____________]."
print(f"\nInitial HTML:\n{html_content}\n")

# Simulate fields from database
fields = [
    {
        "name": "Purchase Amount",
        "placeholder": "$[_____________]",
        "value": "$100,000",
        "occurrence_index": 0
    },
    {
        "name": "Post-Money Valuation Cap", 
        "placeholder": "$[_____________]",
        "value": None,  # Not filled yet
        "occurrence_index": 1
    }
]

print(f"\nFields to process:")
for f in fields:
    print(f"  - {f['name']}: occurrence_index={f['occurrence_index']}, value={f['value']}")

# Simulate the loop from get_document_preview()
print("\n" + "=" * 80)
print("PROCESSING FIELDS")
print("=" * 80)

for field in fields:
    placeholder = field["placeholder"]
    value = field.get("value")
    occurrence_index = field.get("occurrence_index", 0)
    
    print(f"\n--- Processing field: {field['name']} ---")
    
    if value:
        # Wrap filled values in a span for styling
        replacement = f'<span class="filled">{value}</span>'
        html_content = replace_nth_occurrence(
            html_content, placeholder, replacement, occurrence_index
        )
    else:
        # Wrap pending placeholders in a span for styling
        replacement = f'<span class="pending">{placeholder}</span>'
        html_content = replace_nth_occurrence(
            html_content, placeholder, replacement, occurrence_index
        )

print("\n" + "=" * 80)
print("FINAL RESULT")
print("=" * 80)
print(html_content)
