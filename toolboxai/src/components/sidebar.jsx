import React from "react";
import { useState, useEffect } from "react";
import { Sidebar as SidebarComponent } from "../subcomponents";
import axios from "axios";

const fetchPdfsFromFolder = async () => {
  try {
    console.log("API Path:", process.env.REACT_APP_API_PATH);
    
    const response = await axios.get(`${process.env.REACT_APP_API_PATH}/documents`);
    console.log("API Response:", response.data);
    
    const pdfs = response.data.map((pdf) => ({
      id: pdf.id,
      title: pdf.title,
      path: pdf.path,
      size: pdf.size,
      pages: pdf.pages,
      lastModified: new Date(pdf.lastModified),
    }));
    return pdfs;
    
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    console.error("Error details:", error.response ? error.response.data : "No response data");
    return [];
  }
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Sidebar = ({setSelectedPdf}) => {
    const [pdfs, setPdfs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const loadPdfs = async () => {
        setLoading(true);
        const fetchedPdfs = await fetchPdfsFromFolder();
        setPdfs(fetchedPdfs);
        setLoading(false);
      };
  
      loadPdfs();
    }, []);
  
    const filteredPdfs = pdfs.filter(pdf => 
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    const handlePdfClick = (pdf) => {
      console.log('Opening PDF:', pdf.path);
      setSelectedPdf(pdf);
    };
  
    return (
      <SidebarComponent>
      <SidebarComponent.Header>
        {/*<SidebarComponent.Title>My Documents</SidebarComponent.Title>*/}
        <SidebarComponent.SearchBox 
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SidebarComponent.Header>

      {loading ? (
        <SidebarComponent.EmptyState>Loading documents...</SidebarComponent.EmptyState>
      ) : filteredPdfs.length > 0 ? (
        <SidebarComponent.ListContainer>
          {filteredPdfs.map(pdf => (
            <SidebarComponent.ListItem key={pdf.id} onClick={() => handlePdfClick(pdf)}>
              <SidebarComponent.FileIcon>
                <i className="fas fa-file-pdf"></i>
                {/* Fallback if no icon library */}
                {!window.FontAwesome && <span>PDF</span>}
              </SidebarComponent.FileIcon>
              <SidebarComponent.FileInfo>
                <SidebarComponent.FileTitle title={pdf.title}>{pdf.title}</SidebarComponent.FileTitle>
                <SidebarComponent.FileMeta>
                  <span>{formatDate(pdf.lastModified)}</span>
                  <span>•</span>
                  <span>{pdf.size}</span>
                  <span>•</span>
                  <span>{pdf.pages} pages</span>
                </SidebarComponent.FileMeta>
              </SidebarComponent.FileInfo>
            </SidebarComponent.ListItem>
          ))}
        </SidebarComponent.ListContainer>
      ) : (
        <SidebarComponent.EmptyState>
          <p>No documents found. Try a different search or folder.</p>
        </SidebarComponent.EmptyState>
      )}
    </SidebarComponent>
    );
  };
  
  export default Sidebar;
  