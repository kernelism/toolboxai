from openai import OpenAI
import random
import requests
from fastapi import HTTPException
from config import settings
from models import AskRequest, ConversationMessage, MessageRole
import anthropic
import logging
from . import utils
from .conversation_store import conversation_store
from typing import List

# Configure logging
logger = logging.getLogger(__name__)

class ModelRouter:
    def __init__(self):
        self.model_config = settings._model_config
        print(f"Model config: {self.model_config}")
        # Initialize stats only for available providers
        self.provider_stats = {provider: {"success": 0, "failure": 0} 
                             for provider in settings.available_providers}
        logger.info(f"Initialized ModelRouter with providers: {', '.join(self.provider_stats.keys())}")
    
    def get_next_model(self, provider: str) -> str:
        """Get next model based on weights and provider stats"""
        if provider not in settings.available_providers:
            logger.error(f"Attempted to use unavailable provider: {provider}")
            raise HTTPException(
                status_code=500, 
                detail=f"Provider {provider} is not available. Available providers: {', '.join(settings.available_providers)}"
            )
            
        logger.info(f"Model config: {self.model_config}")
        models = self.model_config["models"].get(provider, [])
        if not models:
            logger.error(f"No models configured for provider: {provider}")
            raise HTTPException(
                status_code=500, 
                detail=f"No models configured for provider {provider}"
            )
        
        # Calculate total weight considering success/failure ratio
        total_weight = 0
        weighted_models = []
        
        for model in models:
            success_rate = self.provider_stats[provider]["success"] / max(1, self.provider_stats[provider]["success"] + self.provider_stats[provider]["failure"])
            adjusted_weight = model["weight"] * (1 + success_rate)
            total_weight += adjusted_weight
            weighted_models.append((model["name"], adjusted_weight))
        
        # Select model based on weights
        r = random.uniform(0, total_weight)
        current_weight = 0
        for model_name, weight in weighted_models:
            current_weight += weight
            if r <= current_weight:
                logger.debug(f"Selected model {model_name} for provider {provider} (weight: {weight})")
                return model_name
        
        selected_model = weighted_models[0][0]
        logger.debug(f"Fallback to first model {selected_model} for provider {provider}")
        return selected_model
    
    def record_success(self, provider: str):
        if provider in self.provider_stats:
            self.provider_stats[provider]["success"] += 1
            logger.debug(f"Recorded success for provider {provider}. Stats: {self.provider_stats[provider]}")
    
    def record_failure(self, provider: str):
        if provider in self.provider_stats:
            self.provider_stats[provider]["failure"] += 1
            logger.debug(f"Recorded failure for provider {provider}. Stats: {self.provider_stats[provider]}")

class LLMHandler:
    def __init__(self):
        self.router = ModelRouter()
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        logger.info("Initialized LLMHandler")
    
    def send_llm_request(self, request: AskRequest):
        """
        Routes the request to the appropriate LLM backend with load balancing.
        Handles conversation context if provided.
        """
        # Handle conversation context
        conversation_id = request.conversation_id
        if not conversation_id:
            conversation_id = conversation_store.create_conversation()
        
        # Add user message to conversation
        user_message = ConversationMessage(
            role=MessageRole.USER,
            content=request.prompt
        )
        conversation_store.add_message(conversation_id, user_message)
        
        # Get conversation history for context
        history = conversation_store.get_last_n_messages(conversation_id, n=5)
        
        if not settings.available_providers:
            logger.error("No LLM providers are available")
            raise HTTPException(
                status_code=500, 
                detail="No LLM providers are available. Please configure at least one provider with valid API keys."
            )
            
        # Try default provider first
        try:
            provider = settings.default_provider
            logger.info(f"Attempting request with default provider: {provider}")
            model = self.router.get_next_model(provider)
            response = self._send_request_to_provider(provider, model, request, history)
            
            # Add assistant response to conversation
            assistant_message = ConversationMessage(
                role=MessageRole.ASSISTANT,
                content=response
            )
            conversation_store.add_message(conversation_id, assistant_message)
            
            self.router.record_success(provider)
            return {
                "conversation_id": conversation_id,
                "message": response,
                "history": conversation_store.get_conversation_history(conversation_id)
            }
        except Exception as e:
            logger.error(f"Error with default provider {provider}: {str(e)}")
            self.router.record_failure(provider)

            # Try fallback provider if it's different from default
            if settings.fallback_provider != provider:
                try:
                    provider = settings.fallback_provider
                    logger.info(f"Attempting request with fallback provider: {provider}")
                    model = self.router.get_next_model(provider)
                    response = self._send_request_to_provider(provider, model, request, history)
                    
                    # Add assistant response to conversation
                    assistant_message = ConversationMessage(
                        role=MessageRole.ASSISTANT,
                        content=response
                    )
                    conversation_store.add_message(conversation_id, assistant_message)
                    
                    self.router.record_success(provider)
                    return {
                        "conversation_id": conversation_id,
                        "message": response,
                        "history": conversation_store.get_conversation_history(conversation_id)
                    }
                except Exception as e:
                    logger.error(f"Error with fallback provider {provider}: {str(e)}")
                    self.router.record_failure(provider)
            
            raise HTTPException(
                status_code=500, 
                detail=f"All available providers failed to process the request. Last error: {str(e)}"
            )
    
    def _send_request_to_provider(self, provider: str, model: str, request: AskRequest, history: List[ConversationMessage]) -> str:
        """Send request to specific provider with conversation history"""
        logger.info(f"Sending request to {provider} using model {model}")
        if provider == "openai":
            return self._send_openai_request(model, request, history)
        elif provider == "anthropic":
            return self._send_anthropic_request(model, request, history)
        elif provider == "ollama":
            return self._send_ollama_request(model, request, history)
        else:
            logger.error(f"Unsupported provider: {provider}")
            raise HTTPException(
                status_code=500, 
                detail=f"Unsupported provider: {provider}. Available providers: {', '.join(settings.available_providers)}"
            )
    
    def _send_openai_request(self, model: str, request: AskRequest, history: List[ConversationMessage]) -> str:
        """Send request to OpenAI with conversation history"""
        if not self.openai_client:
            logger.error("OpenAI client not initialized - missing API key")
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key is missing. Please set OPENAI_API_KEY in your environment."
            )
        
        try:
            logger.debug(f"Sending request to OpenAI model {model}")
            
            # Build messages array with history
            messages = [
                {"role": "system", "content": "You are a helpful AI assistant."}
            ]
            
            # Add conversation history
            for msg in history:
                messages.append({
                    "role": msg.role.value,
                    "content": msg.content
                })
            
            # Add current context and query
            messages.append({
                "role": "user",
                "content": utils.research_q_prompt_builder(request)
            })
            
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error calling OpenAI: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to fetch response from OpenAI: {str(e)}"
            )
    
    def _send_anthropic_request(self, model: str, request: AskRequest, history: List[ConversationMessage]) -> str:
        """Send request to Anthropic with conversation history"""
        if not self.anthropic_client:
            logger.error("Anthropic client not initialized - missing API key")
            raise HTTPException(
                status_code=500, 
                detail="Anthropic API key is missing. Please set ANTHROPIC_API_KEY in your environment."
            )
        
        try:
            logger.debug(f"Sending request to Anthropic model {model}")
            
            # Build messages array with history
            messages = []
            
            # Add conversation history
            for msg in history:
                messages.append({
                    "role": msg.role.value,
                    "content": msg.content
                })
            
            # Add current context and query
            messages.append({
                "role": "user",
                "content": utils.research_q_prompt_builder(request)
            })
            
            response = self.anthropic_client.messages.create(
                model=model,
                max_tokens=300,
                messages=messages
            )
            return response.content[0].text.strip()
        except Exception as e:
            logger.error(f"Error calling Anthropic: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to fetch response from Anthropic: {str(e)}"
            )
    
    def _send_ollama_request(self, model: str, request: AskRequest, history: List[ConversationMessage]) -> str:
        """Send request to Ollama with conversation history"""
        if not settings.OLLAMA_API_URL:
            logger.error("Ollama API URL not configured")
            raise HTTPException(
                status_code=500, 
                detail="Ollama API URL is missing. Please set OLLAMA_API_URL in your environment."
            )
        
        try:
            # Build messages array with history
            messages = []
            
            # Add conversation history
            for msg in history:
                messages.append({
                    "role": msg.role.value,
                    "content": msg.content
                })
            
            # Add current context and query
            messages.append({
                "role": "user",
                "content": utils.research_q_prompt_builder(request)
            })
            
            response = requests.post(
                f"{settings.OLLAMA_API_URL}/api/chat",
                json={
                    "model": model,
                    "messages": messages,
                    "stream": False
                }
            )
            response.raise_for_status()
            return response.json()["message"]["content"].strip()
        except Exception as e:
            logger.error(f"Error calling Ollama: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch response from Ollama: {str(e)}"
            )
    
    def convert_model_data(self, prompt: str, model_data: dict) -> AskRequest:
        """
        converts PageTitles to AskRequest
        """
        all_data = ""
        for page in model_data:
            for title in page.get("titles", []):
                all_data += f"{title}\n"
        all_data += f"\n\n{model_data.get('page_text', '')}"

        token_length = len(all_data.split())
        logger.info(f"Token length of all_data: {token_length}")
        if token_length > 4096:
            logger.warning(f"Token length of all_data is greater than 4096: {token_length}")
        
        return AskRequest(
            prompt=prompt,
            context=all_data,
        )
