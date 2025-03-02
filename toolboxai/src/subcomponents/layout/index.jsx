import {
    Container,
    Sidebar,
    PdfViewer,
    Notes,
    Resizer,
    LeftResizer,
    VerticalResizer,
    TopSection,
    BottomSection
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
Layout.VResizer = function LayoutVerticalResizer({children, ...restProps}) {
    return <VerticalResizer {...restProps}>{children}</VerticalResizer>;
};

Layout.TopSection = function LayoutTopSection({children, ...restProps}) {
    return <TopSection {...restProps}>{children}</TopSection>;
};

Layout.BottomSection = function LayoutBottomSection({children, ...restProps}) {
    return <BottomSection {...restProps}>{children}</BottomSection>;
}
