import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, FileText, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {Sidebar as SidebarLayout} from "../subcomponents";

const fetchPdfsFromFolder = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_PATH}/documents`);
    return response.data.map((pdf) => ({
      id: pdf.id,
      title: pdf.title,
      path: pdf.path,
      size: pdf.size,
      pages: pdf.pages,
      lastModified: new Date(pdf.lastModified),
    }));
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return [];
  }
};

const formatDate = (date) =>
  date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const Sidebar = ({ setSelectedPdf }) => {
  const [pdfs, setPdfs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredPdfs = pdfs.filter((pdf) => pdf.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SidebarLayout>
      <SidebarLayout.Header>
        <SidebarLayout.SearchBox value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={"Search for a file.."} />
      </SidebarLayout.Header>

      <AnimatePresence>
        {loading ? (
          <SidebarLayout.EmptyState>
            <Loader className="loading-icon" size={24} />
            <p>Loading documents...</p>
          </SidebarLayout.EmptyState>
        ) : filteredPdfs.length > 0 ? (
          <SidebarLayout.ListContainer>
            <AnimatePresence>
              {filteredPdfs.map((pdf) => (
                <motion.div key={pdf.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                  <SidebarLayout.ListItem onClick={() => setSelectedPdf(pdf)}>
                    <SidebarLayout.FileIcon />
                    <SidebarLayout.FileInfo>
                      <SidebarLayout.FileTitle title={pdf.title}>{pdf.title}</SidebarLayout.FileTitle>
                      <SidebarLayout.FileMeta>
                        <span>{formatDate(pdf.lastModified)}</span>
                        <span className="separator">•</span>
                        <span>{pdf.size}</span>
                        <span className="separator">•</span>
                        <span>{pdf.pages} pages</span>
                      </SidebarLayout.FileMeta>
                    </SidebarLayout.FileInfo>
                  </SidebarLayout.ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </SidebarLayout.ListContainer>
        ) : (
          <SidebarLayout.EmptyState>
            <Search className="empty-icon" size={24} />
            <p>No documents found. Try a different search.</p>
          </SidebarLayout.EmptyState>
        )}
      </AnimatePresence>
    </SidebarLayout>
  );
};

export default Sidebar;