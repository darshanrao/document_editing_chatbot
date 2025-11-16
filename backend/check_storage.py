import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("=" * 60)
print("Checking Supabase Storage Buckets")
print("=" * 60)

try:
    # Create Supabase client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✓ Connected to Supabase")

    # List all buckets
    print("\nFetching storage buckets...")
    buckets = supabase.storage.list_buckets()

    print(f"\nFound {len(buckets)} bucket(s):")
    print("-" * 60)

    if buckets:
        for bucket in buckets:
            print(f"\nBucket: {bucket.name}")
            print(f"  ID: {bucket.id}")
            print(f"  Public: {bucket.public}")
            print(f"  Created: {bucket.created_at}")
    else:
        print("⚠ No storage buckets found!")
        print("\nYou need to create the following buckets in Supabase:")
        print("  1. original-documents (for uploaded files)")
        print("  2. completed-documents (for processed files)")

    print("\n" + "=" * 60)
    print("Checking specific buckets...")
    print("=" * 60)

    required_buckets = ['original-documents', 'completed-documents']

    for bucket_name in required_buckets:
        try:
            # Try to get bucket info
            files = supabase.storage.from_(bucket_name).list()
            print(f"✓ '{bucket_name}' exists - contains {len(files)} file(s)")
        except Exception as e:
            print(f"✗ '{bucket_name}' does not exist or is not accessible")
            print(f"  Error: {str(e)}")

    print("\n" + "=" * 60)
    print("Storage Check Complete")
    print("=" * 60)

except Exception as e:
    print(f"✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
