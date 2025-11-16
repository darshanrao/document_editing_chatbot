"""
Test script to verify LangChain compatibility with different Gemini models
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings
import sys

def test_model(model_name: str):
    """Test a specific Gemini model with LangChain"""
    print(f"\n{'='*60}")
    print(f"Testing model: {model_name}")
    print(f"{'='*60}")

    try:
        # Initialize the model
        llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
            max_tokens=1000,
            max_retries=2
        )
        print(f"✓ Model initialized successfully")

        # Test a simple prompt
        test_prompt = "Extract the email address from this text: 'My email is john@example.com'"
        response = llm.invoke(test_prompt)

        print(f"✓ Model generated response successfully")
        print(f"Response: {response.content[:100]}...")

        # Test field extraction (core use case)
        extraction_prompt = """You are an intelligent field extraction system.

Field Details:
- Name: Email Address
- Type: email

User response: "Sure, you can reach me at sarah.jones@company.com"

Extract ONLY the email address value, nothing else."""

        extraction_response = llm.invoke(extraction_prompt)
        print(f"✓ Field extraction test successful")
        print(f"Extracted value: {extraction_response.content}")

        return True, model_name

    except Exception as e:
        print(f"✗ Model failed with error: {str(e)}")
        return False, str(e)

def main():
    """Test all recommended Gemini models"""
    print("Starting LangChain + Gemini Model Compatibility Test")
    print("="*60)

    models_to_test = [
        "gemini-2.0-flash-exp",  # Latest experimental
        "gemini-1.5-flash",      # Stable version
        "gemini-1.5-pro",        # Pro version
    ]

    results = {}

    for model in models_to_test:
        success, result = test_model(model)
        results[model] = success

    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")

    working_models = [model for model, success in results.items() if success]
    failed_models = [model for model, success in results.items() if not success]

    if working_models:
        print(f"\n✓ Working models ({len(working_models)}):")
        for model in working_models:
            print(f"  - {model}")
        print(f"\nRecommended model to use: {working_models[0]}")

    if failed_models:
        print(f"\n✗ Failed models ({len(failed_models)}):")
        for model in failed_models:
            print(f"  - {model}")

    return len(working_models) > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
