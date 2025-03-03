import React from "react";
import { useState, useEffect } from "react";
import { Sidebar as SidebarComponent } from "../subcomponents";
import axios from "axios";
import { Search, FileText, Loader } from "lucide-react";
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

  // Custom styled components to match theme
  const StyledSidebar = ({ children }) => (
    <div className="h-screen w-full bg-white border-r border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {children}
    </div>
  );

  const Header = ({ children }) => (
    <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
      {children}
    </div>
  );

  const SearchBox = ({ value, onChange }) => (
    <div className="relative">
      <input
        type="text"
        placeholder="Search files..."
        value={value}
        onChange={onChange}
        className="w-full p-2 pl-9 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
      />
      <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
    </div>
  );

  const ListContainer = ({ children }) => (
    <div className="flex-1 overflow-y-auto py-2">
      {children}
    </div>
  );

  const ListItem = ({ children, onClick }) => (
    <motion.div
      className="p-3 hover:bg-gray-50 cursor-pointer border-l-2 border-transparent hover:border-amber-500"
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
    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-amber-100 flex items-center justify-center text-amber-600">
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
        <SearchBox 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Header>

      <AnimatePresence>
        {loading ? (
          <EmptyState>
            <Loader className="text-amber-500 animate-spin mb-2" size={24} />
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
                        <span className="text-amber-500">•</span>
                        <span>{pdf.size}</span>
                        <span className="text-amber-500">•</span>
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
            <p>No documents found. Try a different search or folder.</p>
          </EmptyState>
        )}
      </AnimatePresence>
    </StyledSidebar>
  );
};

export default Sidebar;