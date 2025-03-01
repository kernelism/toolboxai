import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f4f4f4;
  height: 100%;
`;

export const PdfViewer = styled.div`
  flex-grow: 1;
  background-color: white;
  overflow: auto;
  height: 100%;
`;

export const Notes = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #f4f4f4;
  height: 100%;
`;

export const Resizer = styled.div`
  width: 5px;
  background-color: #ccc;
  cursor: ew-resize;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
`;

export const LeftResizer = styled(Resizer)`
  left: 0;
  right: auto;
  z-index: 70;
`;
