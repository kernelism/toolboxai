import React, { useState, useEffect } from "react";
import { Rocket, Send, Trash2, Bot, User } from "lucide-react";
import axios from "axios";

const AskEntirePdf = ({selectedPdf}) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // Load conversation history from localStorage when component mounts or PDF changes
  useEffect(() => {
    if (selectedPdf) {
      console.log("selectedPdf", selectedPdf);
      const savedConversation = localStorage.getItem(`conversation_${selectedPdf.id}`);
      if (savedConversation) {
        const { conversationId, messages } = JSON.parse(savedConversation);
        setConversationId(conversationId);
        setMessages(messages);
      } else {
        // Reset state when switching to a new PDF
        setConversationId(null);
        setMessages([]);
      }
    }
  }, [selectedPdf]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (selectedPdf && messages.length > 0) {
      localStorage.setItem(`conversation_${selectedPdf.id}`, JSON.stringify({
        conversationId,
        messages
      }));
    }
  }, [messages, conversationId, selectedPdf]);

  const clearConversation = async () => {
    if (conversationId) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_PATH}/conversations/${conversationId}`);
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    }
    setMessages([]);
    setConversationId(null);
    if (selectedPdf) {
      localStorage.removeItem(`conversation_${selectedPdf.id}`);
    }
  };

  const handleSubmit = async () => {
    if (prompt === "clear") {
      clearConversation();
      setPrompt("");
      return;
    }
    
    if (!prompt.trim()) return;
    
    if (!selectedPdf) {
      alert("Select a pdf to continue");
      console.error("PDF text not found");
      return;
    }
    
    setLoading(true);
    const userMessage = { type: "question", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    
    try {
      const data = {
        prompt: prompt,
        title: selectedPdf.title,
        conversation_id: conversationId
      };
      
      console.log(data);
      const response = await axios.post(`${process.env.REACT_APP_API_PATH}/ask`, data);
      console.log(response);
      
      // Update conversation ID if this is a new conversation
      if (!conversationId) {
        setConversationId(response.data.conversation_id);
      }
      
      // Add the assistant's response
      const botResponse = { type: "answer", text: response.data.message };
      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching response", error);
      setLoading(false);
      setMessages((prev) => [...prev, { 
        type: "error", 
        text: "Sorry, something went wrong. Please try again." 
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Rocket className="text-blue-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">PDF Assistant</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearConversation}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-3 bg-blue-50 rounded-full mb-4">
              <Bot className="text-blue-600" size={24} />
            </div>
            <p className="text-gray-500 font-medium">Ask anything about your PDF</p>
            <p className="text-gray-400 text-sm mt-1">I'll help you understand the content better</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.type === "question" ? "justify-end" : "justify-start"} group`}
          >
            <div className="flex items-start space-x-2 max-w-[85%]">
              {msg.type !== "question" && (
                <div className="p-2 bg-blue-50 rounded-lg mt-1">
                  <Bot className="text-blue-600" size={16} />
                </div>
              )}
              <div 
                className={`p-3 rounded-2xl shadow-sm
                  ${msg.type === "question" 
                    ? "bg-blue-600 text-white" 
                    : msg.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-white text-gray-800 border border-gray-100"
                  }
                `}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
              </div>
              {msg.type === "question" && (
                <div className="p-2 bg-blue-50 rounded-lg mt-1">
                  <User className="text-blue-600" size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bot className="text-blue-600" size={16} />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 relative">
        <input 
          type="text" 
          className="w-full p-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white transition-all"
          placeholder={conversationId ? "Ask a follow-up question..." : "Ask a question about your PDF..."} 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={loading || !prompt.trim()} 
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AskEntirePdf;