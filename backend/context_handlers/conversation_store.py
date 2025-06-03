from typing import List, Dict, Optional
from datetime import datetime
import uuid
from models import ConversationMessage

class ConversationStore:
    def __init__(self):
        # In-memory store for conversations
        # In production, this should be replaced with a proper database
        self.conversations: Dict[str, List[ConversationMessage]] = {}
    
    def create_conversation(self) -> str:
        """Create a new conversation and return its ID"""
        conversation_id = str(uuid.uuid4())
        self.conversations[conversation_id] = []
        return conversation_id
    
    def add_message(self, conversation_id: str, message: ConversationMessage) -> None:
        """Add a message to a conversation"""
        if conversation_id not in self.conversations:
            raise ValueError(f"Conversation {conversation_id} does not exist")
        self.conversations[conversation_id].append(message)
    
    def get_conversation_history(self, conversation_id: str) -> List[ConversationMessage]:
        """Get the history of a conversation"""
        if conversation_id not in self.conversations:
            raise ValueError(f"Conversation {conversation_id} does not exist")
        return self.conversations[conversation_id]
    
    def get_last_n_messages(self, conversation_id: str, n: int = 5) -> List[ConversationMessage]:
        """Get the last n messages from a conversation"""
        if conversation_id not in self.conversations:
            raise ValueError(f"Conversation {conversation_id} does not exist")
        return self.conversations[conversation_id][-n:]
    
    def delete_conversation(self, conversation_id: str) -> None:
        """Delete a conversation"""
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]

# Global instance
conversation_store = ConversationStore() 