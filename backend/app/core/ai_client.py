"""Gemini AI client singleton used across all AI services."""
import os
import google.generativeai as genai

_client_configured = False


def get_gemini_model(model_name: str = 'gemini-3.6-flash') -> genai.GenerativeModel:
    """Return a configured Gemini GenerativeModel.

    Reads GEMINI_API_KEY from pydantic Settings (which loads .env) with an
    os.getenv fallback so the key works regardless of loading order.
    """
    global _client_configured

    # Try pydantic settings first (picks up .env automatically)
    try:
        from app.core.config import settings
        api_key = settings.gemini_api_key or os.getenv('GEMINI_API_KEY', '')
    except Exception:
        api_key = os.getenv('GEMINI_API_KEY', '')

    if not api_key:
        raise RuntimeError(
            'GEMINI_API_KEY is not set. Add GEMINI_API_KEY=your_key to backend/.env'
        )
    if not _client_configured:
        genai.configure(api_key=api_key)
        _client_configured = True
    return genai.GenerativeModel(model_name)

