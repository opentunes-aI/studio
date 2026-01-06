import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env variables from the studio folder
env_path = os.path.join("acestep_studio", ".env.local")
if not os.path.exists(env_path):
    print(f"Error: {env_path} not found")
    sys.exit(1)

load_dotenv(env_path)

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
# Prefer Service Role for admin tasks
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") 
key_type = "SERVICE_ROLE"

if not key:
    key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    key_type = "ANON"

print(f"URL: {url}")
print(f"Key Type: {key_type}")

if not url or not key:
    print("Error: Missing Supabase credentials")
    sys.exit(1)

try:
    supabase: Client = create_client(url, key)
    
    print("--- Checking Storage Buckets ---")
    buckets = supabase.storage.list_buckets()
    bucket_names = [b.name for b in buckets]
    print(f"Current Buckets: {bucket_names}")
    
    if "music" not in bucket_names:
        print("Bucket 'music' is MISSING. Attempting to create...")
        try:
            supabase.storage.create_bucket("music", options={"public": True})
            print("Successfully created 'music' bucket.")
        except Exception as create_err:
            print(f"Creation Failed: {create_err}")
            print("Hint: If using ANON key, Creation might be blocked by Policies.")
    else:
        print("Bucket 'music' exists.")
        
except Exception as e:
    print(f"Operation Failed: {e}")
