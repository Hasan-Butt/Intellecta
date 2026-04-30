import React, { useState, useRef, useEffect } from "react";
import {
  Upload, FolderPlus, Search, Filter, X, Plus,
  FileText, Image as ImageIcon, File, ChevronDown, Check,
  Sparkles, Clock, Folder, FolderOpen, Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import { useLocation } from "react-router-dom";
import {
  getSubjects, createSubject, deleteSubject,
  getDocumentsBySubject, uploadDocument, updateDocumentTags,  // ← FIXED
  deleteDocument, searchDocuments,
} from "../../services/documentService";

// ── Helpers ─────────────────────────────────────────────────────────────────────

const sortFiles = (files, activeSort) => {
  return [...files].sort((a, b) => {
    if (activeSort === "Name")
      return (a.fileName || a.name || "").localeCompare(b.fileName || b.name || "");
    if (activeSort === "Size")
      return (b.fileSize || 0) - (a.fileSize || 0);
    return new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0);
  });
};

const relativeTime = (isoString) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const RECENT_KEY = "intellecta_recent_files";

const saveRecentFile = (file) => {
  try {
    const existing = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const filtered = existing.filter((f) => f.id !== file.id);
    const updated = [{ ...file, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 2);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {}
};

const getRecentFiles = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch (e) {
    return [];
  }
};

const openFile = (file) => {
  const path = file.filePath;
  if (!path) return;
  const normalized = path.replace(/\\/g, "/");
  const relative = normalized.includes("uploads/")
    ? normalized.substring(normalized.indexOf("uploads/"))
    : normalized;
  const url = `http://localhost:8080/${relative}`;
  window.open(url, "_blank");
};

const suggestTagFromFilename = (filename) => {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// ── Sub Components ──────────────────────────────────────────────────────────────

const FileIcon = ({ type, size = 16 }) => {
  if (type === "pdf")
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-red-50 rounded-lg flex-shrink-0">
        <FileText size={size} className="text-red-500" />
      </div>
    );
  if (type === "doc")
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg flex-shrink-0">
        <File size={size} className="text-blue-500" />
      </div>
    );
  if (type === "image")
    return (
      <div className="flex items-center justify-center w-8 h-8 bg-amber-50 rounded-lg flex-shrink-0">
        <ImageIcon size={size} className="text-amber-500" />
      </div>
    );
  return (
    <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg flex-shrink-0">
      <File size={size} className="text-gray-400" />
    </div>
  );
};

const TagPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f0eeff] text-[#7c3aed] text-[10px] font-bold border border-[#ddd6fe]">
    {label}
    {onRemove && (
      <button onClick={onRemove} className="hover:text-red-500 transition-colors">
        <X size={10} />
      </button>
    )}
  </span>
);

const SmartCategorizationBanner = ({ onDismiss, onAccept, suggestion }) => (
  <div className="flex items-center justify-between px-4 py-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-2xl">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-[#7c3aed] rounded-lg flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] font-black text-[#7c3aed] uppercase tracking-wider">
          Smart Categorization
        </p>
        <p className="text-xs text-[#6b7280]">
          Suggested tag:{" "}
          <span className="font-semibold text-[#7c3aed]">{suggestion}</span> based on filename
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onDismiss}
        className="px-3 py-1.5 text-[11px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
      >
        Dismiss
      </button>
      <button
        onClick={onAccept}
        className="px-4 py-1.5 text-[11px] font-bold text-white bg-[#7c3aed] rounded-xl hover:bg-[#6d28d9] transition-colors flex items-center gap-1.5"
      >
        <Check size={12} /> Accept
      </button>
    </div>
  </div>
);

const DropZone = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFileSelect(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-3xl py-10 flex flex-col items-center justify-center cursor-pointer transition-all",
        isDragging ? "border-[#7c3aed] bg-[#f5f3ff]" : "border-gray-200 bg-gray-50/50 hover:border-[#c4b5fd] hover:bg-[#faf9ff]"
      )}
    >
      <input ref={inputRef} type="file" className="hidden" multiple
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => onFileSelect(Array.from(e.target.files))}
      />
      <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center mb-4">
        <Upload size={22} className="text-[#7c3aed]" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">Drag &amp; drop files here or click to browse</p>
      <p className="text-[11px] text-gray-400">PDF, DOCX, PNG up to 50MB</p>
    </div>
  );
};

const FileRow = ({ file, onTagAdded, onDeleted }) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagVal, setTagVal] = useState("");

  const handleAddTag = async (e) => {
    if (e.key === "Enter" && tagVal.trim()) {
      const newTag = tagVal.trim();
      const existingTags = file.tags || [];
      if (!existingTags.includes(newTag)) {
        try {
          await updateDocumentTags(file.id, [...existingTags, newTag]);
          onTagAdded();
        } catch (err) {
          console.error("Failed to add tag:", err);
        }
      }
      setTagVal("");
      setShowTagInput(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${file.fileName || file.name}"?`)) return;
    try {
      await deleteDocument(file.id);
      onDeleted();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleClick = () => {
    saveRecentFile(file);
    openFile(file);
  };

  const displayName = file.fileName || file.name;
  const displayDate = file.uploadDate
    ? new Date(file.uploadDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : file.date;
  const displayType = file.fileType || file.type;
  const displayTags = file.tags || [];

  return (
    <div
      onClick={handleClick}
      className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 px-2 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <FileIcon type={displayType} />
        <span className="text-sm font-semibold text-gray-800 truncate">{displayName}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {displayTags.map((t) => (
          <TagPill key={t} label={t} />
        ))}
        {showTagInput ? (
          <input
            autoFocus value={tagVal}
            onChange={(e) => setTagVal(e.target.value)}
            onKeyDown={handleAddTag}
            onBlur={() => setShowTagInput(false)}
            onClick={(e) => e.stopPropagation()}
            className="border border-[#c4b5fd] rounded-full px-2 py-0.5 text-[10px] w-20 outline-none text-[#7c3aed]"
            placeholder="tag…"
          />
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setShowTagInput(true); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-[#f0eeff] flex items-center justify-center text-[#7c3aed] hover:bg-[#ddd6fe]"
          >
            <Plus size={10} />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 ml-1"
        >
          <X size={10} />
        </button>
      </div>
      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap w-24 text-right">
        {displayDate}
      </span>
    </div>
  );
};

const RecentCard = ({ item }) => (
  <div
    onClick={() => { saveRecentFile(item); openFile(item); }}
    className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex items-center gap-4 p-4"
  >
    <FileIcon type={item.fileType || item.type} size={20} />
    <div className="min-w-0">
      <p className="text-sm font-bold text-gray-800 truncate">{item.fileName || item.name}</p>
      <div className="flex items-center gap-1.5 mt-1 text-gray-400">
        <Clock size={11} />
        <span className="text-[11px]">{relativeTime(item.viewedAt)}</span>
      </div>
    </div>
  </div>
);

const NewFolderModal = ({ isOpen, onClose, onCreate }) => {
  const [subjectName, setSubjectName] = useState("");
  const [semester, setSemester] = useState("Semester 1");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) { setSubjectName(""); setSemester("Semester 1"); }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!subjectName.trim()) return;
    setCreating(true);
    try {
      await onCreate(subjectName.trim(), semester);
      onClose();
    } catch (err) {
      console.error("Failed to create folder:", err);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">New Subject Folder</h2>
            <p className="text-xs text-gray-400 mt-1">Add a subject under a semester</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Subject Name <span className="text-red-400">*</span>
          </label>
          <input
            autoFocus type="text" value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="e.g. Physics, Mathematics..."
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] transition-all placeholder:text-gray-300 font-medium"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Semester <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] transition-all appearance-none font-medium cursor-pointer"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 8">Semester 8</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!subjectName.trim() || creating}
            className="flex-1 py-3.5 rounded-2xl bg-[#7c3aed] text-white text-sm font-bold hover:bg-[#6d28d9] transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Folder"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────────

const SubjectFolderpage = () => {
  const [subjects, setSubjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerSuggestion, setBannerSuggestion] = useState("");
  const [lastUploadedId, setLastUploadedId] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Date");
  const [openSemesters, setOpenSemesters] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSemester, setActiveSemester] = useState("Semester 1");
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [recentFiles, setRecentFiles] = useState(getRecentFiles());
  const location = useLocation();
  const [showTree, setShowTree] = useState(false);

  useEffect(() => {
    if (location.state?.showTree) setShowTree(true);
  }, [location]);

  useEffect(() => { fetchSubjects(); }, []);

  useEffect(() => {
    if (activeSubject) fetchFiles();
  }, [activeSubject]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      if (activeSubject) fetchFiles();
    } else {
      handleSearch();
    }
  }, [searchQuery]);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects();
      const data = Array.isArray(res.data) ? res.data : [];
      setSubjects(data);
      if (data.length > 0 && !activeSubject) {
        setOpenSemesters([data[0].semester]);
        setActiveSubject(data[0].name);
        setActiveSemester(data[0].semester);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    if (!activeSubject) return;
    setLoading(true);
    try {
      const res = await getDocumentsBySubject(activeSubject);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await searchDocuments(searchQuery, activeSubject);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleFileSelect = async (newFiles) => {
    if (!activeSubject) {
      alert("Please select a subject folder first.");
      return;
    }
    try {
      let lastUploaded = null;
      for (const file of newFiles) {
        const res = await uploadDocument(file, activeSubject, activeSemester);
        lastUploaded = res.data;
      }
      await fetchFiles();
      fetchSubjects();
      if (lastUploaded) {
        const suggestion = suggestTagFromFilename(lastUploaded.fileName);
        setBannerSuggestion(suggestion);
        setLastUploadedId(lastUploaded.id);
        setShowBanner(true);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Is the backend running?");
    }
  };

  const handleCreateFolder = async (name, semester) => {
    const res = await createSubject({ name, semester, color: "#7c3aed" });
    const created = res.data;
    await fetchSubjects();
    setActiveSubject(created.name);
    setActiveSemester(created.semester);
    setOpenSemesters((prev) =>
      prev.includes(created.semester) ? prev : [...prev, created.semester]
    );
  };

  const handleDeleteSubject = async (e, subject) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${subject.name}" and all its files?`)) return;
    try {
      await deleteSubject(subject.id);
      if (activeSubject === subject.name) {
        setActiveSubject(null);
        setFiles([]);
      }
      await fetchSubjects();
    } catch (err) {
      console.error("Failed to delete subject:", err);
    }
  };

  const toggleSemester = (semesterName) =>
    setOpenSemesters((prev) =>
      prev.includes(semesterName)
        ? prev.filter((s) => s !== semesterName)
        : [...prev, semesterName]
    );

  const subjectsBySemester = subjects.reduce((acc, sub) => {
    const sem = sub.semester || "Semester 1";
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(sub);
    return acc;
  }, {});

  const semesters = Object.keys(subjectsBySemester).sort();
  const sortedFiles = sortFiles(files, activeSort);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />

        {/* Folder Tree Panel */}
        {showTree && (
          <div className="w-52 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col py-6 px-3 sticky top-0 h-screen overflow-y-auto relative">
            <button onClick={() => setShowTree(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors z-10">
              <X size={16} className="text-gray-400" />
            </button>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-4">Study Folders</p>
            <div className="space-y-1">
              {semesters.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic px-3">No folders yet. Create one!</p>
              ) : (
                semesters.map((semester) => {
                  const isOpen = openSemesters.includes(semester);
                  return (
                    <div key={semester}>
                      <button
                        onClick={() => toggleSemester(semester)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          {isOpen ? <FolderOpen size={15} className="text-[#7c3aed]" /> : <Folder size={15} className="text-gray-400 group-hover:text-[#7c3aed]" />}
                          <span className={cn("text-xs font-bold transition-colors", isOpen ? "text-[#7c3aed]" : "text-gray-600 group-hover:text-gray-800")}>
                            {semester}
                          </span>
                        </div>
                        <ChevronDown size={13} className={cn("text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
                      </button>

                      {isOpen && (
                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-100 pl-3">
                          {subjectsBySemester[semester].length === 0 ? (
                            <p className="text-[10px] text-gray-400 italic py-2 px-2">No subjects yet</p>
                          ) : (
                            subjectsBySemester[semester].map((sub) => {
                              const isActive = activeSubject?.toLowerCase() === sub.name?.toLowerCase();
                              return (
                                <div key={sub.id} className="group/subject relative">
                                  <button
                                    onClick={() => {
                                      setActiveSubject(sub.name);
                                      setActiveSemester(sub.semester);
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all pr-8",
                                      isActive ? "bg-[#f5f3ff] text-[#7c3aed]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                    )}
                                  >
                                    <span className={cn("text-xs font-bold", isActive ? "text-[#7c3aed]" : "")}>
                                      {sub.name}
                                    </span>
                                    <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-md",
                                      isActive ? "bg-[#ede9fe] text-[#7c3aed]" : "bg-gray-100 text-gray-400"
                                    )}>
                                      {sub.documentCount || 0}
                                    </span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteSubject(e, sub)}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/subject:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-10 py-10 max-w-4xl">

            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Sanctuary Files</h1>
              <p className="text-gray-500 text-sm mt-1 max-w-md">
                Organize your academic journey through semantic tagging and hierarchical clarity.
              </p>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#7c3aed] text-[#7c3aed] text-xs font-bold hover:bg-[#f5f3ff] transition-colors"
              >
                <FolderPlus size={14} /> New Folder
              </button>
              <button
                onClick={() => document.getElementById("file-input-hidden")?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6d28d9] transition-colors shadow-lg shadow-indigo-200"
              >
                <Upload size={14} /> Upload
              </button>
              <input id="file-input-hidden" type="file" className="hidden" multiple
                onChange={(e) => handleFileSelect(Array.from(e.target.files))}
              />
            </div>

            <div className="mb-5">
              <DropZone onFileSelect={handleFileSelect} />
            </div>

            {showBanner && bannerSuggestion && (
              <div className="mb-5">
                <SmartCategorizationBanner
                  suggestion={bannerSuggestion}
                  onDismiss={() => setShowBanner(false)}
                  onAccept={async () => {
                    if (lastUploadedId) {
                      try {
                        const file = files.find((f) => f.id === lastUploadedId);
                        const existingTags = file?.tags || [];
                        if (!existingTags.includes(bannerSuggestion)) {
                          await updateDocumentTags(lastUploadedId, [...existingTags, bannerSuggestion]);
                          fetchFiles();
                        }
                      } catch (err) {
                        console.error("Failed to apply suggested tag:", err);
                      }
                    }
                    setShowBanner(false);
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Filename or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 outline-none focus:border-[#c4b5fd] focus:ring-2 focus:ring-[#ede9fe] transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 hover:border-gray-300 transition-colors"
                >
                  <Filter size={13} />
                  {activeSort}
                  <ChevronDown size={13} className={cn("transition-transform", sortOpen && "rotate-180")} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20">
                    {["Date", "Name", "Size"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setActiveSort(opt); setSortOpen(false); }}
                        className={cn("w-full text-left px-4 py-2 text-xs font-bold transition-colors",
                          activeSort === opt ? "text-[#7c3aed] bg-[#f5f3ff]" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* File Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mb-10 overflow-hidden">
              <div className="px-6 pt-5 pb-2 flex items-center gap-2">
                <FolderOpen size={16} className="text-[#7c3aed]" />
                <span className="text-sm font-black text-[#7c3aed]">{activeSubject || "Select a folder"}</span>
                <span className="text-[10px] text-gray-400 font-bold">
                  — {sortedFiles.length} file{sortedFiles.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 border-b border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-11">Filenames</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tags</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 text-right">Date Added</span>
              </div>
              <div className="px-3 py-2 divide-y divide-gray-50">
                {loading ? (
                  <p className="text-center text-gray-400 text-sm py-10">Loading...</p>
                ) : sortedFiles.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-10">
                    {activeSubject ? `No files in ${activeSubject} yet. Upload your first document!` : "Create a folder first, then upload files."}
                  </p>
                ) : (
                  sortedFiles.map((f) => (
                    <FileRow
                      key={f.id}
                      file={f}
                      onTagAdded={() => { fetchFiles(); setRecentFiles(getRecentFiles()); }}
                      onDeleted={() => { fetchFiles(); fetchSubjects(); setRecentFiles(getRecentFiles()); }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Recently Viewed */}
            <div>
              <h2 className="text-base font-extrabold text-gray-900 mb-4">Recently Viewed</h2>
              {recentFiles.length === 0 ? (
                <p className="text-[11px] text-gray-400">No recently viewed files yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {recentFiles.map((item) => (
                    <RecentCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <NewFolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onCreate={handleCreateFolder}
      />
    </div>
  );
};

export default SubjectFolderpage;