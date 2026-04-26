import React, { useState, useEffect } from "react";
import { Search, Plus, BookmarkCheck, X, FileEdit, CheckSquare, LayoutGrid, List, Filter, ChevronDown } from "lucide-react";
import NoteCard from "../../components/ui/NoteCard";
import NewNote from "./NewNote";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getAllNotes, searchNotes, flagForReview, updateNote, getReviewQueue } from "../../services/notesService";
import { cn } from "../../lib/utils";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isSanctuaryMode, setIsSanctuaryMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  // NEW STATE
  const [activeTab, setActiveTab] = useState("all"); // "all" | "review" | "pinned"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [activeTagFilters, setActiveTagFilters] = useState([]); // active tag chips
  const [showTagFilterDropdown, setShowTagFilterDropdown] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      fetchNotes();
    } else {
      handleSearch();
    }
  }, [searchQuery]);

  const fetchNotes = async () => {
    try {
      const res = await getAllNotes();
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await searchNotes(searchQuery);
      setNotes(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const openModal = (sanctuary = false) => {
    setIsSanctuaryMode(sanctuary);
    setIsNewNoteOpen(true);
  };

  const handleNoteSaved = () => {
    setIsNewNoteOpen(false);
    fetchNotes();
  };

  const handleSelect = (noteId) => {
    setSelectedIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setShowTagInput(false);
    setTagInput("");
  };

  const handleReviewQueue = async () => {
    try {
      await Promise.all(selectedIds.map(id => flagForReview(id)));
      clearSelection();
      fetchNotes();
    } catch (err) {
      console.error("Failed to flag for review:", err);
    }
  };

  const handleAddTag = async () => {
    if (!tagInput.trim()) return;
    try {
      await Promise.all(
        selectedIds.map(id => {
          const note = notes.find(n => n.id === id);
          const existingTags = note.tags || [];
          if (existingTags.includes(tagInput.trim())) return Promise.resolve();
          return updateNote(id, {
            title: note.title,
            content: note.content,
            category: note.category,
            source: note.source,
            isPinned: note.pinned,
            isSpecial: note.special,
            flaggedForReview: note.flaggedForReview,
            tags: [...existingTags, tagInput.trim()],
          });
        })
      );
      clearSelection();
      fetchNotes();
    } catch (err) {
      console.error("Failed to add tag:", err);
    }
  };

  // Collect all unique tags from all notes for the filter dropdown
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

  const toggleTagFilter = (tag) => {
    setActiveTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const removeTagFilter = (tag) => {
    setActiveTagFilters(prev => prev.filter(t => t !== tag));
  };

  // Apply tab + tag filters to notes
  const displayedNotes = notes.filter(note => {
    // Tab filter
    if (activeTab === "review" && !note.flaggedForReview) return false;
    if (activeTab === "pinned" && !note.pinned) return false;

    // Tag filter
    if (activeTagFilters.length > 0) {
      const noteTags = note.tags || [];
      if (!activeTagFilters.every(tag => noteTags.includes(tag))) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FB] md:ml-64 p-8 pb-32">
      <div className="max-w-6xl mx-auto mt-20">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">All Notes</h1>
            <p className="text-zinc-500 text-lg">Organize your thoughts and fuel your intellect.</p>
          </div>
          <Button
            onClick={() => openModal(false)}
            className="bg-[#7C3AED] text-white px-6 py-6 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" /> New Note
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search by keyword, title, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 py-7 bg-white border-none rounded-2xl shadow-sm text-lg"
          />
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between mb-8">
          {/* Left: Tabs */}
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm">
            {[
              { key: "all", label: "All Notes" },
              { key: "review", label: "Review Queue" },
              { key: "pinned", label: "Pinned" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  activeTab === tab.key
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: View toggle + Tag filter */}
          <div className="flex items-center gap-3">
            {/* Grid / List toggle */}
            <div className="flex items-center bg-white rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-zinc-100 text-zinc-800" : "text-zinc-400 hover:text-zinc-600")}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-zinc-100 text-zinc-800" : "text-zinc-400 hover:text-zinc-600")}
              >
                <List size={16} />
              </button>
            </div>

            {/* Tag filter */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
                <Filter size={14} className="text-zinc-400" />

                {/* Active tag chips */}
                {activeTagFilters.map(tag => (
                  <span
                    key={tag}
                    className="bg-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <X
                      size={10}
                      className="cursor-pointer"
                      onClick={() => removeTagFilter(tag)}
                    />
                  </span>
                ))}

                <button
                  onClick={() => setShowTagFilterDropdown(!showTagFilterDropdown)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <ChevronDown size={14} className={cn("transition-transform", showTagFilterDropdown && "rotate-180")} />
                </button>
              </div>

              {/* Tag dropdown */}
              {showTagFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[110] py-2">
                  {allTags.length === 0 ? (
                    <p className="text-xs text-zinc-400 px-4 py-2">No tags yet</p>
                  ) : (
                    allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          toggleTagFilter(tag);
                          setShowTagFilterDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                          activeTagFilters.includes(tag)
                            ? "text-[#7C3AED] bg-purple-50"
                            : "text-zinc-600 hover:bg-purple-50 hover:text-purple-700"
                        )}
                      >
                        #{tag}
                        {activeTagFilters.includes(tag) && <X size={12} />}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid / List */}
        {loading ? (
          <p className="text-zinc-400 text-center mt-20">Loading notes...</p>
        ) : (
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "flex flex-col gap-4"
          )}>
            {displayedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onRefresh={fetchNotes}
                isSelected={selectedIds.includes(note.id)}
                onSelect={handleSelect}
              />
            ))}

            {/* Only show sanctuary button on All Notes tab */}
            {activeTab === "all" && (
              <button
                onClick={() => openModal(true)}
                className="border-2 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-zinc-400 min-h-[320px] bg-zinc-50/30 hover:bg-zinc-50 transition-all group"
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <FileEdit className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase">New Sanctuary Entry</p>
                <p className="text-[10px] mt-2 opacity-60 max-w-[180px] text-center">
                  Top-down mastery template for complex subjects
                </p>
              </button>
            )}

            {/* Empty states */}
            {displayedNotes.length === 0 && activeTab === "review" && (
              <p className="text-zinc-400 text-center mt-20 col-span-2">No notes in review queue yet. Select notes and click Review Queue to add them.</p>
            )}
            {displayedNotes.length === 0 && activeTab === "pinned" && (
              <p className="text-zinc-400 text-center mt-20 col-span-2">No pinned notes yet. Click the bookmark icon on any note to pin it.</p>
            )}
          </div>
        )}

        {/* Floating Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#6D28D9] text-white py-4 px-8 rounded-[2.2rem] shadow-2xl flex items-center gap-6 z-50">
            <span className="text-sm font-semibold">
              {selectedIds.length} {selectedIds.length === 1 ? "note" : "notes"} selected
            </span>
            <div className="h-4 w-[1px] bg-white/20" />

            {showTagInput ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="tag name..."
                  className="bg-white/20 text-white placeholder:text-white/50 text-xs px-3 py-1.5 rounded-xl outline-none w-28"
                />
                <button
                  onClick={handleAddTag}
                  className="text-xs bg-white text-[#6D28D9] font-bold px-3 py-1.5 rounded-xl"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-2 text-sm hover:text-white/80 transition-colors"
              >
                <BookmarkCheck size={16} /> Add Tag
              </button>
            )}

            <div className="h-4 w-[1px] bg-white/20" />

            <button
              onClick={handleReviewQueue}
              className="flex items-center gap-2 text-sm hover:text-white/80 transition-colors"
            >
              <CheckSquare size={16} /> Review Queue
            </button>

            <X
              size={20}
              className="ml-4 cursor-pointer hover:text-white/80 transition-colors"
              onClick={clearSelection}
            />
          </div>
        )}

      </div>

      <NewNote
        isOpen={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
        isSanctuaryMode={isSanctuaryMode}
        onSaved={handleNoteSaved}
      />
    </div>
  );
};

export default NotesPage;