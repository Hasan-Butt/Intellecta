import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, ChevronDown, X } from "lucide-react";
import api from "../../services/api";

// Inline YouTube icon (lucide-react no longer exports 'Youtube')
function Youtube({ size = 24, className = "" }) {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractVideoId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function YoutubeThumbnail({ videoId, title }) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
      {videoId ? (
        <img
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Youtube size={32} className="text-gray-600" />
        </div>
      )}
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

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function LectureModal({ open, onClose, onSaved, courses, editingLecture }) {
  const isEdit = !!editingLecture;

  const [form, setForm] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    courseId: "",
    orderIndex: 0,
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
          courseId: editingLecture.courseId,
          orderIndex: editingLecture.orderIndex ?? 0,
        });
        setPreview(editingLecture.youtubeVideoId);
      } else {
        setForm({ title: "", description: "", youtubeUrl: "", courseId: courses[0]?.id ?? "", orderIndex: 0 });
        setPreview(null);
      }
      setError("");
    }
  }, [open, editingLecture, courses, isEdit]);

  function handleUrlChange(e) {
    const url = e.target.value;
    setForm((f) => ({ ...f, youtubeUrl: url }));
    const id = extractVideoId(url);
    setPreview(id);
  }

  async function handleSubmit() {
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.youtubeUrl.trim()) return setError("YouTube URL is required.");
    if (!extractVideoId(form.youtubeUrl)) return setError("Couldn't extract a video ID from that URL. Check the link.");
    if (!form.courseId) return setError("Select a course.");

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
      setError(err.response?.data?.message || err.response?.data || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">
            {isEdit ? "Edit Lecture" : "Add Lecture"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* YouTube URL + preview */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">YouTube URL</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.youtubeUrl}
              onChange={handleUrlChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {preview && (
              <div className="mt-3">
                <YoutubeThumbnail videoId={preview} title={form.title} />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Title</label>
            <input
              type="text"
              placeholder="e.g. Lecture 1: Introduction to OOP"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
            <textarea
              rows={2}
              placeholder="What will students learn in this lecture?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Course + Order row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Course</label>
              <div className="relative">
                <select
                  value={form.courseId}
                  onChange={(e) => setForm((f) => ({ ...f, courseId: Number(e.target.value) }))}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors pr-8"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#1a1a2e]">
                      {c.courseName}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Order #</label>
              <input
                type="number"
                min={0}
                value={form.orderIndex}
                onChange={(e) => setForm((f) => ({ ...f, orderIndex: Number(e.target.value) }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors"
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
    if (!window.confirm(`Delete "${lecture.title}"? This cannot be undone.`)) return;
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
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
      <YoutubeThumbnail videoId={lecture.youtubeVideoId} title={lecture.title} />

      <div className="p-4">
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            lecture.published
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
              : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
          }`}>
            {lecture.published ? "Published" : "Draft"}
          </span>
          <span className="text-xs text-gray-600">#{lecture.orderIndex}</span>
        </div>

        <h3 className="text-white font-medium text-sm leading-snug mb-1 line-clamp-2">
          {lecture.title}
        </h3>
        {lecture.description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3">{lecture.description}</p>
        )}
        <p className="text-indigo-400 text-xs mb-3">{lecture.courseName}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/5">
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={lecture.published ? "Unpublish" : "Publish"}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            {lecture.published ? <EyeOff size={13} /> : <Eye size={13} />}
            {lecture.published ? "Unpublish" : "Publish"}
          </button>

          <button
            onClick={() => onEdit(lecture)}
            title="Edit"
            className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
            className="p-1.5 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
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
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [error, setError] = useState("");

  // Load all courses once (admin sees all courses — adjust endpoint if yours differs)
  useEffect(() => {
    api.get("/courses")
      .then((res) => {
        setCourses(res.data);
        if (res.data.length > 0) setSelectedCourseId(res.data[0].id);
      })
      .catch(() => setError("Failed to load courses."));
  }, []);

  // Load lectures whenever the selected course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    setLoadingLectures(true);
    api.get(`/admin/lectures/course/${selectedCourseId}`)
      .then((res) => setLectures(res.data))
      .catch(() => setError("Failed to load lectures."))
      .finally(() => setLoadingLectures(false));
  }, [selectedCourseId]);

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

  function handleSaved() {
    // Reload the current course's lectures after save
    if (!selectedCourseId) return;
    api.get(`/admin/lectures/course/${selectedCourseId}`)
      .then((res) => setLectures(res.data))
      .catch(() => {});
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Video Lectures</h1>
            <p className="text-gray-500 text-sm mt-1">Add YouTube lectures and assign them to courses.</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={courses.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
          >
            <Plus size={16} />
            Add Lecture
          </button>
        </div>

        {error && (
          <div className="mb-6 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── Course Tabs ── */}
        {courses.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourseId(c.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCourseId === c.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {c.courseName}
              </button>
            ))}
          </div>
        )}

        {/* ── Empty state: no courses ── */}
        {courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Youtube size={28} className="text-gray-600" />
            </div>
            <h3 className="text-white font-medium mb-1">No courses yet</h3>
            <p className="text-gray-500 text-sm">Create a course first, then add lectures to it.</p>
          </div>
        )}

        {/* ── Lecture grid ── */}
        {selectedCourse && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-300 font-medium text-sm">
                {selectedCourse.courseName}
                <span className="text-gray-600 ml-2">({lectures.length} lecture{lectures.length !== 1 ? "s" : ""})</span>
              </h2>
            </div>

            {loadingLectures ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 rounded-xl aspect-video animate-pulse" />
                ))}
              </div>
            ) : lectures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl">
                <Youtube size={28} className="text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium text-sm mb-1">No lectures for this course yet</p>
                <p className="text-gray-600 text-xs mb-4">Paste a YouTube link to add the first one.</p>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors"
                >
                  <Plus size={14} />
                  Add first lecture
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </>
        )}
      </div>

      {/* ── Modal ── */}
      <LectureModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLecture(null); }}
        onSaved={handleSaved}
        courses={courses}
        editingLecture={editingLecture}
      />
    </div>
  );
}