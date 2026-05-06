import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key or api_key == "your_google_api_key_here":
    print("❌ GOOGLE_API_KEY is not set or is still the placeholder in .env")
    exit(1)

genai.configure(api_key=api_key)

print(f"Checking available models for API Key: {api_key[:5]}...{api_key[-5:]}")

try:
    available_models = genai.list_models()
    print("\nAvailable Models:")
    found_any = False
    for model in available_models:
        found_any = True
        print(f" - {model.name} (Supports: {model.supported_generation_methods})")
    
    if not found_any:
        print(" No models found for this API key.")
except Exception as e:
    print(f"Error listing models: {str(e)}")
