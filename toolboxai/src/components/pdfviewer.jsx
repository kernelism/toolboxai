import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { Document, Page, pdfjs } from "react-pdf";
import { PdfViewer as PdfComponent } from "../subcomponents";
import ControlPanel from "./ControlPanel";
import TextSelectionPopup from "./AskAQ";
import OutsideAlerter from "./OutsideAlerter"; // Import the outside click handler
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import axios from "axios";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ pdf, addNote }) => {
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(pdf ? true : false);
  const [pdfData, setPdfData] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [llmAnswer, setLlmAnswer] = useState("");

  useEffect(() => {
    if (!pdf) return;

    const fetchPdf = async (docId) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8080/documents/${docId}`
        );

        if (!response.ok)
          throw new Error(`Failed to load PDF: ${response.statusText}`);

        const pdfBlob = await response.blob();
        const pdfUrl = URL.createObjectURL(pdfBlob);
        console.log("PDF Data Loaded:", pdfUrl);
        setPdfData(pdfUrl);
      } catch (error) {
        console.error("Error fetching PDF:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf(pdf.id);
  }, [pdf]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoading(false);
  }

  const handleMouseUp = (event) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText) {
      const { clientX, clientY } = event;
      setPopupPosition({ x: clientX, y: clientY });
      setSelectedText(selectedText);
    }
  };

  const handlePromptSubmit = async (prompt) => {
    const response = await axios.post(`${process.env.REACT_APP_API_PATH}/ask`, {
      prompt,
      selectedText,
    });

    console.log("API Response:", response.data);
    setLlmAnswer(response.data.answer);
  }

  return (
    pdf && (
      <PdfComponent>
        <Loader isLoading={isLoading} />
        <PdfComponent.PdfSection onMouseUp={handleMouseUp}>
          <ControlPanel
            scale={scale}
            setScale={setScale}
            numPages={numPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            file={{ url: pdf }}
          />
          <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </PdfComponent.PdfSection>

        {/* Wrap Popup with OutsideAlerter to close it when clicking outside */}
        {selectedText && (
          <OutsideAlerter onOutsideClick={() => setSelectedText("")}>
            <TextSelectionPopup
              selectedText={selectedText}
              setAnswerText={setLlmAnswer}
              answerText={llmAnswer}
              onSubmit={handlePromptSubmit}
              position={popupPosition}
              addNote={addNote}
            />
          </OutsideAlerter>
        )}
      </PdfComponent>
    )
  );
};

export default PdfViewer;
