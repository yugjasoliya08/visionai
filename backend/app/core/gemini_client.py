import os
from tabnanny import check
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = None

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        print(f"[OK] Gemini Client Connected (key: {GEMINI_API_KEY[:8]}...)")
    except Exception as e:
        print(f"[ERROR] Gemini init error: {e}")
        client = None
else:
    print("[WARN] GEMINI_API_KEY not set - AI disabled.")

__all__ = ["client"]