import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Card({ children, onClick }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-105" onClick={onClick}>
      {children}
    </div>
  );
}

function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}

export default function Notes({ notes }) {
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    console.log("Notes updated:", notes);
  }, [notes]);

  return (
    <div className="w-full p-4 bg-gray-100 h-screen overflow-auto relative">
      <h2 className="text-lg font-semibold mb-4">Notes</h2>
      <div className="space-y-4 pb-16">
        {notes.map((note, index) => (
          <Card key={index} onClick={() => setSelectedNote(note)}>
            <CardContent>
              <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-md w-full max-h-24 overflow-y-auto">
                {note.context}
              </div>
              <p className="text-blue-600 font-semibold mt-2">Q: {note.question}</p>
              <div className="text-sm text-gray-900 mt-1 max-h-24 overflow-y-auto">
                A: {note.answer}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {selectedNote && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"
                onClick={() => setSelectedNote(null)}
              >
                ✕
              </button>
              <h3 className="text-lg font-semibold mb-2">Context</h3>
              <div className="text-xs text-gray-700 bg-gray-200 p-2 rounded-md overflow-y-auto max-h-40">
                {selectedNote.context}
              </div>
              <h3 className="text-lg font-semibold mt-4">Q: {selectedNote.question}</h3>
              <h3 className="text-sm text-gray-900 mt-2">{selectedNote.answer}</h3>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
