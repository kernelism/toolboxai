import React, { useState } from "react";
import { Rocket, Send } from "lucide-react";
import axios from "axios";

const AskEntirePdf = ({ pdfText }) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (prompt === "clear") {
      setMessages([]);
      setPrompt("");
      return;
    }
    
    if (!prompt.trim()) return;
    
    if (!pdfText) {
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
        "prompt": prompt,
        "selectedText": pdfText,
      };
      
      console.log(data);
      const response = await axios.post(`${process.env.REACT_APP_API_PATH}/ask`, data);
      const botResponse = { type: "answer", text: response.data.answer };
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
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center mb-4">
        <Rocket className="text-amber-500 mr-2" size={24} />
        <h2 className="text-lg font-semibold text-gray-900">PDF Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 border rounded-lg bg-white shadow-inner h-80 backdrop-blur-sm bg-opacity-70">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 italic mt-32">
            Ask anything about your PDF...
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.type === "question" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`p-3 px-4 rounded-2xl max-w-3/4 shadow-sm
                ${msg.type === "question" 
                  ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white" 
                  : msg.type === "error"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                    : "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
                }
              `}
            >
              <div className="text-sm leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-amber-200 to-amber-300 text-gray-700 p-3 px-4 rounded-2xl shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-700 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center mt-4 relative">
        <input 
          type="text" 
          className="flex-1 p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm bg-white"
          placeholder="Ask a question about your PDF..." 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="absolute right-1 p-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md transition duration-200 ease-in-out disabled:opacity-50"
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