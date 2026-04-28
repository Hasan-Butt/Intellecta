import React, { useState, useRef } from "react";
import {
  Upload,
  FolderPlus,
  Search,
  Filter,
  Tag,
  X,
  Plus,
  FileText,
  Image as ImageIcon,
  File,
  ChevronDown,
  Check,
  Sparkles,
  Clock,
  Folder,
  FolderOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import { useLocation } from "react-router-dom";

// ── Folder Tree Data ────────────────────────────────────────────────────────────
const FOLDER_TREE = [
  {
    id: 1,
    name: "Semester 1",
    subjects: [
      { id: "phy", name: "Physics", count: 3 },
      { id: "math", name: "Mathematics", count: 3 },
      { id: "chem", name: "Chemistry", count: 1 },
    ],
  },
  {
    id: 2,
    name: "Semester 2",
    subjects: [],
  },
  {
    id: 3,
    name: "Semester 3",
    subjects: [],
  },
];

// ── Mock Files (with subject field) ────────────────────────────────────────────
const MOCK_FILES = [
  {
    id: 1,
    name: "Quantum Mechanics Lecture 01.pdf",
    type: "pdf",
    size: "3.2 MB",
    subject: "phy",
    tags: ["Physics", "Quantum"],
    date: "Oct 12, 2023",
  },
  {
    id: 2,
    name: "Lab Results - Thermodynamics.docs",
    type: "doc",
    size: "1.1 MB",
    subject: "phy",
    tags: ["Physics", "Lab"],
    date: "Oct 15, 2023",
  },
  {
    id: 3,
    name: "Kinematics Diagram.png",
    type: "image",
    size: "2 MB",
    subject: "phy",
    tags: ["Physics", "Visual"],
    date: "Sept 28, 2023",
  },
  {
    id: 4,
    name: "Calculus Notes Chapter 1.pdf",
    type: "pdf",
    size: "1.5 MB",
    subject: "math",
    tags: ["Mathematics", "Calculus"],
    date: "Oct 10, 2023",
  },
  {
    id: 5,
    name: "Linear Algebra Worksheet.doc",
    type: "doc",
    size: "0.8 MB",
    subject: "math",
    tags: ["Mathematics", "Algebra"],
    date: "Oct 11, 2023",
  },
  {
    id: 6,
    name: "Integration Practice.pdf",
    type: "pdf",
    size: "2.1 MB",
    subject: "math",
    tags: ["Mathematics"],
    date: "Oct 14, 2023",
  },
  {
    id: 7,
    name: "Periodic Table Reference.png",
    type: "image",
    size: "1.2 MB",
    subject: "chem",
    tags: ["Chemistry"],
    date: "Oct 9, 2023",
  },
];

const RECENTLY_VIEWED = [
  {
    id: 1,
    name: "Lecture 01 – Foundations",
    time: "2 hours ago",
    thumb: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
  },
  {
    id: 2,
    name: "Lab Protocol – Phase 1",
    time: "Yesterday",
    thumb: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80",
  },
];

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

const SmartCategorizationBanner = ({ onDismiss, onAccept }) => (
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
          <span className="font-semibold text-[#7c3aed]">Physics</span> based on
          filename
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
        isDragging
          ? "border-[#7c3aed] bg-[#f5f3ff]"
          : "border-gray-200 bg-gray-50/50 hover:border-[#c4b5fd] hover:bg-[#faf9ff]"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => onFileSelect(Array.from(e.target.files))}
      />
      <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center mb-4">
        <Upload size={22} className="text-[#7c3aed]" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        Drag &amp; drop files here or click to browse
      </p>
      <p className="text-[11px] text-gray-400">PDF, DOCX, PNG up to 50MB</p>
    </div>
  );
};

const FileRow = ({ file, onAddTag }) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagVal, setTagVal] = useState("");

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagVal.trim()) {
      onAddTag(file.id, tagVal.trim());
      setTagVal("");
      setShowTagInput(false);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 px-2 rounded-2xl hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <FileIcon type={file.type} />
        <span className="text-sm font-semibold text-gray-800 truncate">
          {file.name}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {file.tags.map((t) => (
          <TagPill key={t} label={t} />
        ))}
        {showTagInput ? (
          <input
            autoFocus
            value={tagVal}
            onChange={(e) => setTagVal(e.target.value)}
            onKeyDown={handleAddTag}
            onBlur={() => setShowTagInput(false)}
            className="border border-[#c4b5fd] rounded-full px-2 py-0.5 text-[10px] w-20 outline-none text-[#7c3aed]"
            placeholder="tag…"
          />
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-[#f0eeff] flex items-center justify-center text-[#7c3aed] hover:bg-[#ddd6fe]"
          >
            <Plus size={10} />
          </button>
        )}
      </div>

      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap w-24 text-right">
        {file.date}
      </span>
    </div>
  );
};

const RecentCard = ({ item }) => (
  <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
      <img
        src={item.thumb}
        alt={item.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <div className="p-4">
      <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
      <div className="flex items-center gap-1.5 mt-1 text-gray-400">
        <Clock size={11} />
        <span className="text-[11px]">{item.time}</span>
      </div>
    </div>
  </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────────

const SubjectFolderpage = () => {
  const [files, setFiles] = useState(MOCK_FILES);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("Date");

  // folder tree state
  const [openSemesters, setOpenSemesters] = useState([1]);
  const [activeSubject, setActiveSubject] = useState("phy");

  // Tree visibility state - starts hidden
  const location = useLocation();
  const [showTree, setShowTree] = useState(false);

  // Show tree when coming from sidebar click
  React.useEffect(() => {
    if (location.state?.showTree) {
      setShowTree(true);
    }
  }, [location]);

  const toggleSemester = (id) =>
    setOpenSemesters((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleFileSelect = (newFiles) => {
    const mapped = newFiles.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      type: f.name.endsWith(".pdf")
        ? "pdf"
        : f.name.match(/\.(doc|docx)$/)
        ? "doc"
        : f.name.match(/\.(png|jpg|jpeg)$/)
        ? "image"
        : "file",
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      subject: activeSubject,
      tags: [],
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
    setFiles((prev) => [...mapped, ...prev]);
  };

  const handleAddTag = (fileId, tag) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId && !f.tags.includes(tag)
          ? { ...f, tags: [...f.tags, tag] }
          : f
      )
    );
  };

  // active subject name for the header
  const activeSubjectName = FOLDER_TREE
    .flatMap((s) => s.subjects)
    .find((s) => s.id === activeSubject)?.name || "All Files";

  const filtered = files.filter(
    (f) =>
      f.subject === activeSubject &&
      (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        {/* Col 1: Student Sidebar */}
        <Sidebar />

        {/* Col 2: Folder Tree Panel - only visible when showTree is true */}
        {showTree && (
          <div className="w-52 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col py-6 px-3 sticky top-0 h-screen overflow-y-auto relative">
            {/* Close button to hide tree */}
            <button 
              onClick={() => setShowTree(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors z-10"
              title="Hide folder tree"
            >
              <X size={16} className="text-gray-400" />
            </button>
            
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-4">
              Study Folders
            </p>

            <div className="space-y-1">
              {FOLDER_TREE.map((semester) => {
                const isOpen = openSemesters.includes(semester.id);
                return (
                  <div key={semester.id}>
                    {/* Semester Row */}
                    <button
                      onClick={() => toggleSemester(semester.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <FolderOpen size={15} className="text-[#7c3aed]" />
                        ) : (
                          <Folder size={15} className="text-gray-400 group-hover:text-[#7c3aed]" />
                        )}
                        <span className={cn(
                          "text-xs font-bold transition-colors",
                          isOpen ? "text-[#7c3aed]" : "text-gray-600 group-hover:text-gray-800"
                        )}>
                          {semester.name}
                        </span>
                      </div>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "text-gray-400 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Subjects under semester */}
                    {isOpen && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-100 pl-3">
                        {semester.subjects.length === 0 ? (
                          <p className="text-[10px] text-gray-400 italic py-2 px-2">
                            No subjects yet
                          </p>
                        ) : (
                          semester.subjects.map((sub) => {
                            const isActive = activeSubject === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => setActiveSubject(sub.id)}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all",
                                  isActive
                                    ? "bg-[#f5f3ff] text-[#7c3aed]"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                )}
                              >
                                <span className={cn(
                                  "text-xs font-bold",
                                  isActive ? "text-[#7c3aed]" : ""
                                )}>
                                  {sub.name}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                                  isActive
                                    ? "bg-[#ede9fe] text-[#7c3aed]"
                                    : "bg-gray-100 text-gray-400"
                                )}>
                                  {sub.count}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Col 3: Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-10 py-10 max-w-4xl">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                My Sanctuary Files
              </h1>
              <p className="text-gray-500 text-sm mt-1 max-w-md">
                Organize your academic journey through semantic tagging and
                hierarchical clarity.
              </p>
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-3 mb-6">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#7c3aed] text-[#7c3aed] text-xs font-bold hover:bg-[#f5f3ff] transition-colors">
                <FolderPlus size={14} /> New Folder
              </button>
              <button
                onClick={() => document.getElementById("file-input-hidden")?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6d28d9] transition-colors shadow-lg shadow-indigo-200"
              >
                <Upload size={14} /> Upload
              </button>
              <input
                id="file-input-hidden"
                type="file"
                className="hidden"
                multiple
                onChange={(e) => handleFileSelect(Array.from(e.target.files))}
              />
            </div>

            {/* Drop Zone */}
            <div className="mb-5">
              <DropZone onFileSelect={handleFileSelect} />
            </div>

            {/* Smart Categorization Banner */}
            {showBanner && (
              <div className="mb-5">
                <SmartCategorizationBanner
                  onDismiss={() => setShowBanner(false)}
                  onAccept={() => setShowBanner(false)}
                />
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
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
                  <ChevronDown
                    size={13}
                    className={cn("transition-transform", sortOpen && "rotate-180")}
                  />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20">
                    {["Date", "Name", "Size"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setActiveSort(opt); setSortOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs font-bold transition-colors",
                          activeSort === opt
                            ? "text-[#7c3aed] bg-[#f5f3ff]"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 hover:border-gray-300 transition-colors">
                <Tag size={13} /> Tag
              </button>
            </div>

            {/* File Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm mb-10 overflow-hidden">
              {/* Active subject label */}
              <div className="px-6 pt-5 pb-2 flex items-center gap-2">
                <FolderOpen size={16} className="text-[#7c3aed]" />
                <span className="text-sm font-black text-[#7c3aed]">
                  {activeSubjectName}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">
                  — {filtered.length} file{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-3 border-b border-gray-50">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-11">
                  Filenames
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Tags
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 text-right">
                  Date Added
                </span>
              </div>

              <div className="px-3 py-2 divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-10">
                    No files in {activeSubjectName} yet. Upload your first document!
                  </p>
                ) : (
                  filtered.map((f) => (
                    <FileRow key={f.id} file={f} onAddTag={handleAddTag} />
                  ))
                )}
              </div>
            </div>

            {/* Recently Viewed */}
            <div>
              <h2 className="text-base font-extrabold text-gray-900 mb-4">
                Recently Viewed
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {RECENTLY_VIEWED.map((item) => (
                  <RecentCard key={item.id} item={item} />
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#7c3aed] text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:bg-[#6d28d9] transition-all hover:scale-105 active:scale-95 z-50">
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default SubjectFolderpage;