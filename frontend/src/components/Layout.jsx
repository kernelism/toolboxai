import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import PdfViewer from "./PdfViewer";
import Notes from "./Notes";
import { Layout as LayoutSub } from "../subcomponents";
import AskEntirePdf from "./AskEntirePdf";

const Layout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(20);
  const [notesWidth, setNotesWidth] = useState(20);
  const [notesHeight, setNotesHeight] = useState(60);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (selectedPdf) {
      console.log(`Loading PDF: ${selectedPdf.path}, ${selectedPdf.id}`);
      console.log(localStorage.getItem(`notes_${selectedPdf.id}`));
      const storedNotes =
        JSON.parse(localStorage.getItem(`notes_${selectedPdf.id}`)) || [];
      console.log(storedNotes); 
      setNotes(storedNotes);
    }
  }, [selectedPdf]);

  const handleDragLeft = (event, setWidth) => {
    event.preventDefault();
    document.onmousemove = (e) => {
      setWidth(
        Math.max(10, Math.min(40, (e.clientX / window.innerWidth) * 100))
      );
    };
    document.onmouseup = () =>
      (document.onmousemove = document.onmouseup = null);
  };

  const handleDragRight = (event, setWidth) => {
    event.preventDefault();
    document.onmousemove = (e) => {
      setWidth(
        Math.max(10, Math.min(40, 100 - (e.clientX / window.innerWidth) * 100))
      );
    };
    document.onmouseup = () =>
      (document.onmousemove = document.onmouseup = null);
  };

  const handleDragVertical = (event) => {
    event.preventDefault();
    document.onmousemove = (e) => {
      setNotesHeight(
        Math.max(30, Math.min(80, (e.clientY / window.innerHeight) * 100))
      );
    };
    document.onmouseup = () =>
      (document.onmousemove = document.onmouseup = null);
  };

  const addNote = (note) => {
    if (!selectedPdf) return;

    const storedNotes =
      JSON.parse(localStorage.getItem(`notes_${selectedPdf.id}`)) || [];
    const updatedNotes = [...storedNotes, note];

    localStorage.setItem(
      `notes_${selectedPdf.id}`,
      JSON.stringify(updatedNotes)
    );
    setNotes(updatedNotes);
  };

  return (
    <LayoutSub className="bg-gray-50">
      <LayoutSub.Sbar 
        style={{ width: `${sidebarWidth}%` }}
        className="bg-white border-r border-gray-100 shadow-sm"
      >
        <Sidebar setSelectedPdf={setSelectedPdf} />
        <LayoutSub.Rsizer
          onMouseDown={(e) => handleDragLeft(e, setSidebarWidth)}
          className="bg-gray-100 hover:bg-blue-500 transition-colors"
        />
      </LayoutSub.Sbar>

      <LayoutSub.PViewer
        style={{ width: `${100 - sidebarWidth - notesWidth}%` }}
        className="bg-white"
      >
        <PdfViewer pdf={selectedPdf} addNote={addNote}/>
      </LayoutSub.PViewer>

      <LayoutSub.Nbar 
        style={{ width: `${notesWidth}%` }}
        className="bg-white border-l border-gray-100 shadow-sm"
      >
        <LayoutSub.LRsizer
          onMouseDown={(e) => handleDragRight(e, setNotesWidth)}
          className="bg-gray-100 hover:bg-blue-500 transition-colors"
        />
        <LayoutSub.TopSection 
          style={{ height: `${notesHeight}%` }}
          className="border-b border-gray-100"
        >
          <Notes notes={notes} setNotes={setNotes} doc={selectedPdf}/>
        </LayoutSub.TopSection>

        <LayoutSub.VResizer 
          onMouseDown={(e) => handleDragVertical(e)}
          className="bg-gray-100 hover:bg-blue-500 transition-colors"
        />

        <LayoutSub.BottomSection 
          style={{ height: `${100 - notesHeight}%` }}
          className="bg-gray-50"
        >
          <AskEntirePdf selectedPdf={selectedPdf}/>
        </LayoutSub.BottomSection>
      </LayoutSub.Nbar>
    </LayoutSub>
  );
};

export default Layout;
