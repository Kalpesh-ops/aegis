import time
import re
import copy
import google.generativeai as genai
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize client
genai.configure(api_key=settings.GOOGLE_API_KEY)

# Maximum retries per model when hitting 429 rate limits
MAX_RETRIES = 3


class AegisLLMClient:
    def __init__(self):
        # Build a prioritized list of models from distinct quota buckets.
        # Each model family has its own rate-limit counter, so cycling
        # through families maximizes our chance of getting a response.
        self.model_cascade = self._build_model_cascade()
        logger.info(f"Aegis Model Cascade: {[m['name'] for m in self.model_cascade]}")

    def _build_model_cascade(self):
        """
        Queries the API to build an ordered list of models from distinct
        quota families. We pick one model per family to maximize throughput.
        """
        # Ordered preference: fastest first, then most capable
        family_preferences = [
            # (family_key, substring_match)
            ("2.5-flash", "gemini-2.5-flash"),
            ("2.0-flash", "gemini-2.0-flash"),
            ("2.5-pro",   "gemini-2.5-pro"),
            ("flash-lite","gemini-2.0-flash-lite"),
            ("3-flash",   "gemini-3-flash"),
            ("3-pro",     "gemini-3-pro"),
        ]

        try:
            available = [
                m.name for m in genai.list_models()
                if 'generateContent' in m.supported_generation_methods
            ]
        except Exception as e:
            logger.warning(f"Failed to list models: {e}. Using hardcoded defaults.")
            available = []

        cascade = []
        used = set()
        for family_key, substr in family_preferences:
            # Find the first available model matching this family
            match = next(
                (m for m in available
                 if substr in m and m not in used
                 # Exclude image/tts/audio/live/robotics variants
                 and not any(x in m for x in ["image", "tts", "audio", "live", "robotics", "computer-use"])),
                None
            )
            if match:
                cascade.append({
                    "name": match,
                    "instance": genai.GenerativeModel(match)
                })
                used.add(match)

        # Absolute fallback if nothing matched
        if not cascade:
            fallback_name = "gemini-2.0-flash"
            cascade.append({
                "name": fallback_name,
                "instance": genai.GenerativeModel(fallback_name)
            })

        return cascade

    def _clean_schema(self, schema: dict) -> dict:
        """
        Aggressively removes $defs, anyOf, titles, and other metadata
        not supported by the Google Generative AI JSON schema validator.
        """
        schema = copy.deepcopy(schema)

        # 1. Resolve $defs references
        if "$defs" in schema:
            defs = schema.pop("$defs")
            def _resolve_refs(item):
                if isinstance(item, dict):
                    if "$ref" in item:
                        ref_name = item["$ref"].split("/")[-1]
                        return _resolve_refs(copy.deepcopy(defs[ref_name]))
                    return {k: _resolve_refs(v) for k, v in item.items()}
                elif isinstance(item, list):
                    return [_resolve_refs(i) for i in item]
                return item
            schema = _resolve_refs(schema)

        # 2. Flatten anyOf (Gemini doesn't support unions/anyOf)
        def _flatten_unions(item):
            if isinstance(item, dict):
                if "anyOf" in item:
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
                forbidden = ["title", "default", "examples"]
                new_item = {
                    k: _strip_unsupported(v)
                    for k, v in item.items()
                    if k not in forbidden
                }
                # Sync required[] with actual properties
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

    @staticmethod
    def _parse_retry_delay(error_message: str) -> float:
        """Extracts the retry delay from a 429 error message."""
        match = re.search(r'retry in ([\d.]+)s', str(error_message), re.IGNORECASE)
        if match:
            return float(match.group(1))
        return 15.0  # Conservative default

    def _call_with_retry(self, model_entry: dict, prompt: str, clean_schema: dict) -> str:
        """Calls a single model with automatic retry on 429 rate limits."""
        model = model_entry["instance"]
        name = model_entry["name"]

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "response_mime_type": "application/json",
                        "response_schema": clean_schema
                    }
                )
                return response.text
            except Exception as e:
                err_str = str(e)
                is_rate_limit = "429" in err_str or "quota" in err_str.lower()

                if is_rate_limit and attempt < MAX_RETRIES:
                    delay = self._parse_retry_delay(err_str)
                    # Cap wait at 60s to avoid blocking the demo too long
                    delay = min(delay, 60.0)
                    logger.warning(
                        f"[{name}] Rate limited (attempt {attempt}/{MAX_RETRIES}). "
                        f"Waiting {delay:.1f}s before retry..."
                    )
                    time.sleep(delay)
                    continue
                else:
                    raise  # Re-raise for the cascade to catch

    def generate_extraction(self, prompt: str, schema: dict) -> str:
        """
        Cascades through all available models. For each model:
        - Retries up to MAX_RETRIES on 429 errors with the API-suggested delay
        - On non-retryable failure, moves to the next model in the cascade
        """
        clean_schema = self._clean_schema(schema)
        last_error = None

        for model_entry in self.model_cascade:
            name = model_entry["name"]
            try:
                result = self._call_with_retry(model_entry, prompt, clean_schema)
                logger.info(f"Extraction succeeded on model: {name}")
                return result
            except Exception as e:
                last_error = e
                logger.warning(f"Model {name} failed: {str(e)[:200]}. Moving to next model...")
                continue

        logger.error(f"All models in cascade exhausted. Last error: {last_error}")
        raise RuntimeError(
            f"LLM Extraction failed on all {len(self.model_cascade)} models. "
            f"Last error: {str(last_error)[:300]}"
        )


llm_client = AegisLLMClient()