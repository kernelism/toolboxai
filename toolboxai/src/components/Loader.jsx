import React from 'react';
import { PdfViewer as PdfComponent } from '../subcomponents';
import LoaderLogo from "../assets/loader.png";

const Loader = ({isLoading}) => {
  if(!isLoading) return null;
  return (
    <PdfComponent.LoaderContainer>
      <PdfComponent.Loader src={LoaderLogo}/>
      <PdfComponent.LoaderText>Loading...</PdfComponent.LoaderText>
    </PdfComponent.LoaderContainer>
  )
}

export default Loader
