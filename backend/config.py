import os
from typing import Dict, List
import tomli
from pydantic_settings import BaseSettings
from pydantic import PrivateAttr
from pathlib import Path
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class ModelConfig(BaseSettings):
    name: str
    weight: int

class Settings(BaseSettings):
    # Core settings
    DOCUMENTS_DIR: str = "./data/documents"
    
    # API Keys
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    
    # Ollama settings (only needed if using Ollama)
    OLLAMA_API_URL: str | None = None
    
    # Model configuration
    MODEL_CONFIG_PATH: str = "models.toml"
    
    # Private attribute for model config
    _model_config: Dict = PrivateAttr(default_factory=dict)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._model_config = self._load_model_config()
        self._validate_configuration()
    
    def _validate_configuration(self):
        """Validate the entire configuration setup"""
        # Check API keys
        if not self.OPENAI_API_KEY and not self.ANTHROPIC_API_KEY and not self.OLLAMA_API_URL:
            logger.warning("No API keys configured for any provider")
        
        # Log available providers
        available = self.available_providers
        if not available:
            logger.error("No providers are available. Please configure at least one provider with valid API keys.")
        else:
            logger.info(f"Available providers: {', '.join(available)}")
            logger.info(f"Default provider: {self.default_provider}")
            logger.info(f"Fallback provider: {self.fallback_provider}")
    
    def _load_model_config(self) -> Dict:
        try:
            # Get the directory of the current file
            current_dir = Path(__file__).parent
            config_path = current_dir / self.MODEL_CONFIG_PATH
            
            logger.info(f"Loading model config from: {config_path}")
            
            if not config_path.exists():
                raise FileNotFoundError(f"Model config file not found at {config_path}")
                
            with open(config_path, "rb") as f:
                config = tomli.load(f)
                
            if "models" not in config:
                raise ValueError("Model config file must contain a 'models' section")
            
            # Validate each provider's configuration
            for provider, models in config.get("models", {}).items():
                if not models:
                    logger.warning(f"No models configured for provider: {provider}")
                else:
                    logger.info(f"Found {len(models)} models for provider {provider}")
                    for model in models:
                        if "name" not in model or "weight" not in model:
                            raise ValueError(f"Invalid model configuration for {provider}: each model must have 'name' and 'weight'")
            
            # Validate routing configuration
            routing = config.get("routing", {})
            if "default_provider" not in routing:
                logger.warning("No default provider specified in routing config")
            if "fallback_provider" not in routing:
                logger.warning("No fallback provider specified in routing config")
                
            return config
        except Exception as e:
            logger.error(f"Failed to load model configuration: {str(e)}")
            if isinstance(e, FileNotFoundError):
                logger.error("Please ensure the models.toml file exists in the backend directory")
            elif isinstance(e, ValueError):
                logger.error("Please check the format of your models.toml file")
            raise ValueError(f"Failed to load model configuration: {str(e)}")
    
    @property
    def available_providers(self) -> List[str]:
        """Get list of providers that are both configured in TOML and have API keys set"""
        configured_providers = list(self._model_config.get("models", {}).keys())
        available_providers = []
        
        for provider in configured_providers:
            if provider == "openai" and self.OPENAI_API_KEY:
                available_providers.append(provider)
                logger.debug(f"OpenAI provider available with API key")
            elif provider == "anthropic" and self.ANTHROPIC_API_KEY:
                available_providers.append(provider)
                logger.debug(f"Anthropic provider available with API key")
            elif provider == "ollama" and self.OLLAMA_API_URL:
                available_providers.append(provider)
                logger.debug(f"Ollama provider available with API URL")
            else:
                logger.debug(f"Provider {provider} configured but not available (missing API key/URL)")
        
        return available_providers
    
    @property
    def default_provider(self) -> str:
        """Get default provider from config, fallback to first available provider"""
        configured_default = self._model_config.get("routing", {}).get("default_provider")
        available = self.available_providers
        
        if configured_default in available:
            return configured_default
        elif available:
            logger.warning(f"Configured default provider '{configured_default}' not available, using '{available[0]}'")
            return available[0]
        else:
            raise ValueError("No available providers configured. Please set up at least one provider.")
    
    @property
    def fallback_provider(self) -> str:
        """Get fallback provider from config, fallback to first available provider that's not the default"""
        configured_fallback = self._model_config.get("routing", {}).get("fallback_provider")
        available = self.available_providers
        default = self.default_provider
        
        if configured_fallback in available and configured_fallback != default:
            return configured_fallback
        elif len(available) > 1:
            # Return first available provider that's not the default
            fallback = next(p for p in available if p != default)
            logger.warning(f"Configured fallback provider '{configured_fallback}' not available, using '{fallback}'")
            return fallback
        else:
            logger.warning(f"Only one provider available, using '{default}' as both default and fallback")
            return default  # If only one provider is available, use it as fallback too

    class Config:
        env_file = f'.env'
        extra = "ignore"

settings = Settings()