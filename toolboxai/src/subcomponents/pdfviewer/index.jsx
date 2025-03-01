import {
    Container, 
    PdfSection,
    ControlPanelContainer,
    ControlGroup,
    Icon,
    PageInput,
    LoaderContainer,
    Loader,
    LoaderText
} from "./pdfviewer";

export default function PdfViewer({children, ...restProps}) {
    return (
        <Container {...restProps}>{children}</Container>
    )
}

PdfViewer.PdfSection = function PdfViewerPdfSection({children, ...restProps}) {
    return <PdfSection {...restProps}>{children}</PdfSection>
}

PdfViewer.ControlPanelContainer = function PdfViewerControlPanelContainer({children, ...restProps}) {
    return <ControlPanelContainer {...restProps}>{children}</ControlPanelContainer>
}

PdfViewer.ControlGroup = function PdfViewerControlGroup({children, ...restProps}) {
    return <ControlGroup {...restProps}>{children}</ControlGroup>
}

PdfViewer.Icon = function PdfViewerIcon({children, ...restProps}) {
    return <Icon {...restProps}>{children}</Icon>
}

PdfViewer.PageInput = function PdfViewerPageInput({children, ...restProps}) {
    return <PageInput {...restProps}>{children}</PageInput>
}

PdfViewer.LoaderContainer = function PdfViewerLoaderContainer({children, ...restProps}) {
    return <LoaderContainer {...restProps}>{children}</LoaderContainer>
}

PdfViewer.Loader = function PdfViewerLoader({children, ...restProps}) {
    return <Loader {...restProps}>{children}</Loader>
}

PdfViewer.LoaderText = function PdfViewerLoaderText({children, ...restProps}) {
    return <LoaderText {...restProps}>{children}</LoaderText>
}
