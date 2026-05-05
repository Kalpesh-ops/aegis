import google.generativeai as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize client
genai.configure(api_key=settings.GOOGLE_API_KEY)

class AegisLLMClient:
    def __init__(self):
        # Setting 2.5 Flash as primary for speed and accuracy in extraction
        self.primary_model_name = 'gemini-2.5-flash'
        # Fallback model ensures extraction doesn't fail if the primary endpoint experiences issues
        self.fallback_model_name = 'gemini-pro' 
        
        self.primary_model = genai.GenerativeModel(self.primary_model_name)
        self.fallback_model = genai.GenerativeModel(self.fallback_model_name)

    def generate_extraction(self, prompt: str, schema: dict) -> str:
        """
        Executes the prompt against the primary model with fallback logic.
        Requires a strict JSON schema for deterministic extraction.
        """
        try:
            response = self.primary_model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json", "response_schema": schema}
            )
            return response.text
        except Exception as e:
            logger.warning(f"Primary model {self.primary_model_name} failed: {str(e)}. Attempting fallback.")
            try:
                response = self.fallback_model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json", "response_schema": schema}
                )
                return response.text
            except Exception as fallback_error:
                logger.error(f"Fallback model {self.fallback_model_name} also failed: {str(fallback_error)}")
                raise RuntimeError("LLM Extraction failed on both primary and fallback models.")

llm_client = AegisLLMClient()