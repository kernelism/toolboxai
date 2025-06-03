import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, BookOpen, Send } from "lucide-react";
import axios from "axios";

function Card({ children, onClick }) {
  return (
    <motion.div 
      className="p-4 bg-white rounded-lg shadow-soft cursor-pointer border border-gray-100 hover:border-blue-100 transition-all"
      onClick={onClick}
      whileHover={{ 
        scale: 1.01,
        boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)" 
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}

export default function Notes({ notes, setNotes, doc }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [followUpPrompt, setFollowUpPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doc) {  
      localStorage.setItem(`notes_${doc.id}`, JSON.stringify(notes));
    } else {
      console.log("No doc id found!!");
    }
  }, [notes]);

  const deleteNote = (index) => {
    if (!notes || notes.length === 0) return;
    
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);

    if (doc) {
      localStorage.setItem(`notes_${doc.id}`, JSON.stringify(updatedNotes));
    }
  };

  const handleFollowUp = async (e) => {
    e.stopPropagation();
    if (!followUpPrompt.trim() || !selectedNote) return;

    setLoading(true);
    try {
      const data = {
        prompt: followUpPrompt,
        context: selectedNote.context,
        conversation_id: selectedNote.conversation_id
      };

      const response = await axios.post(`${process.env.REACT_APP_API_PATH}/query`, data);
      
      // Update the note with the new conversation
      const updatedNotes = notes.map(note => {
        if (note === selectedNote) {
          const updatedNote = {
            ...note,
            conversation_id: response.data.conversation_id,
            followUps: [
              ...(note.followUps || []),
              {
                question: followUpPrompt,
                answer: response.data.message
              }
            ]
          };
          // Update the selected note to show the new follow-up immediately
          setSelectedNote(updatedNote);
          return updatedNote;
        }
        return note;
      });

      setNotes(updatedNotes);
      setFollowUpPrompt("");
      setLoading(false);
    } catch (error) {
      console.error("Error sending follow-up:", error);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFollowUp(e);
    }
  };

  return (
    <div className="w-full p-6 bg-gray-50 h-screen overflow-auto relative">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-50 rounded-lg mr-3">
          <BookOpen className="text-blue-600" size={20} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
      </div>

      <AnimatePresence>
        {notes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-gray-500"
          >
            <p>No notes yet. Ask questions to create notes.</p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4 pb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {notes.map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card onClick={() => setSelectedNote(note)}>
                  <div className="flex justify-end">
                    <motion.button 
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(index);
                      }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                  <CardContent>
                    <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md w-full max-h-16 overflow-y-auto mb-3 border border-gray-100">
                      {note.context.length > 100 ? `${note.context.substring(0, 100)}...` : note.context}
                    </div>
                    <p className="text-gray-900 font-medium mb-2">{note.question.length > 60 ? `${note.question.substring(0, 60)}...` : note.question}</p>
                    <div className="text-sm text-gray-700 max-h-16 overflow-y-auto">
                      {note.answer.length > 100 ? `${note.answer.substring(0, 100)}...` : note.answer}
                    </div>
                    {note.followUps && note.followUps.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {note.followUps.length} follow-up question{note.followUps.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNote && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full relative flex flex-col max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="absolute top-4 right-4 bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedNote(null)}
              >
                <X size={16} />
              </motion.button>

              <div className="flex-1 overflow-y-auto pr-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Note Details</h3>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg overflow-y-auto max-h-40 border border-gray-100">
                    {selectedNote.context}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Question</h4>
                  <div className="text-gray-900 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    {selectedNote.question}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Answer</h4>
                  <div className="text-gray-800 p-3 bg-gray-50 rounded-lg border border-gray-100 max-h-60 overflow-y-auto">
                    {selectedNote.answer}
                  </div>
                </div>

                {selectedNote.followUps && selectedNote.followUps.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Follow-up Questions</h4>
                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2">
                      {selectedNote.followUps.map((followUp, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg border border-gray-100 p-3">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {followUp.question}
                          </div>
                          <div className="text-sm text-gray-700">
                            {followUp.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ask a follow-up question..."
                    value={followUpPrompt}
                    onChange={(e) => setFollowUpPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    onClick={handleFollowUp}
                    disabled={loading || !followUpPrompt.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}