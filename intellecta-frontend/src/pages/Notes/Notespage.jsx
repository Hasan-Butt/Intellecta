import React, { useState } from "react";
import {
  Search,
  Plus,
  BookmarkCheck,
  X,
  FileEdit,
  CheckSquare,
} from "lucide-react";

import NoteCard from "../../components/ui/NoteCard";
import NewNote from "./NewNote";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";

// HARDCODED DATA
const INTERNAL_MOCK_NOTES = [
  {
    id: 1,
    category: "ADVANCED PHYSICS",
    categoryColor: "text-purple-600 bg-purple-50",
    title: "Quantum Mechanics: Schrödinger's Equation",
    description:
      "Deriving the wave function for a particle in a box. Understanding the probability distribution and normalization conditions...",
    source: "Advanced Physics Study Session",
    date: "Oct 12, 2023",
    isPinned: false,
    isSpecial: false,
    dotColor: "bg-purple-400",
  },
  {
    id: 2,
    category: "MACROECONOMICS",
    categoryColor: "text-blue-600 bg-blue-50",
    title: "Monetary Policy & Inflation Targets",
    description:
      "Examining the impact of interest rate shifts on consumer spending and long-term investment cycles in emerging markets...",
    source: "Macroeconomics Study Session",
    date: "Oct 14, 2023",
    isPinned: true,
    isSpecial: false,
    dotColor: "bg-blue-400",
  },
  {
    id: 3,
    category: "COMP SCI",
    categoryColor: "text-indigo-600 bg-indigo-50",
    title: "Big O Notation & Algorithm Complexity",
    description:
      "Comparing O(n log n) and O(n^2) algorithms in practical scenarios. Focus on quicksort vs bubble sort implementations...",
    source: "Computer Science Study Session",
    date: "Yesterday",
    isPinned: false,
    isSpecial: true,
    dotColor: "bg-indigo-400",
  },
  {
    id: 4,
    category: "WORLD HISTORY",
    categoryColor: "text-orange-600 bg-orange-50",
    title: "The Silk Road: Cultural Exchange",
    description:
      "Mapping the trade routes between Xi'an and Antioch. Spread of technology, religion, and philosophy during the Tang Dynasty...",
    source: "World History Study Session",
    date: "Oct 15, 2023",
    isPinned: false,
    isSpecial: false,
    dotColor: "bg-green-400",
  },
  {
    id: 5,
    category: "LITERATURE",
    categoryColor: "text-rose-600 bg-rose-50",
    title: "Post-Modernist Themes in Ulysses",
    description:
      "Stream of consciousness and the subversion of classical epic structures. Key analysis of the 'Penelope' chapter...",
    source: "Literature Study Session",
    date: "2h ago",
    isPinned: false,
    isSpecial: false,
    dotColor: "bg-rose-400",
  },
];

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // STATE TO CONTROL MODAL AND ITS TYPE
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isSanctuaryMode, setIsSanctuaryMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    <div className="flex-1 flex flex-col min-w-0">
      {/* 2. Navbar */}
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        {/* 1. Sidebar */}
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-12 py-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 gap-4">
              <div className="space-y-1">
                <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
                  All Notes
                </h1>
                <p className="text-zinc-500 text-lg">
                  Organize your thoughts and fuel your intellect.
                </p>
              </div>

              {/* ORIGINAL FUNCTIONALITY: Standard New Note */}
              <Button
                onClick={() => openModal(false)}
                className="bg-[#7C3AED] text-white px-6 py-6 rounded-xl shadow-lg transition-all hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5" /> New Note
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 py-7 bg-white border-none rounded-2xl shadow-sm text-lg"
              />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}

              {/* NEW SANCTUARY ENTRY: This specifically triggers the template */}
              <button
                onClick={() => openModal(true)}
                className="border-2 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-zinc-400 min-h-[320px] bg-zinc-50/30 hover:bg-zinc-50 transition-all group"
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
            </div>
          </div>
        </main>

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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#6D28D9] text-white py-4 px-8 rounded-[2.2rem] shadow-2xl flex items-center gap-6 z-50">
          <span className="text-sm">3 notes selected</span>
          <div className="h-4 w-[1px] bg-white/20" />
          <button className="flex items-center gap-2 text-sm">
            <BookmarkCheck size={16} /> Add Tag
          </button>
          <button className="flex items-center gap-2 text-sm">
            <CheckSquare size={16} /> Review Queue
          </button>
          <X size={20} className="ml-4 cursor-pointer" />
        </div>
      </div>

      {/* RENDER NEWNOTE MODAL */}
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
