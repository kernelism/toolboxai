import styled from 'styled-components';

// Styled components for the Notes layout
export const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
`;

export const SearchBox = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  padding: 0.5rem 0;
`;

export const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  background-color: white;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

export const CardThumbnail = styled.div`
  height: 120px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const ThumbnailImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

export const PdfIcon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  font-size: 2rem;
`;

export const CardInfo = styled.div`
  padding: 0.75rem;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardMeta = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.7rem;
  color: #888;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  text-align: center;
  padding: 2rem;
`;
export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
`;

export const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f9f9f9;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
`;

export const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  color: #e74c3c;
  font-size: 1.5rem;
  margin-right: 1rem;
`;

export const FileInfo = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const FileTitle = styled(CardTitle)`
  font-size: 0.9rem;
`;

export const FileMeta = styled(CardMeta)`
  display: flex;
  gap: 0.5rem;
`;
