import React from 'react';
import { PdfViewer as PdfComponent } from '../subcomponents';

const ControlPanel = ({scale, setScale }) => {
    const isMinZoom = scale < 0.6;
    const isMaxZoom = scale >= 2.0;
    
    const zoomOut = () => !isMinZoom && setScale(scale - 0.1);
    const zoomIn = () => !isMaxZoom && setScale(scale + 0.1);
    
    return (
      <PdfComponent.ControlPanelContainer>
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
  