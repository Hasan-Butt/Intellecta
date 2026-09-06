import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  BookmarkCheck,
  X,
  FileEdit,
  CheckSquare,
} from "lucide-react";
import {
  getAllNotes,
  flagForReview,
  updateNote,
} from "../../services/notesService";
import { cn } from "../../lib/utils";
import NoteCard from "../../components/ui/NoteCard";
import NewNote from "./NewNote";
import EditNote from "./EditNote";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import { LayoutGrid, List } from "lucide-react";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isSanctuaryMode, setIsSanctuaryMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [activeTagFilters, setActiveTagFilters] = useState([]);

  const getNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllNotes();
      const data = response.data || response;
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        console.error("Backend did not return an array:", data);
        setNotes([]);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getNotes();
  }, [getNotes]);

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsEditOpen(true);
  };

  const handleEditSaved = () => {
    setIsEditOpen(false);
    setEditingNote(null);
    getNotes();
  };

  const openModal = (sanctuary = false) => {
    setIsSanctuaryMode(sanctuary);
    setIsNewNoteOpen(true);
  };

  const handleNoteSaved = () => {
    setIsNewNoteOpen(false);
    getNotes();
  };

  const handleSelect = (noteId) => {
    setSelectedIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId],
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setShowTagInput(false);
    setTagInput("");
  };

  const handleReviewQueue = async () => {
    try {
      await Promise.all(selectedIds.map((id) => flagForReview(id)));
      clearSelection();
      getNotes();
    } catch (err) {
      console.error("Failed to flag for review:", err);
    }
  };

  const handleAddTag = async () => {
    if (!tagInput.trim()) return;
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const note = notes.find((n) => n.id === id);
          const existingTags = note.tags || [];
          if (existingTags.includes(tagInput.trim())) return Promise.resolve();
          return updateNote(id, {
            title: note.title,
            content: note.content,
            category: note.category,
            source: note.source,
            isPinned: note.isPinned,
            isSpecial: note.isSpecial,
            flaggedForReview: note.flaggedForReview,
            tags: [...existingTags, tagInput.trim()],
          });
        }),
      );
      clearSelection();
      getNotes();
    } catch (err) {
      console.error("Failed to add tag:", err);
    }
  };

  const allTags = Array.isArray(notes)
    ? [...new Set(notes.flatMap((n) => n.tags || []))]
    : [];

  const toggleTagFilter = (tag) => {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const removeTagFilter = (tag) => {
    setActiveTagFilters((prev) => prev.filter((t) => t !== tag));
  };

  const displayedNotes = notes.filter((note) => {
    if (
      searchQuery &&
      !note.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !note.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (activeTab === "review" && !note.flaggedForReview) return false;
    if (activeTab === "pinned" && !note.isPinned) return false;
    if (activeTagFilters.length > 0) {
      const noteTags = note.tags || [];
      if (!activeTagFilters.every((tag) => noteTags.includes(tag)))
        return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-12 py-6 md:py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 md:gap-4">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                  All Notes
                </h1>
                <p className="text-gray-500 text-sm md:text-base mt-2 max-w-md leading-relaxed">
                  Organize your thoughts and fuel your intellect.
                </p>
              </div>
              <Button
                onClick={() => openModal(false)}
                className="bg-[#7C3AED] text-white px-6 py-6 rounded-xl shadow-lg transition-all hover:scale-105 w-full md:w-auto"
              >
                <Plus className="mr-2 h-5 w-5" /> New Note
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6 neu-inset rounded-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 py-7 bg-transparent border-none text-lg outline-none focus-visible:ring-0 shadow-none"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-zinc-200 mb-8">
              {["all", "pinned", "review"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-4 text-sm font-medium capitalize transition-colors relative",
                    activeTab === tab
                      ? "text-purple-600"
                      : "text-zinc-500 hover:text-zinc-700",
                  )}
                >
                  {tab} Notes
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                  )}
                </button>
              ))}
            </div>

            {/* View mode + tag filters */}
            <div className="flex items-center gap-3 mb-6">
              {/* Grid icon */}
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid"
                    ? "bg-purple-100 text-purple-700"
                    : "text-zinc-400 hover:text-zinc-600",
                )}
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>

              {/* List icon */}
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "list"
                    ? "bg-purple-100 text-purple-700"
                    : "text-zinc-400 hover:text-zinc-600",
                )}
                title="List view"
              >
                <List size={18} />
              </button>

              {/* Tag filter pills */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-2 ml-4 flex-wrap">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-colors",
                        activeTagFilters.includes(tag)
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-purple-300",
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {activeTagFilters.length > 0 && (
                <div className="flex items-center gap-2 ml-2 flex-wrap">
                  {activeTagFilters.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTagFilter(tag)}
                        className="hover:text-purple-900"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes grid wrapped in a scrollable container */}
            {loading ? (
              <p className="text-zinc-400 text-center mt-20">
                Loading notes...
              </p>
            ) : (
              <div className="max-h-[calc(100vh-300px)] min-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                      : "flex flex-col gap-4",
                  )}
                >
                  {displayedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onRefresh={getNotes}
                      isSelected={selectedIds.includes(note.id)}
                      onSelect={handleSelect}
                      onEdit={handleEditNote}
                    />
                  ))}

                  {activeTab === "all" && (
                    <button
                      onClick={() => openModal(true)}
                      className="neu flex flex-col items-center justify-center p-8 text-zinc-400 min-h-[320px] transition-all group hover:scale-[1.02]"
                    >
                      <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <FileEdit className="h-6 w-6 text-zinc-400" />
                      </div>
                      <p className="text-xs font-bold tracking-widest uppercase">
                        New Sanctuary Entry
                      </p>
                      <p className="text-[10px] mt-2 opacity-60 max-w-[180px] text-center">
                        Top-down mastery template for complex subjects
                      </p>
                    </button>
                  )}

                  {displayedNotes.length === 0 && activeTab === "review" && (
                    <p className="text-zinc-400 text-center mt-20 col-span-2">
                      No notes in review queue yet.
                    </p>
                  )}
                  {displayedNotes.length === 0 && activeTab === "pinned" && (
                    <p className="text-zinc-400 text-center mt-20 col-span-2">
                      No pinned notes yet. Click the bookmark icon on any note to pin it.
                    </p>
                  )}
                  {displayedNotes.length === 0 && activeTab === "all" && (
                    <p className="text-zinc-400 text-center mt-20 col-span-2">
                      No notes found. Create your first note!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating selection bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 glass-card border-indigo-200 text-indigo-900 py-3 md:py-4 px-4 md:px-8 flex flex-wrap md:flex-nowrap items-center justify-center gap-4 md:gap-6 z-50 w-[90%] md:w-auto rounded-3xl">
          <span className="text-xs md:text-sm font-medium whitespace-nowrap">
            {selectedIds.length} notes selected
          </span>
          <div className="h-4 w-[1px] bg-indigo-200" />
          {showTagInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Enter tag..."
                className="neu-inset text-indigo-900 placeholder-indigo-400/60 text-sm px-3 py-1 outline-none w-32"
                autoFocus
              />
              <button
                onClick={handleAddTag}
                className="text-sm neu-btn px-3 py-1 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowTagInput(false); setTagInput(""); }}
                className="text-sm opacity-70 hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="flex items-center gap-2 text-sm hover:text-indigo-600 transition-colors"
            >
              <BookmarkCheck size={16} /> Add Tag
            </button>
          )}
          <button
            onClick={handleReviewQueue}
            className="flex items-center gap-2 text-sm hover:text-indigo-600 transition-colors"
          >
            <CheckSquare size={16} /> Review Queue
          </button>
          <X
            size={20}
            className="ml-4 cursor-pointer opacity-70 hover:opacity-100 transition-opacity text-slate-500"
            onClick={clearSelection}
          />
        </div>
      )}

      <NewNote
        isOpen={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
        isSanctuaryMode={isSanctuaryMode}
        onSaved={handleNoteSaved}
      />

      {/* EditNote — was completely missing from the JSX */}
      {isEditOpen && editingNote && (
        <EditNote
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setEditingNote(null); }}
          note={editingNote}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
};

export default NotesPage;