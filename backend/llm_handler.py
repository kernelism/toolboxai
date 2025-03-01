import os
import logging
import requests
from fastapi import HTTPException
from models import AskRequest
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

TOGETHER_AI_API_KEY = os.getenv("TOGETHER_AI_API_KEY")
TOGETHER_AI_MODEL = os.getenv("TOGETHER_AI_MODEL", "mistralai/Mixtral-8x7B-Instruct")

def send_llm_request(request: AskRequest):
    if not TOGETHER_AI_API_KEY:
        raise HTTPException(status_code=500, detail="Together AI API key is missing")

    payload = {
        "model": TOGETHER_AI_MODEL,
        "prompt": f"Context: {request.selectedText}\nQuestion: {request.prompt}",
        "max_tokens": 100,
    }

    headers = {"Authorization": f"Bearer {TOGETHER_AI_API_KEY}"}

    try:
        response = requests.post(
            "https://api.together.xyz/v1/completions",
            json=payload,
            headers=headers,
            timeout=30
        )
        response.raise_for_status()
        return response.json().get("choices", [{}])[0].get("text", "").strip()

    except requests.RequestException as e:
        logger.error(f"Error calling Together AI: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch response from Together AI")
