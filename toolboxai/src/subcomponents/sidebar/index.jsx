import {
    SidebarContainer,
    Header,
    Title,
    SearchBox,
    CardsGrid,
    Card,
    CardThumbnail,
    ThumbnailImage,
    PdfIcon,
    CardInfo,
    CardTitle,
    CardMeta,
    EmptyState,
    ListContainer,
    ListItem,
    FileIcon,
    FileInfo,
    FileTitle,
    FileMeta
} from './sidebar.jsx';

export default function Sidebar({children, ...restProps}) {   
    return (
        <SidebarContainer {...restProps}>{children}</SidebarContainer>
    )
}

Sidebar.Header = function NotesHeader({children, ...restProps}) {
    return <Header {...restProps}>{children}</Header>
}

Sidebar.Title = function NotesTitle({children, ...restProps}) {
    return <Title {...restProps}>{children}</Title>
}

Sidebar.SearchBox = function NotesSearchBox({children, ...restProps}) {
    return <SearchBox {...restProps}>{children}</SearchBox>
}

Sidebar.CardsGrid = function NotesCardsGrid({children, ...restProps}) {
    return <CardsGrid {...restProps}>{children}</CardsGrid>
}

Sidebar.Card = function NotesCard({children, ...restProps}) {
    return <Card {...restProps}>{children}</Card>
}

Sidebar.CardThumbnail = function NotesCardThumbnail({children, ...restProps}) {
    return <CardThumbnail {...restProps}>{children}</CardThumbnail>
}

Sidebar.ThumbnailImage = function NotesThumbnailImage({children, ...restProps}) {
    return <ThumbnailImage {...restProps}>{children}</ThumbnailImage>
}

Sidebar.PdfIcon = function NotesPdfIcon({children, ...restProps}) {
    return <PdfIcon {...restProps}>{children}</PdfIcon>
}

Sidebar.CardInfo = function NotesCardInfo({children, ...restProps}) {
    return <CardInfo {...restProps}>{children}</CardInfo>
}

Sidebar.CardTitle = function NotesCardTitle({children, ...restProps}) {
    return <CardTitle {...restProps}>{children}</CardTitle>
}

Sidebar.CardMeta = function NotesCardMeta({children, ...restProps}) {
    return <CardMeta {...restProps}>{children}</CardMeta>
}

Sidebar.EmptyState = function NotesEmptyState({children, ...restProps}) {
    return <EmptyState {...restProps}>{children}</EmptyState>
}

Sidebar.ListContainer = function NotesListContainer({children, ...restProps}) {
    return <ListContainer {...restProps}>{children}</ListContainer>
}

Sidebar.ListItem = function NotesListItem({children, ...restProps}) {
    return <ListItem {...restProps}>{children}</ListItem>
}

Sidebar.FileIcon = function NotesFileIcon({children, ...restProps}) {
    return <FileIcon {...restProps}>{children}</FileIcon>
}

Sidebar.FileInfo = function NotesFileInfo({children, ...restProps}) {
    return <FileInfo {...restProps}>{children}</FileInfo>
}

Sidebar.FileTitle = function NotesFileTitle({children, ...restProps}) {
    return <FileTitle {...restProps}>{children}</FileTitle>
}

Sidebar.FileMeta = function NotesFileMeta({children, ...restProps}) {
    return <FileMeta {...restProps}>{children}</FileMeta>
}

