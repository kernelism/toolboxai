import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, BookOpen } from "lucide-react";

function Card({ children, onClick }) {
  return (
    <motion.div 
      className="p-4 bg-white rounded-lg shadow-md cursor-pointer border border-gray-200"
      onClick={onClick}
      whileHover={{ 
        scale: 1.01,
        boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)" 
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

  return (
    <div className="w-full p-6 bg-gray-50 h-screen overflow-auto relative">
      <div className="flex items-center mb-6">
        <BookOpen className="text-amber-500 mr-2" size={24} />
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
                      className="text-gray-400 hover:text-red-500 p-1 rounded"
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
                    <div className="text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-md w-full max-h-16 overflow-y-auto mb-3">
                      {note.context.length > 100 ? `${note.context.substring(0, 100)}...` : note.context}
                    </div>
                    <p className="text-gray-900 font-medium mb-2">{note.question.length > 60 ? `${note.question.substring(0, 60)}...` : note.question}</p>
                    <div className="text-sm text-gray-700 max-h-16 overflow-y-auto">
                      {note.answer.length > 100 ? `${note.answer.substring(0, 100)}...` : note.answer}
                    </div>
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
              className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="absolute top-4 right-4 bg-gray-200 text-gray-800 p-2 rounded-full"
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedNote(null)}
              >
                <X size={16} />
              </motion.button>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Note Details</h3>
              
              <div className="mb-4">
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md overflow-y-auto max-h-40 border border-gray-200">
                  {selectedNote.context}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Question</h4>
                <div className="text-gray-900 p-3 bg-amber-50 rounded-md border-l-4 border-amber-500">
                  {selectedNote.question}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Answer</h4>
                <div className="text-gray-800 p-3 bg-gray-50 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                  {selectedNote.answer}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}