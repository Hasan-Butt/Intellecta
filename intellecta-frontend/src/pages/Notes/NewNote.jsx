import React, { useState, useEffect } from "react";
import { 
  Maximize2, Share2, Trash2, ChevronDown, Tag, 
  Bold, Italic, List, Link, Image as ImageIcon, Check, X 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

const NewNote = ({ isOpen, onClose, isSanctuaryMode = false }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [category, setCategory] = useState("Select Category");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // --- THE ONLY ADDITION: RESET LOGIC ON OPEN ---
  useEffect(() => {
    if (isOpen) {
      if (isSanctuaryMode) {
        setTitle("New Sanctuary Entry");
        setContent(
`Cognitive Sanctuary: [Topic Name]
Scholar Level Objective: Describe the one sentence "Big Idea" you are mastering.

1. The Core Thesis (The "Anchor")
Define the subject in its most essential form. What is the fundamental truth of this topic?

2. High-Level Concepts (The "Building Blocks")
Concept A: [Name & Brief Definition]
Concept B: [Name & Brief Definition]
Concept C: [Name & Brief Definition]

3. Key Equations or Frameworks
Primary Tool: [Insert Formula or Logic Chain here]

4. Upload 
[Upload an image or Diagram as a flash card for this topic]`
        );
        setTags(["Mastery"]);
      } else {
        // This ensures the "New Note" button always shows empty fields
        setTitle("");
        setContent("");
        setTags([]);
        setCategory("Select Category");
      }
    }
  }, [isOpen, isSanctuaryMode]);

  const categories = [
    "Advanced Physics",
    "Macroeconomics",
    "Comp Sci",
    "World History",
    "Literature"
  ];

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
      setIsAddingTag(false);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300",
        isMaximized ? "p-0" : "p-4"
      )}
      onClick={onClose} 
    >
      <div 
        className={cn(
          "bg-white shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out",
          isMaximized 
            ? "w-full h-full rounded-none" 
            : "w-full max-w-2xl rounded-[3rem] h-auto max-h-[90vh]"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(false); 
        }} 
      >
        {/* Header */}
        <div className="flex justify-between items-center px-10 pt-10 pb-4">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#7C3AED] uppercase">
            {isSanctuaryMode ? "Sanctuary Entry" : "Focused Editing"}
          </span>
          <div className="flex items-center gap-5 text-zinc-400">
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className={cn("transition-colors", isMaximized ? "text-[#7C3AED]" : "hover:text-zinc-600")}
            >
              <Maximize2 size={20} />
            </button>
            <button className="hover:text-zinc-600"><Share2 size={20} /></button>
            <button onClick={onClose} className="hover:text-red-500"><Trash2 size={20} /></button>
          </div>
        </div>

        <div className={cn(
          "px-12 pb-8 space-y-6 overflow-y-auto scrollbar-hide transition-all",
          isMaximized ? "flex-grow" : "max-h-[75vh]"
        )}>
          {/* Title Input */}
          <input 
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold text-zinc-900 outline-none placeholder:text-zinc-200"
          />

          <div className="space-y-4">
            <div className="relative inline-block text-left">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-100 p-2.5 rounded-xl">
                  <div className="grid grid-cols-2 gap-[2px]">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-[1px]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-[1px]"></div>
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-[1px]"></div>
                  </div>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 px-5 py-2.5 rounded-2xl text-sm font-semibold text-zinc-700 transition-all"
                >
                  {category} 
                  <ChevronDown size={16} className={cn("transition-transform", isDropdownOpen && "rotate-180")} />
                </button>
              </div>

              {isDropdownOpen && (
                <div className="absolute left-14 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[110] py-2 animate-in fade-in zoom-in-95 duration-200">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      {cat}
                      {category === cat && <Check size={14} className="text-purple-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Tag size={20} className="text-zinc-300 ml-2" />
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="bg-[#F5F3FF] text-[#7C3AED] px-3 py-1 rounded-full text-xs font-bold border border-[#DDD6FE] flex items-center gap-1.5"
                  >
                    #{tag}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-red-500" 
                      onClick={() => removeTag(tag)}
                    />
                  </span>
                ))}
                
                {isAddingTag ? (
                  <input
                    autoFocus
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    onBlur={() => setIsAddingTag(false)}
                    className="outline-none border-b border-purple-400 text-xs py-0.5 w-20 bg-transparent text-zinc-600 font-medium"
                    placeholder="tag..."
                  />
                ) : (
                  <button 
                    onClick={() => setIsAddingTag(true)}
                    className="text-[#7C3AED] text-xs font-bold px-2 hover:underline transition-all active:scale-95"
                  >
                    + Add Tag
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 py-4 px-8 bg-zinc-50/80 rounded-2xl text-zinc-400 border border-zinc-100">
            <Bold size={20} className="cursor-pointer hover:text-[#7C3AED]" />
            <Italic size={20} className="cursor-pointer hover:text-[#7C3AED]" />
            <List size={20} className="cursor-pointer hover:text-[#7C3AED]" />
            <Link size={20} className="cursor-pointer hover:text-[#7C3AED]" />
            <ImageIcon size={20} className="cursor-pointer hover:text-[#7C3AED]" />
          </div>

          <textarea 
            placeholder="Start typing your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 text-zinc-600 text-lg leading-relaxed outline-none resize-none placeholder:text-zinc-300"
          />
        </div>

        <div className={cn(
          "px-10 pb-10 pt-4 transition-all",
          isMaximized ? "mt-auto" : ""
        )}>
          <Button 
            onClick={onClose}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-8 rounded-[1.8rem] text-xl font-bold shadow-xl transition-all"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewNote;