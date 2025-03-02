import React, { useState } from "react";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import axios from "axios";

const AskEntirePdf = ({pdfText}) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (prompt == "clear"){
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
      }
      console.log(data);
      const response = await axios.post(`${process.env.REACT_APP_API_PATH}/ask`, data);
      const botResponse = { type: "answer", text: response.data.answer };
      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching response", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-100 p-4 rounded-xl shadow-lg">
      <div className="flex-1 overflow-y-auto p-2 space-y-2 border rounded-lg bg-white h-80">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg text-sm ${
              msg.type === "question" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-gray-700"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        {loading && <div className="text-center text-gray-500 animate-pulse">Loading...</div>}
      </div>

      <div className="flex items-center mt-4">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
          placeholder="Ask a question..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
          onClick={handleSubmit}
          disabled={loading}
        >
          <Rocket size={20} />
        </button>
      </div>
    </div>
  );
};

export default AskEntirePdf;
