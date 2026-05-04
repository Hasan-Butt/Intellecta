import React from "react";
import { Bookmark, Calendar, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { togglePin, deleteNote } from "../../services/notesService";

const NoteCard = ({ note, onRefresh, isSelected, onSelect, onEdit }) => {
  const handlePin = async (e) => {
    e.stopPropagation();
    try {
      await togglePin(note.id);
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    try {
      await deleteNote(note.id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(note);
  };

  return (
    <div
      onClick={() => onSelect(note.id)}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group relative bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all border flex flex-col min-h-[320px] cursor-pointer",
        isSelected
          ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20"
          : "border-zinc-50",
      )}
    >
      {/* Category badge + actions */}
      <div className="flex justify-between items-start mb-6">
        <span
          className={cn(
            "px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase",
            note.categoryColor,
          )}
        >
          {note.category}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
          <Bookmark
            onClick={handlePin}
            className={cn(
              "h-5 w-5 transition-colors cursor-pointer",
              note.isPinned
                ? "fill-[#7C3AED] text-[#7C3AED]"
                : "text-zinc-300 group-hover:text-zinc-400",
            )}
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-zinc-900 mb-3 leading-tight">
        {note.title}
      </h3>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#F5F3FF] text-[#7C3AED] px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#DDD6FE]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Content preview — dangerouslySetInnerHTML to render bold/italic/images */}
      <div
        className="text-zinc-500 leading-relaxed mb-8 line-clamp-3 flex-grow text-sm"
        dangerouslySetInnerHTML={{ __html: note.content || "" }}
      />

      {/* Footer */}
      <div className="pt-6 border-t border-zinc-50 space-y-2 mt-auto">
        <p className="text-[11px] text-zinc-400 font-medium italic">
          From: {note.source || "Personal Note"}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-zinc-400 text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {note.createdAt
              ? new Date(note.createdAt).toLocaleDateString()
              : ""}
          </div>
          <div className="flex items-center gap-2">
            {note.updatedAt && note.updatedAt !== note.createdAt && (
              <span className="text-[10px] text-zinc-400 italic">
                edited{" "}
                {new Date(note.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {note.isPinned && (
              <span className="bg-purple-50 text-[#7C3AED] text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter">
                PINNED
              </span>
            )}
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                note.category === "ADVANCED_PHYSICS"
                  ? "bg-purple-400"
                  : note.category === "MACROECONOMICS"
                    ? "bg-blue-400"
                    : note.category === "COMP_SCI"
                      ? "bg-indigo-400"
                      : note.category === "WORLD_HISTORY"
                        ? "bg-green-400"
                        : note.category === "LITERATURE"
                          ? "bg-rose-400"
                          : "bg-zinc-400",
              )}
            />
          </div>
        </div>
      </div>

      {/* Double-click hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-zinc-300 tracking-wider">
          double-click to edit
        </span>
      </div>
    </div>
  );
};

export default NoteCard;