import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def get_gemini_client(model_name: str = "gemini-flash-lite-latest"):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in environment.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name)
