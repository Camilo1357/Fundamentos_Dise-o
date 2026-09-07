import os

from dotenv import load_dotenv
from supabase import create_client, Client


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("================================")
print("SUPABASE URL:")
print(repr(SUPABASE_URL))
print("================================")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)