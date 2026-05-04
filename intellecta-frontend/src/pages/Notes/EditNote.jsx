import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Image as ImageIcon,
  Check,
  ChevronDown,
  Tag,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { updateNote } from "../../services/notesService";

const categoryMap = {
  "Advanced Physics": "ADVANCED_PHYSICS",
  Macroeconomics: "MACROECONOMICS",
  "Comp Sci": "COMP_SCI",
  "World History": "WORLD_HISTORY",
  Literature: "LITERATURE",
};

const reverseCategoryMap = Object.fromEntries(
  Object.entries(categoryMap).map(([k, v]) => [v, k]),
);

const categories = Object.keys(categoryMap);

const EditNote = ({ isOpen, onClose, note, onSaved }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Select Category");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);

  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title || "");
      setCategory(reverseCategoryMap[note.category] || "Select Category");
      setTags(note.tags || []);
      setSavedAt(note.updatedAt || null);
      setImagePreview(null);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = note.content || "";
        }
      }, 0);
    }
  }, [note, isOpen]);

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
        setTags((prev) => [...prev, tagInput.trim()]);
      }
      setTagInput("");
      setIsAddingTag(false);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const htmlContent = editorRef.current?.innerHTML || "";
    try {
      await updateNote(note.id, {
        title,
        content: htmlContent,
        category: categoryMap[category] || null,
        source: note.source,
        isPinned: note.isPinned,
        isSpecial: note.isSpecial,
        flaggedForReview: note.flaggedForReview,
        tags,
      });
      setSavedAt(new Date().toISOString());
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Failed to update note:", err);
      alert("Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full flex flex-col overflow-hidden"
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(false);
        }}
      >
        {/* Top bar */}
        <div className="flex justify-between items-center px-10 pt-8 pb-4 border-b border-zinc-100 shrink-0">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#7C3AED] uppercase">
            Editing Note
          </span>
          <div className="flex items-center gap-4">
            {savedAt && (
              <span className="text-xs text-zinc-400">
                Last saved:{" "}
                {new Date(savedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-12 py-8 space-y-6">
          <input
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold text-zinc-900 outline-none placeholder:text-zinc-200"
          />

          {/* Category */}
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen((p) => !p);
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
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-[110] py-2">
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
            <Tag size={20} className="text-zinc-300" />
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
                alt="Uploaded"
                className="max-h-64 rounded-2xl border border-zinc-200 shadow-sm"
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
            className="w-full min-h-[50vh] text-zinc-600 text-lg leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-zinc-300"
            style={{ whiteSpace: "pre-wrap" }}
            data-placeholder="Start typing your thoughts..."
          />
        </div>

        {/* Footer */}
        <div className="px-12 pb-10 pt-4 border-t border-zinc-100 shrink-0">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-8 rounded-[1.8rem] text-xl font-bold shadow-xl transition-all disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditNote;