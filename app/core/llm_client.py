import google.generativeai as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize client
genai.configure(api_key=settings.GOOGLE_API_KEY)

class AegisLLMClient:
    def __init__(self):
        # Dynamically discover available models to ensure environment compatibility
        self.primary_model_name, self.fallback_model_name = self._discover_models()
        
        self.primary_model = genai.GenerativeModel(self.primary_model_name)
        self.fallback_model = genai.GenerativeModel(self.fallback_model_name)

    def _discover_models(self):
        """
        Queries the API to find the best available models for extraction.
        Prioritizes Flash models for speed and Pro models for fallback.
        """
        try:
            available = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            
            # Preference order for extraction tasks
            primary_candidates = [
                "gemini-2.5-flash",
                "gemini-1.5-flash",
                "gemini-2.0-flash",
                "gemini-flash"
            ]
            fallback_candidates = [
                "gemini-pro",
                "gemini-1.5-pro",
                "gemini-2.0-pro"
            ]
            
            primary = next((m for m in available if any(c in m for c in primary_candidates)), None)
            if not primary:
                primary = available[0] if available else "gemini-pro"
                
            fallback = next((m for m in available if any(c in m for c in fallback_candidates) and m != primary), None)
            if not fallback:
                fallback = available[1] if len(available) > 1 else primary
                
            logger.info(f"Aegis Dynamic Model Selection: Primary={primary}, Fallback={fallback}")
            return primary, fallback
        except Exception as e:
            logger.warning(f"Failed to dynamically discover models: {str(e)}. Defaulting to gemini-pro.")
            return "gemini-pro", "gemini-pro"

    def _clean_schema(self, schema: dict) -> dict:
        """
        Aggressively removes $defs, anyOf, titles, and other metadata 
        not supported by the Google Generative AI JSON schema validator.
        """
        # 1. Resolve $defs references
        if "$defs" in schema:
            defs = schema.pop("$defs")
            def _resolve_refs(item):
                if isinstance(item, dict):
                    if "$ref" in item:
                        ref_name = item["$ref"].split("/")[-1]
                        return _resolve_refs(defs[ref_name])
                    return {k: _resolve_refs(v) for k, v in item.items()}
                elif isinstance(item, list):
                    return [_resolve_refs(i) for i in item]
                return item
            schema = _resolve_refs(schema)

        # 2. Flatten anyOf (Gemini doesn't support unions/anyOf)
        def _flatten_unions(item):
            if isinstance(item, dict):
                if "anyOf" in item:
                    # Pick the first non-null type in anyOf to avoid union validation errors
                    options = item.pop("anyOf")
                    real_option = next((opt for opt in options if opt.get("type") != "null"), options[0])
                    item.update(real_option)
                return {k: _flatten_unions(v) for k, v in item.items()}
            elif isinstance(item, list):
                return [_flatten_unions(i) for i in item]
            return item

        # 3. Strip metadata but preserve property-level descriptions for LLM context
        def _strip_unsupported(item):
            if isinstance(item, dict):
                # We keep 'description' as it provides critical context for the LLM extraction
                forbidden = ["title", "default", "examples"]
                
                # Filter current level
                new_item = {
                    k: _strip_unsupported(v) 
                    for k, v in item.items() 
                    if k not in forbidden
                }
                
                # CRITICAL: If this is an object, ensure the 'required' list 
                # only contains keys that actually exist in 'properties'
                if "required" in new_item and isinstance(new_item["required"], list) and "properties" in new_item:
                    new_item["required"] = [
                        r for r in new_item["required"] 
                        if r in new_item["properties"]
                    ]
                
                return new_item
            elif isinstance(item, list):
                return [_strip_unsupported(i) for i in item]
            return item
            
        temp_schema = _flatten_unions(schema)
        return _strip_unsupported(temp_schema)

    def generate_extraction(self, prompt: str, schema: dict) -> str:
        """
        Executes the prompt against the primary model with fallback logic.
        Requires a strict JSON schema for deterministic extraction.
        """
        clean_schema = self._clean_schema(schema)
        try:
            response = self.primary_model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json", "response_schema": clean_schema}
            )
            return response.text
        except Exception as e:
            logger.warning(f"Primary model {self.primary_model_name} failed: {str(e)}. Attempting fallback.")
            try:
                response = self.fallback_model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json", "response_schema": clean_schema}
                )
                return response.text
            except Exception as fallback_error:
                logger.error(f"Fallback model {self.fallback_model_name} also failed: {str(fallback_error)}")
                raise RuntimeError("LLM Extraction failed on both primary and fallback models.")

llm_client = AegisLLMClient()