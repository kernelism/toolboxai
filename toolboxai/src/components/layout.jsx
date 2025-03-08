import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import PdfViewer from "./PdfViewer";
import Notes from "./notes";
import { Layout as LayoutSub } from "../subcomponents";
import AskEntirePdf from "./AskEntirePdf";

const Layout = () => {
  const [sidebarWidth, setSidebarWidth] = useState(20);
  const [notesWidth, setNotesWidth] = useState(20);
  const [notesHeight, setNotesHeight] = useState(60);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [notes, setNotes] = useState([]);
  const [fullPdfText, setFullPdfText] = useState("");

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
    <LayoutSub>
      <LayoutSub.Sbar style={{ width: `${sidebarWidth}%` }}>
        <Sidebar setSelectedPdf={setSelectedPdf} />
        <LayoutSub.Rsizer
          onMouseDown={(e) => handleDragLeft(e, setSidebarWidth)}
        />
      </LayoutSub.Sbar>

      <LayoutSub.PViewer
        style={{ width: `${100 - sidebarWidth - notesWidth}%` }}
      >
        <PdfViewer pdf={selectedPdf} addNote={addNote} setFullPdfText={setFullPdfText}/>
      </LayoutSub.PViewer>

      <LayoutSub.Nbar style={{ width: `${notesWidth}%` }}>
        <LayoutSub.LRsizer
          onMouseDown={(e) => handleDragRight(e, setNotesWidth)}
        />
        <LayoutSub.TopSection style={{ height: `${notesHeight}%` }}>
          <Notes notes={notes} setNotes={setNotes} doc={selectedPdf}/>
        </LayoutSub.TopSection>

        <LayoutSub.VResizer onMouseDown={(e) => handleDragVertical(e)} />

        <LayoutSub.BottomSection style={{ height: `${100 - notesHeight}%` }}>
          <AskEntirePdf pdfText={fullPdfText}/>
        </LayoutSub.BottomSection>
      </LayoutSub.Nbar>
    </LayoutSub>
  );
};

export default Layout;
