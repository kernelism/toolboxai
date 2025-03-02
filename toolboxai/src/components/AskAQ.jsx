import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rocket, Bookmark } from "lucide-react";

export default function TextSelectionPopup({ selectedText, answerText, setAnswerText, onSubmit, position, addNote }) {
  const [showPopup, setShowPopup] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowPopup(!!selectedText);
  }, [selectedText]);

  const handleSubmit = () => {
    setLoading(true);
    onSubmit(prompt);
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
          className="absolute bg-white/40 backdrop-blur-lg p-4 rounded-2xl shadow-lg z-50"
          style={{ top: position.y, left: position.x }}
        >
          {answerText ? (
            <>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-700"
              >
                {answerText}
              </motion.p>
              <button
                className="mt-2 w-full flex items-center justify-center bg-green-500 text-white p-2 rounded-xl hover:bg-green-600"
                onClick={handleSaveNote}
              >
                <Bookmark size={20} className="mr-2" /> Save Note
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">Ask a question?</p>
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  className="w-48 p-2 border rounded-l-xl focus:outline-none bg-white/60"
                  placeholder="Type your question..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <button
                  className="bg-blue-500 text-white p-2 rounded-r-xl hover:bg-blue-600"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <Rocket size={20} />
                </button>
              </div>
              {loading && <div className="mt-2 text-center text-gray-500 animate-pulse">Loading...</div>}
            </>
          )}
        </motion.div>
      )}
    </>
  );
}
