import styled from "styled-components";
import {FileText} from 'lucide-react'

export const SidebarLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  background: white;
`;

export const SearchBox = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #ffbe42;
    box-shadow: 0 0 5px rgba(255, 190, 66, 0.5);
  }
`;

export const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
`;

export const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-left: 2px solid transparent;
  cursor: pointer;
  &:hover {
    background: #f9f9f9;
    border-left-color: #ffbe42;
  }
`;

export const FileIcon = styled(FileText)`
width: 20px;
height: 20px;
`;


export const FileInfo = styled.div`
  flex: 1;
  margin-left: 10px;
`;

export const FileTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const FileMeta = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 5px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  text-align: center;
  padding: 20px;
  .loading-icon {
    color: #ff9f00;
    animation: spin 1s linear infinite;
  }
  .separator {
    color: #ff9f00;
  }
  .empty-icon {
    color: #ccc;
  }
`;