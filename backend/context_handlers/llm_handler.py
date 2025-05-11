from openai import OpenAI
from typing import List

import requests
from fastapi import HTTPException
from config import settings
from models import AskRequest
from dotenv import load_dotenv

import logging
from . import utils

logger = logging.getLogger(__name__)
load_dotenv()

class LLMHandler:
    def send_llm_request(self, request: AskRequest):
        """
        Dispatches the request to the appropriate LLM backend.
        """
        if settings.MODEL_BACKEND == "together_ai":
            return self.send_together_ai_request(request)
        elif settings.MODEL_BACKEND == "openai":
            return self.send_openai_request(request)
        elif settings.MODEL_BACKEND == "local":
            return self.send_local_request(request)
        else:
            raise HTTPException(status_code=500, detail="Invalid MODEL_BACKEND value. Use 'together_ai', 'openai', or 'local'.")

        
    def convert_model_data(self, prompt: str, model_data: dict) -> AskRequest:
        """
        converts PageTitles to AskRequest
        """
        all_data = ""
        for page in model_data:
            for title in page.get("titles", []):
                all_data += f"{title}\n"
        all_data += f"\n\n{model_data.get('page_text', '')}"

        # print approx token length in all_data
        token_length = len(all_data.split())
        logger.info(f"Token length of all_data: {token_length}")
        if token_length > 4096:
            # raise warning
            logger.warning(f"Token length of all_data is greater than 4096: {token_length}")
        
        return AskRequest(
            prompt=prompt,
            context=all_data,
        )
    
    def send_together_ai_request(self, request: AskRequest):
        """
        Sends a request to Together AI.
        """
        if not settings.API_KEY:
            raise HTTPException(status_code=500, detail="Together AI API key is missing")

        payload = {
            "model": settings.MODEL,
            "prompt": utils.research_q_prompt_builder(request),
            "max_tokens": 300,
        }
        headers = {"Authorization": f"Bearer {settings.API_KEY}"}

        try:
            response = requests.post(
                settings.API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json().get("choices", [{}])[0].get("text", "").strip()
        except requests.RequestException as e:
            logger.error(f"Error calling Together AI: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch response from Together AI")

    def send_openai_request(self, request: AskRequest):
        """
        Sends a request to OpenAI.
        """
        if not settings.API_KEY:
            raise HTTPException(status_code=500, detail="OpenAI API key is missing")

        payload = {
            "model": settings.MODEL,
            "messages": [
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": utils.research_q_prompt_builder(request)}
            ],
            "max_tokens": 300,
        }
        headers = {
            "Authorization": f"Bearer {settings.API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(
                settings.API_URL,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        except requests.RequestException as e:
            logger.error(f"Error calling OpenAI: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch response from OpenAI")
    
    def send_local_request(self, request: AskRequest):
        """
        Calls a local LLM using Ollama's REST API.
        """
        if not settings.OLLAMA_API_URL or not settings.LOCAL_MODEL_NAME:
            raise HTTPException(status_code=500, detail="Ollama API URL or local model name is missing")
        try:
            payload = {
                "model": settings.LOCAL_MODEL_NAME,
                "prompt": utils.research_q_prompt_builder(request),
                "stream": False  # Set to True if you want streaming responses
            }
            response = requests.post(settings.OLLAMA_API_URL + "/api/generate", json=payload, timeout=30)
            response.raise_for_status()

            return response.json().get("response", "").strip()

        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling local model: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch response from local model")
