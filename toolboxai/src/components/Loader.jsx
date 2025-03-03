import React from 'react';
import { PdfViewer as PdfComponent } from '../subcomponents';

const Loader = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <PdfComponent.LoaderOverlay>
      <div style={{ textAlign: "center" }}>
        <PdfComponent.LoaderSpinner />
        <PdfComponent.LoaderText>Loading...</PdfComponent.LoaderText>
      </div>
    </PdfComponent.LoaderOverlay>
  );
};

export default Loader;
