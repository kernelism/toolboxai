import React from 'react';
import { PdfViewer as PdfComponent } from '../subcomponents';

const ControlPanel = ({ file, pageNumber, numPages, setPageNumber, scale, setScale }) => {
    const isFirstPage = pageNumber === 1;
    const isLastPage = pageNumber === numPages;
    
    const goToFirstPage = () => !isFirstPage && setPageNumber(1);
    const goToPreviousPage = () => !isFirstPage && setPageNumber(pageNumber - 1);
    const goToNextPage = () => !isLastPage && setPageNumber(pageNumber + 1);
    const goToLastPage = () => !isLastPage && setPageNumber(numPages);
    
    const onPageChange = (e) => setPageNumber(Number(e.target.value));
    
    const isMinZoom = scale < 0.6;
    const isMaxZoom = scale >= 2.0;
    
    const zoomOut = () => !isMinZoom && setScale(scale - 0.1);
    const zoomIn = () => !isMaxZoom && setScale(scale + 0.1);
    
    return (
      <PdfComponent.ControlPanelContainer>
        {/* <PdfComponent.ControlGroup>
          <PdfComponent.Icon className={`fas fa-fast-backward ${isFirstPage ? 'disabled' : 'clickable'}`} onClick={goToFirstPage} />
          <PdfComponent.Icon className={`fas fa-backward ${isFirstPage ? 'disabled' : 'clickable'}`} onClick={goToPreviousPage} />
          <span>
            Page <PdfComponent.PageInput type="number" min={1} max={numPages || 1} value={pageNumber} onChange={onPageChange} /> of {numPages}
          </span>
          <PdfComponent.Icon className={`fas fa-forward ${isLastPage ? 'disabled' : 'clickable'}`} onClick={goToNextPage} />
          <PdfComponent.Icon className={`fas fa-fast-forward ${isLastPage ? 'disabled' : 'clickable'}`} onClick={goToLastPage} />
        </PdfComponent.ControlGroup> */}
        <PdfComponent.ControlGroup>
          <PdfComponent.Icon className={`fas fa-search-minus ${isMinZoom ? 'disabled' : 'clickable'}`} onClick={zoomOut} />
          <span>{(scale * 100).toFixed()}%</span>
          <PdfComponent.Icon className={`fas fa-search-plus ${isMaxZoom ? 'disabled' : 'clickable'}`} onClick={zoomIn} />
        </PdfComponent.ControlGroup>
        {/* <PDFPrinter file={file} /> */}
      </PdfComponent.ControlPanelContainer>
    );
  };
  
  export default ControlPanel;
  