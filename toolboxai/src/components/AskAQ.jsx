import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Bookmark, Send } from "lucide-react";

export default function TextSelectionPopup({ selectedText, answerText, setAnswerText, onSubmit, position, addNote }) {
  const [showPopup, setShowPopup] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowPopup(!!selectedText);
  }, [selectedText]);

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    onSubmit(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSaveNote = () => {
    addNote({ question: prompt, context: selectedText, answer: answerText });
    setAnswerText("");
    setPrompt(""); 
    setShowPopup(false);
  };

  return (
    <>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bg-white/40 backdrop-blur-lg p-4 rounded-xl shadow-lg z-50 border border-gray-200"
          style={{ top: position.y, left: position.x, maxWidth: "350px" }}
        >
          <div className="flex items-center mb-2">
            <Rocket className="text-amber-500 mr-2" size={20} />
            <h3 className="text-sm font-semibold text-gray-900">Ask a Question 🙂‍↕️</h3>
          </div>

          {answerText ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-sm mb-3"
              >
                <p className="text-sm leading-relaxed">{answerText}</p>
              </motion.div>
              <button
                className="w-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 text-white p-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition duration-200"
                onClick={handleSaveNote}
              >
                <Bookmark size={16} className="mr-2" /> Save Note
              </button>
            </>
          ) : (
            <div>
              <div className="text-sm text-gray-700 mb-2 p-2 bg-gray-50 rounded-lg">
                <p className="italic text-xs">Selected text:</p>
                <p className="line-clamp-3">{selectedText}</p>
              </div>
              <div className="flex items-center mt-2 relative">
                <input
                  type="text"
                  className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/80 text-sm"
                  placeholder="Ask about this selection..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="absolute right-1 p-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition duration-200 disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={loading || !prompt.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
              {loading && (
                <div className="mt-2 p-2 bg-gradient-to-r from-amber-200 to-amber-300 text-gray-700 rounded-lg">
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-700 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-700 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}