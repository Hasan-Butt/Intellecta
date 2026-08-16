import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  X,
  Video,
  Tag,
  Link,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../services/api";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/Sidebar";

// ─── Inline YouTube icon ──────────────────────────────────────────────────────
function YoutubeIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M23.498 6.186a2.998 2.998 0 0 0-2.11-2.122C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.388.564A2.998 2.998 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.998 2.998 0 0 0 2.11 2.122C4.495 20.5 12 20.5 12 20.5s7.505 0 9.388-.564a2.998 2.998 0 0 0 2.11-2.122C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function YoutubeThumbnail({ videoId, title }) {
  return (
    <div className="relative w-full aspect-video rounded-t-2xl overflow-hidden bg-gray-100">
      {videoId ? (
        <img
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <YoutubeIcon size={32} className="text-gray-300" />
        </div>
      )}
      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Resource Links Editor ────────────────────────────────────────────────────
function ResourceLinksEditor({ links, onChange }) {
  function addLink() {
    onChange([...links, { label: "", url: "" }]);
  }

  function removeLink(idx) {
    onChange(links.filter((_, i) => i !== idx));
  }

  function updateLink(idx, field, value) {
    const updated = links.map((l, i) =>
      i === idx ? { ...l, [field]: value } : l
    );
    onChange(updated);
  }

  return (
    <div>
      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
        Resource Links{" "}
        <span className="normal-case font-bold tracking-normal text-gray-300">
          (optional)
        </span>
      </label>

      {links.length > 0 && (
        <div className="space-y-2 mb-2">
          {links.map((link, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Label (e.g. Lecture Slides)"
                value={link.label}
                onChange={(e) => updateLink(idx, "label", e.target.value)}
                className="w-2/5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]/40 transition-all"
              />
              <input
                type="url"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(idx, "url", e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]/40 transition-all"
              />
              <button
                type="button"
                onClick={() => removeLink(idx)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addLink}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C5DD3] hover:text-[#5d4fc7] hover:bg-[#6C5DD3]/5 px-3 py-1.5 rounded-lg border border-[#6C5DD3]/20 transition-colors"
      >
        <Plus size={12} />
        Add Resource
      </button>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function LectureModal({ open, onClose, onSaved, editingLecture }) {
  const isEdit = !!editingLecture;

  const [form, setForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    topic: "",
    orderIndex: 0,
    resourceLinks: [],
  });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setForm({
          title: editingLecture.title,
          description: editingLecture.description || "",
          youtubeUrl: editingLecture.youtubeUrl,
          topic: editingLecture.topic || "",
          orderIndex: editingLecture.orderIndex ?? 0,
          resourceLinks: editingLecture.resourceLinks || [],
        });
        setPreview(editingLecture.youtubeVideoId);
      } else {
        setForm({ title: "", description: "", youtubeUrl: "", topic: "", orderIndex: 0, resourceLinks: [] });
        setPreview(null);
      }
      setError("");
    }
  }, [open, editingLecture, isEdit]);

  function handleUrlChange(e) {
    const url = e.target.value;
    setForm((f) => ({ ...f, youtubeUrl: url }));
    setPreview(extractVideoId(url));
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.youtubeUrl.trim()) return setError("YouTube URL is required.");
    if (!extractVideoId(form.youtubeUrl))
      return setError("Couldn't extract a video ID from that URL. Check the link.");

    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await api.put(`/admin/lectures/${editingLecture.id}`, form);
      } else {
        await api.post("/admin/lectures", form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-black text-gray-900">
            {isEdit ? "Edit Lecture" : "Add New Lecture"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-7 py-6 space-y-5 overflow-y-auto flex-1">
          {/* YouTube URL + preview */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              YouTube URL
            </label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtubeUrl}
              onChange={handleUrlChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]/40 transition-all"
            />
            {preview && (
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                <YoutubeThumbnail videoId={preview} title={form.title} />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Lecture 1: Introduction to OOP"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]/40 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Description{" "}
              <span className="normal-case font-bold tracking-normal text-gray-300">
                (optional — Enter for new line)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="What will students learn in this lecture?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]/40 transition-all resize-y"
            />
          </div>

          {/* Topic + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Topic <span className="normal-case font-bold tracking-normal text-gray-300">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DSA, OOP, Networking"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Order #
              </label>
              <input
                type="number"
                min={0}
                value={form.orderIndex}
                onChange={(e) =>
                  setForm((f) => ({ ...f, orderIndex: Number(e.target.value) }))
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 focus:border-[#6C5DD3]/40 transition-all"
              />
            </div>
          </div>

          {/* Resource Links */}
          <ResourceLinksEditor
            links={form.resourceLinks}
            onChange={(links) => setForm((f) => ({ ...f, resourceLinks: links }))}
          />

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-[#6C5DD3] hover:bg-[#5d4fc7] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-100"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Lecture"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lecture Card ─────────────────────────────────────────────────────────────
function LectureCard({ lecture, onEdit, onDelete, onTogglePublish }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleDelete() {
    const result = await Swal.fire({
      title: "Delete lecture?",
      text: `"${lecture.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "swal-rounded",
      },
    });
    if (!result.isConfirmed) return;
    setDeleting(true);
    await onDelete(lecture.id);
    setDeleting(false);
  }

  async function handleToggle() {
    setToggling(true);
    await onTogglePublish(lecture.id);
    setToggling(false);
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#6C5DD3]/20 transition-all group">
      <YoutubeThumbnail videoId={lecture.youtubeVideoId} title={lecture.title} />

      <div className="p-5">
        {/* Status + Order */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${
              lecture.published
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}
          >
            {lecture.published ? "Published" : "Draft"}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            #{lecture.orderIndex}
          </span>
          {lecture.resourceLinks?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
              <Link size={9} />
              {lecture.resourceLinks.length} link{lecture.resourceLinks.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <h3 className="text-sm font-black text-gray-900 leading-snug mb-1 line-clamp-2">
          {lecture.title}
        </h3>
        {lecture.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2 font-medium leading-relaxed">
            {lecture.description}
          </p>
        )}
        {lecture.topic && (
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-[#6C5DD3]/10 text-[#6C5DD3] mb-3">
            <Tag size={9} />{lecture.topic}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={lecture.published ? "Unpublish" : "Publish"}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 ${
              lecture.published
                ? "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
            }`}
          >
            {lecture.published ? <EyeOff size={13} /> : <Eye size={13} />}
            {lecture.published ? "Unpublish" : "Publish"}
          </button>

          <button
            onClick={() => onEdit(lecture)}
            title="Edit"
            className="p-2 text-gray-400 hover:text-[#6C5DD3] bg-gray-50 hover:bg-[#6C5DD3]/10 border border-gray-100 rounded-xl transition-colors"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminLecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [error, setError] = useState("");

  function fetchLectures() {
    setLoadingLectures(true);
    api
      .get("/admin/lectures")
      .then((res) => setLectures(res.data))
      .catch(() => setError("Failed to load lectures."))
      .finally(() => setLoadingLectures(false));
  }

  useEffect(() => { fetchLectures(); }, []);

  function handleEdit(lecture) {
    setEditingLecture(lecture);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingLecture(null);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/admin/lectures/${id}`);
      setLectures((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError("Failed to delete lecture.");
    }
  }

  async function handleTogglePublish(id) {
    try {
      const res = await api.patch(`/admin/lectures/${id}/toggle-publish`);
      setLectures((prev) => prev.map((l) => (l.id === id ? res.data : l)));
    } catch {
      setError("Failed to update lecture.");
    }
  }

  const publishedCount = lectures.filter((l) => l.published).length;

  return (
    <>
      {/* SweetAlert2 rounded popup style */}
      <style>{`.swal-rounded { border-radius: 1.5rem !important; }`}</style>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <div className="flex min-h-screen bg-[#F9FAFB] font-inter">
          <Sidebar />

          <main className="flex-1 p-10 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto">

              {/* ── Page Header ── */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    Video Lectures
                  </h1>
                  <p className="text-gray-400 text-sm font-bold mt-1">
                    Add YouTube lectures, tag them by topic, and attach resources.
                  </p>
                </div>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#6C5DD3] hover:bg-[#5d4fc7] text-white text-sm font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-100"
                >
                  <Plus size={16} />
                  Add Lecture
                </button>
              </div>

              {/* ── Error Banner ── */}
              {error && (
                <div className="mb-6 text-red-500 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm font-bold">
                  {error}
                </div>
              )}

              {/* ── Stats Row ── */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Lectures</p>
                  <p className="text-3xl font-black text-gray-900">{lectures.length}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Published</p>
                  <p className="text-3xl font-black text-emerald-600">{publishedCount}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Drafts</p>
                  <p className="text-3xl font-black text-amber-500">{lectures.length - publishedCount}</p>
                </div>
              </div>

              {/* ── Lecture Grid ── */}
              {loadingLectures ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="aspect-video bg-gray-100 animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
                        <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : lectures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                  <div className="w-16 h-16 rounded-2xl bg-[#6C5DD3]/10 flex items-center justify-center mb-4">
                    <Video size={28} className="text-[#6C5DD3]/50" />
                  </div>
                  <h3 className="text-base font-black text-gray-700 mb-1">No lectures yet</h3>
                  <p className="text-gray-400 text-xs font-medium mb-5 max-w-xs">Paste a YouTube link to add the first one.</p>
                  <button onClick={handleAdd} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#6C5DD3] hover:bg-[#5d4fc7] text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-100">
                    <Plus size={14} /> Add first lecture
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {lectures.map((lecture) => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePublish={handleTogglePublish}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ── Modal ── */}
        <LectureModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingLecture(null); }}
          onSaved={fetchLectures}
          editingLecture={editingLecture}
        />
      </div>
    </>
  );
}