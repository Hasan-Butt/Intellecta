import React from "react";
import { Bookmark, Calendar } from "lucide-react";
import { cn } from "../../lib/utils"; 

const NoteCard = ({ note }) => {
  return (
    <div className="group relative bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all border border-zinc-50 flex flex-col min-h-[320px]">
      <div className="flex justify-between items-start mb-6">
        <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase", note.categoryColor)}>
          {note.category}
        </span>
        <Bookmark className={cn("h-5 w-5 transition-colors", note.isSpecial ? "fill-[#7C3AED] text-[#7C3AED]" : "text-zinc-300 group-hover:text-zinc-400")} />
      </div>
      
      <h3 className="text-xl font-bold text-zinc-900 mb-3 leading-tight">{note.title}</h3>
      <p className="text-zinc-500 leading-relaxed mb-8 line-clamp-3 flex-grow">{note.description}</p>
      
      <div className="pt-6 border-t border-zinc-50 space-y-2 mt-auto">
        <p className="text-[11px] text-zinc-400 font-medium italic">From: {note.source}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-zinc-400 text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {note.date}
          </div>
          <div className="flex items-center gap-2">
            {note.isPinned && (
              <span className="bg-purple-50 text-[#7C3AED] text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter">PINNED</span>
            )}
            <div className={cn("h-2 w-2 rounded-full", note.dotColor)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;