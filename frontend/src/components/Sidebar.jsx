import React from "react";
import { useState, useEffect, useRef } from "react";
import { Sidebar as SidebarComponent } from "../subcomponents";
import axios from "axios";
import { Search, FileText, Loader, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const Sidebar = ({ setSelectedPdf }) => {
  const [pdfs, setPdfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset error state
    setUploadError(null);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only PDF files are allowed');
      return;
    }

    // Validate file size (e.g., 50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setUploadError('File size must be less than 50MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${process.env.REACT_APP_API_PATH}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh the PDF list after upload
      const fetchedPdfs = await fetchPdfsFromFolder();
      setPdfs(fetchedPdfs);
      
      // Reset the file input
      e.target.value = null;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to upload PDF";
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const StyledSidebar = ({ children }) => (
    <div className="h-screen w-full bg-white border-r border-gray-100 shadow-soft overflow-hidden flex flex-col">
      {children}
    </div>
  );

  const Header = ({ children }) => (
    <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
      {children}
    </div>
  );

  const SearchContainer = () => (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 pl-9 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
      </div>
      
      <button 
        onClick={handleUploadClick}
        disabled={uploading}
        className={`p-2 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <Upload size={20} className={`${uploading ? 'animate-pulse' : ''} text-blue-600`} />
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden"
          accept=".pdf"
        />
      </button>
    </div>
  );

  const ListContainer = ({ children }) => (
    <div className="flex-1 overflow-y-auto py-2">
      {children}
    </div>
  );

  const ListItem = ({ children, onClick }) => (
    <motion.div
      className="p-3 hover:bg-gray-50 cursor-pointer border-l-2 border-transparent hover:border-blue-500 transition-all"
      onClick={onClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex items-center space-x-3">
        {children}
      </div>
    </motion.div>
  );

  const FileIcon = () => (
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
      <FileText size={18} />
    </div>
  );

  const FileInfo = ({ children }) => (
    <div className="flex-1 min-w-0">
      {children}
    </div>
  );

  const FileTitle = ({ children, title }) => (
    <h3 className="text-sm font-medium text-gray-900 truncate" title={title}>
      {children}
    </h3>
  );

  const FileMeta = ({ children }) => (
    <div className="text-xs text-gray-500 flex flex-wrap gap-1">
      {children}
    </div>
  );

  const EmptyState = ({ children }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
      {children}
    </div>
  );

  return (
    <StyledSidebar>
      <Header>
        <SearchContainer />
        {uploading && (
          <div className="mt-2 flex items-center justify-center text-xs text-blue-600">
            <Loader size={12} className="animate-spin mr-1" /> 
            Uploading PDF...
          </div>
        )}
        {uploadError && (
          <div className="mt-2 flex items-center justify-center text-xs text-red-600">
            {uploadError}
          </div>
        )}
      </Header>

      <AnimatePresence>
        {loading ? (
          <EmptyState>
            <Loader className="text-blue-600 animate-spin mb-2" size={24} />
            <p>Loading documents...</p>
          </EmptyState>
        ) : filteredPdfs.length > 0 ? (
          <ListContainer>
            <AnimatePresence>
              {filteredPdfs.map(pdf => (
                <motion.div
                  key={pdf.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem onClick={() => handlePdfClick(pdf)}>
                    <FileIcon />
                    <FileInfo>
                      <FileTitle title={pdf.title}>{pdf.title}</FileTitle>
                      <FileMeta>
                        <span>{formatDate(pdf.lastModified)}</span>
                        <span className="text-blue-500">•</span>
                        <span>{pdf.size}</span>
                        <span className="text-blue-500">•</span>
                        <span>{pdf.pages} pages</span>
                      </FileMeta>
                    </FileInfo>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </ListContainer>
        ) : (
          <EmptyState>
            <Search className="text-gray-400 mb-2" size={24} />
            <p>No documents found. Try a different search or upload a PDF.</p>
          </EmptyState>
        )}
      </AnimatePresence>
    </StyledSidebar>
  );
};

export default Sidebar;