import {
    SidebarLayout,
    Header,
    SearchBox,
    ListContainer,
    ListItem,
    FileIcon,
    FileInfo,
    FileMeta,
    FileTitle,
    EmptyState,

} from './sidebar.jsx';

export default function Sidebar({children, ...restProps}) {   
    return (
        <SidebarLayout {...restProps}>{children}</SidebarLayout>
    )
}

Sidebar.Header = function NotesHeader({children, ...restProps}) {
    return <Header {...restProps}>{children}</Header>
}

Sidebar.SearchBox = function NotesSearchBox({children, ...restProps}) {
    return <SearchBox {...restProps}>{children}</SearchBox>
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

