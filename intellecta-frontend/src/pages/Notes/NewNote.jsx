import React, { useState, useEffect, useRef } from "react";
import {
  Maximize2,
  Trash2,
  ChevronDown,
  Tag,
  Image as ImageIcon,
  Check,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { createNote } from "../../services/notesService";

const NewNote = ({ isOpen, onClose, isSanctuaryMode = false, onSaved }) => {
  const [title, setTitle] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [category, setCategory] = useState("Select Category");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);

  const categories = [
    "Advanced Physics",
    "Macroeconomics",
    "Comp Sci",
    "World History",
    "Literature",
  ];

  const categoryMap = {
    "Advanced Physics": "ADVANCED_PHYSICS",
    Macroeconomics: "MACROECONOMICS",
    "Comp Sci": "COMP_SCI",
    "World History": "WORLD_HISTORY",
    Literature: "LITERATURE",
  };

  useEffect(() => {
    if (isOpen) {
      if (isSanctuaryMode) {
        setTitle("New Sanctuary Entry");
        setTags(["Mastery"]);
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = `Cognitive Sanctuary: [Topic Name]<br>Scholar Level Objective: Describe the one sentence "Big Idea" you are mastering.<br><br>1. The Core Thesis (The "Anchor")<br>Define the subject in its most essential form. What is the fundamental truth of this topic?<br><br>2. High-Level Concepts (The "Building Blocks")<br>Concept A: [Name &amp; Brief Definition]<br>Concept B: [Name &amp; Brief Definition]<br>Concept C: [Name &amp; Brief Definition]<br><br>3. Key Equations or Frameworks<br>Primary Tool: [Insert Formula or Logic Chain here]<br><br>4. Upload<br>[Upload an image or Diagram as a flash card for this topic]`;
          }
        }, 0);
      } else {
        setTitle("");
        setTags([]);
        setCategory("Select Category");
        setImagePreview(null);
        setActiveFormats({ bold: false, italic: false });
        setTimeout(() => {
          if (editorRef.current) editorRef.current.innerHTML = "";
        }, 0);
      }
    }
  }, [isOpen, isSanctuaryMode]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedSelectionRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
    });
  };

  const handleBold = () => {
    restoreSelection();
    document.execCommand("bold", false, null);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const handleItalic = () => {
    restoreSelection();
    document.execCommand("italic", false, null);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      restoreSelection();
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${ev.target.result}" style="max-width:100%;border-radius:12px;margin:8px 0;" />`,
      );
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
      setIsAddingTag(false);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    const htmlContent = editorRef.current?.innerHTML || "";
    try {
      await createNote({
        title,
        content: htmlContent,
        category: categoryMap[category] || null,
        tags,
        isPinned: false,
        isSpecial: isSanctuaryMode,
        flaggedForReview: false,
        source:
          category !== "Select Category"
            ? `${category} Study Session`
            : "Personal Note",
      });
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Could not save note.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-300",
        isMaximized ? "p-0" : "p-4",
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white shadow-2xl overflow-hidden flex flex-col relative transition-all duration-300 ease-in-out",
          isMaximized
            ? "w-full h-full rounded-none"
            : "w-full max-w-2xl rounded-[3rem] h-auto max-h-[90vh]",
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(false);
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-10 pt-10 pb-4 shrink-0">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#7C3AED] uppercase">
            {isSanctuaryMode ? "Sanctuary Entry" : "Focused Editing"}
          </span>
          <div className="flex items-center gap-5 text-zinc-400">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className={cn(
                "transition-colors",
                isMaximized ? "text-[#7C3AED]" : "hover:text-zinc-600",
              )}
            >
              <Maximize2 size={20} />
            </button>
            <button onClick={onClose} className="hover:text-red-500">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className={cn(
            "px-12 pb-8 space-y-6 overflow-y-auto scrollbar-hide",
            isMaximized ? "flex-grow" : "max-h-[75vh]",
          )}
        >
          <input
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold text-zinc-900 outline-none placeholder:text-zinc-200"
          />

          {/* Category */}
          <div className="space-y-4">
            <div className="relative inline-block text-left">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-100 p-2.5 rounded-xl">
                  <div className="grid grid-cols-2 gap-[2px]">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-[1px]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-[1px]" />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-[1px]" />
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
                  <ChevronDown
                    size={16}
                    className={cn(
                      "transition-transform",
                      isDropdownOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
              {isDropdownOpen && (
                <div className="absolute left-14 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[110] py-2">
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
                      {category === cat && (
                        <Check size={14} className="text-purple-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
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
                    className="text-[#7C3AED] text-xs font-bold px-2 hover:underline"
                  >
                    + Add Tag
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 py-3 px-6 bg-zinc-50/80 rounded-2xl text-zinc-400 border border-zinc-100 w-fit">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleBold();
              }}
              title="Bold"
              className={cn(
                "transition-colors font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg",
                activeFormats.bold
                  ? "bg-purple-100 text-[#7C3AED]"
                  : "hover:bg-purple-50 hover:text-[#7C3AED]",
              )}
            >
              B
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleItalic();
              }}
              title="Italic"
              className={cn(
                "transition-colors italic text-base w-8 h-8 flex items-center justify-center rounded-lg",
                activeFormats.italic
                  ? "bg-purple-100 text-[#7C3AED]"
                  : "hover:bg-purple-50 hover:text-[#7C3AED]",
              )}
            >
              I
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              title="Insert image"
              className="hover:text-[#7C3AED] transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50"
            >
              <ImageIcon size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="relative w-fit">
              <img
                src={imagePreview}
                alt="preview"
                className="max-h-48 rounded-2xl border border-zinc-200 shadow-sm"
              />
              <button
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-zinc-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Rich text editor */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onMouseUp={() => { saveSelection(); updateActiveFormats(); }}
            onKeyUp={() => { saveSelection(); updateActiveFormats(); }}
            onSelect={() => { saveSelection(); updateActiveFormats(); }}
            className="w-full min-h-[240px] text-zinc-600 text-lg leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-300"
            style={{ whiteSpace: "pre-wrap" }}
            data-placeholder="Start typing your thoughts..."
          />
        </div>

        {/* Footer */}
        <div
          className={cn(
            "px-10 pb-10 pt-4 shrink-0",
            isMaximized ? "mt-auto" : "",
          )}
        >
          <Button
            onClick={handleSave}
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