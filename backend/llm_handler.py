import os
import logging
import requests
from fastapi import HTTPException
from models import AskRequest
from dotenv import load_dotenv
import json
import subprocess

logger = logging.getLogger(__name__)
load_dotenv()

# Load configurations
MODEL_BACKEND = os.getenv("MODEL_BACKEND", "together_ai")
TOGETHER_AI_API_KEY = os.getenv("TOGETHER_AI_API_KEY")
TOGETHER_AI_MODEL = os.getenv("TOGETHER_AI_MODEL", "mistralai/Mixtral-8x7B-Instruct")
LOCAL_MODEL_NAME = os.getenv("LOCAL_MODEL_NAME", "mixtral")

def send_llm_request(request: AskRequest):
    """
    Sends a request to the LLM, using either Together AI (cloud) or Ollama (local).
    """
    if MODEL_BACKEND == "together_ai":
        if not TOGETHER_AI_API_KEY:
            raise HTTPException(status_code=500, detail="Together AI API key is missing")

        payload = {
            "model": TOGETHER_AI_MODEL,
            "prompt": f"Context: {request.selectedText}\nQuestion: {request.prompt}",
            "max_tokens": 300,
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

    elif MODEL_BACKEND == "local":
        return send_local_request(request)

    else:
        raise HTTPException(status_code=500, detail="Invalid MODEL_BACKEND value. Use 'together_ai' or 'local'.")

def send_local_request(request: AskRequest):
    """
    Calls a local LLM using Ollama.
    """
    try:
        # Use Ollama's CLI to make a request
        cmd = [
            "ollama", "run", LOCAL_MODEL_NAME,
            json.dumps({"prompt": f"Context: {request.selectedText}\nQuestion: {request.prompt}"})
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            raise Exception(result.stderr)
        
        return result.stdout.strip()

    except Exception as e:
        logger.error(f"Error calling local model: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch response from local model")
