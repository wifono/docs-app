import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MagnifyingGlassIcon, PlusIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth-context";
import CreateDocumentModal from "../components/CreateDocumentModal";
import "../styles/Documents.scss";

interface Document {
  id: number;
  name: string;
  tag: string;
  description: string;
  fileName?: string;
  fileUrl?: string;
  createdAt: string;
}

interface DocumentsResponse {
  data: Document[];
  total: number;
  page: number;
  limit: number;
}

interface BackendDocument {
  id: number;
  name: string;
  tag: string;
  description: string;
  filename?: string;
  filepath?: string;
  createdAt: string;
}

const API_BASE_URL = "http://localhost:3000";

export default function Documents() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Získanie hodnot z URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const itemsPerPage = 10;
  
  // Ref na zachovanie pozície pri prechode stránok
  const scrollPositionRef = useRef<number>(0);
  const shouldRestoreScrollRef = useRef<boolean>(false);

  // Aktualizacia URL pri zmene filtrov
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedTag) params.set("tag", selectedTag);
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedTag, currentPage, setSearchParams]);

  //redirect ak nie logged
  useEffect(() => {
    if (!token) {
      navigate("/");
      toast.error("Musíte sa prihlásiť pre prístup k dokumentom");
    }
  }, [token, navigate]);

  // Získanie všetkých tagov z API
  const fetchAvailableTags = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get<string[]>(
        `${API_BASE_URL}/documents/tags`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setAvailableTags(response.data || []);
      console.log('Available tags:', response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setAvailableTags([]);
    }
  }, [token]);

  // Získanie dokumentov z API s filtrovaním
  const fetchDocuments = useCallback(async () => {
    if (!token) {
      toast.error("Musíte byť prihlásený");
      return;
    }

    setLoading(true);
    
    // zachovanie position 
    if (shouldRestoreScrollRef.current) {
      scrollPositionRef.current = window.scrollY;
    }
    try {
      const params: {
        page: number;
        limit: number;
        search?: string;
        tag?: string;
      } = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (selectedTag) {
        params.tag = selectedTag;
      }

      console.log('Fetching documents with params:', params);

      const response = await axios.get<DocumentsResponse>(
        `${API_BASE_URL}/documents`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Received documents:', response.data);


      const rawDocs = response.data?.data || [];
      const total = response.data?.total || 0;
      
     
      const docs = rawDocs.map((doc: BackendDocument) => ({
        ...doc,
        fileName: doc.filename,
        fileUrl: doc.filepath ? `/${doc.filepath}` : undefined,
      }));
      
      setDocuments(docs);
      setTotalDocuments(total);
    } catch (error) {
      setDocuments([]);
      setTotalDocuments(0);
      
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Nepodarilo sa načítať dokumenty"
        );
      } else {
        toast.error("Nastala neočakávaná chyba");
      }
    } finally {
      setLoading(false);
      
      if (shouldRestoreScrollRef.current) {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositionRef.current);
          shouldRestoreScrollRef.current = false;
        });
      }
    }
  }, [token, currentPage, searchTerm, selectedTag]);

  useEffect(() => {
    fetchAvailableTags();
  }, [fetchAvailableTags]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const totalPages = Math.ceil(totalDocuments / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag]);

  const handleCreateDocument = async (formData: FormData, documentId?: number) => {
    if (!token) {
      toast.error("Musíte byť prihlásený");
      return;
    }

    try {
      if (documentId) {
        // Upravenie dokumenu
        await axios.patch(
          `${API_BASE_URL}/documents/${documentId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Dokument bol úspešne upravený");
      } else {
        // Vytvorenie  dokumentu
        await axios.post(
          `${API_BASE_URL}/documents`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Dokument bol úspešne vytvorený");
      }

      setIsModalOpen(false);
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || (documentId ? "Nepodarilo sa upraviť dokument" : "Nepodarilo sa vytvoriť dokument")
        );
      } else {
        toast.error("Nastala neočakávaná chyba");
      }
    }
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteDocument = async (id: number) => {
    if (!confirm("Naozaj chcete odstrániť tento dokument?")) {
      return;
    }

    if (!token) {
      toast.error("Musíte byť prihlásený");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/documents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Dokument bol úspešne odstránený");
      fetchDocuments();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Nepodarilo sa odstrániť dokument"
        );
      } else {
        toast.error("Nastala neočakávaná chyba");
      }
    }
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    if (!token) {
      toast.error("Musíte byť prihlásený");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/documents/${documentId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Nepodarilo sa stiahnuť súbor"
        );
      } else {
        toast.error("Nastala neočakávaná chyba");
      }
    }
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <h1 className="documents-title">Moje dokumenty</h1>
        <button
          onClick={() => {
            setModalMode("create");
            setEditingDocument(null);
            setIsModalOpen(true);
          }}
          className="btn-create-document"
        >
          <PlusIcon className="h-5 w-5" />
          Vytvoriť dokument
        </button>
      </div>

      {/* Search a Filter */}
      <div className="filters-container">
        <div className="search-box">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Hľadať podľa názvu alebo popisu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="tag-filter"
        >
          <option value="">Všetky tagy</option>
          {availableTags.map((tag: string) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* loading */}
      {loading && (
        <div className="loading-container">
          <p className="loading-text">Načítavam dokumenty...</p>
        </div>
      )}

      {/* Tabulka */}
      {!loading && (
        <div className="documents-table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Názov</th>
                <th>Tag</th>
                <th>Popis</th>
                <th>Súbor</th>
                <th>Dátum vytvorenia</th>
                <th>Akcie</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-documents">
                    Nenašli sa žiadne dokumenty
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="doc-name" data-label="Názov">{doc.name}</td>
                    <td data-label="Tag">
                      <span className="doc-tag">{doc.tag || "-"}</span>
                    </td>
                    <td className="doc-description" data-label="Popis">
                      {doc.description || "-"}
                    </td>
                    <td className="doc-file" data-label="Súbor">
                      {doc.fileName ? (
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[150px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <button
                            onClick={() => handleDownload(doc.id, doc.fileName!)}
                            className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-gray-700 transition-colors"
                            title="Stiahnuť súbor"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="doc-date" data-label="Dátum vytvorenia">
                      {new Date(doc.createdAt).toLocaleDateString("sk-SK")}
                    </td>
                    <td className="doc-actions" data-label="Akcie">
                      <button
                        onClick={() => handleEditDocument(doc)}
                        className="btn-edit"
                      >
                        Upraviť
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="btn-delete"
                      >
                        Odstrániť
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* paginacia */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={(e) => {
              e.preventDefault();
              shouldRestoreScrollRef.current = true;
              setCurrentPage((prev) => Math.max(1, prev - 1));
            }}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Predchádzajúca
          </button>
          <span className="pagination-info">
            Strana {currentPage} z {totalPages}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              shouldRestoreScrollRef.current = true;
              setCurrentPage((prev) => Math.min(totalPages, prev + 1));
            }}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Nasledujúca
          </button>
        </div>
      )}

      <CreateDocumentModal
        key={modalMode === "edit" && editingDocument ? `edit-${editingDocument.id}` : "create"}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDocument(null);
          setModalMode("create");
        }}
        onSubmit={handleCreateDocument}
        existingTags={availableTags}
        document={editingDocument}
        mode={modalMode}
      />
    </div>
  );
}
