import {
    Container,
    Sidebar,
    PdfViewer,
    Notes,
    Resizer,
    LeftResizer
} from "./layout";

export default function Layout({children, ...restProps}) {
    return <Container {...restProps}>{children}</Container>;
}

Layout.Sbar = function LayoutSidebar({children, ...restProps}) {
    return <Sidebar {...restProps}>{children}</Sidebar>;
};

Layout.PViewer = function LayoutPdfViewer({children, ...restProps}) {
    return <PdfViewer {...restProps}>{children}</PdfViewer>;
}

Layout.Nbar = function LayoutNotes({children, ...restProps}) {
    return <Notes {...restProps}>{children}</Notes>;
}

Layout.Rsizer = function LayoutResizer({children, ...restProps}) {
    return <Resizer {...restProps}>{children}</Resizer>;
}

Layout.LRsizer = function LayoutLeftResizer({children, ...restProps}) {
    return <LeftResizer {...restProps}>{children}</LeftResizer>;
}
