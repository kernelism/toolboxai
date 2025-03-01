import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const PdfSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

export const ControlPanelContainer = styled.div`
  margin: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const ControlGroup = styled.div`
  display: flex;
  align-items: center;
`;

export const Icon = styled.i`
  margin: 0 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #333;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PageInput = styled.input`
  padding: 0.25rem;
  margin: 0 0.5rem;
  width: 50px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

export const Loader = styled.img`
  width: 100px;
  height: 100px;
`;

export const LoaderText = styled.p`
  font-size: 1.5rem;
  margin-top: 1rem;
`;
