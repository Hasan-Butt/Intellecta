import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import { createNote } from "../../services/notesService";
import {
  ChevronLeft, ChevronRight, BookOpen, Play, CheckCircle2,
  Pencil, Save, Maximize2, X, ExternalLink, Video,
} from "lucide-react";
import Swal from "sweetalert2";
import Navbar from "../../components/dashboard/Navbar";
import StudentSidebar from "../../components/dashboard/StudentSidebar";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function YoutubeIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a2.998 2.998 0 0 0-2.11-2.122C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.388.564A2.998 2.998 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.998 2.998 0 0 0 2.11 2.122C4.495 20.5 12 20.5 12 20.5s7.505 0 9.388-.564a2.998 2.998 0 0 0 2.11-2.122C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

/** Renders a description string preserving newlines as paragraphs/line-breaks. */
function DescriptionText({ text }) {
  if (!text) return <p className="text-gray-400 text-sm italic">No description available for this lecture.</p>;
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-gray-600 text-sm leading-relaxed">
          {para.split("\n").map((line, j, arr) => (
            <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
          ))}
        </p>
      ))}
    </div>
  );
}

// ─── YouTube IFrame Player ───────────────────────────────────────────────────
function YouTubePlayer({ videoId, onProgress }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const clearTracking = useCallback(() => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const startTracking = useCallback(() => {
    clearTracking();
    intervalRef.current = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        if (total > 0 && onProgress) onProgress(Math.round((current / total) * 100));
      } catch { /* player not ready */ }
    }, 5000);
  }, [clearTracking, onProgress]);

  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
    function initPlayer() {
      if (!containerRef.current) return;
      if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; }
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, fs: 1, playsinline: 1 },
        events: {
          onStateChange: (e) => {
            if (e.data === 1) startTracking();
            else clearTracking();
            if (e.data === 0 && onProgress) onProgress(100);
          },
        },
      });
    }
    if (window.YT && window.YT.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;
    return () => { clearTracking(); if (playerRef.current) { playerRef.current.destroy(); playerRef.current = null; } };
  }, [videoId, startTracking, clearTracking, onProgress]);

  return (
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

// ─── Curriculum Item ─────────────────────────────────────────────────────────
function CurriculumItem({ lecture, index, active, progress, onClick }) {
  const done = progress >= 90;
  return (
    <button onClick={() => onClick(lecture)} className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl transition-all group ${active ? "bg-[#451ebb]/10 border border-[#451ebb]/25" : "hover:bg-gray-50 border border-transparent"}`}>
      <div className="shrink-0 mt-0.5">
        {done ? <CheckCircle2 size={18} className="text-emerald-500" />
          : active ? <div className="w-4.5 h-4.5 rounded-full bg-[#451ebb] flex items-center justify-center"><Play size={9} fill="white" className="text-white ml-0.5" /></div>
          : <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug line-clamp-2 ${active ? "text-[#451ebb]" : done ? "text-gray-500 line-through decoration-gray-300" : "text-gray-700 group-hover:text-gray-900"}`}>
          {index + 1}. {lecture.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {active && <span className="text-[10px] font-bold text-[#451ebb] uppercase tracking-wider">Currently Playing</span>}
          {done && !active && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">✓ Watched</span>}
          {!done && !active && progress > 0 && <span className="text-[10px] text-indigo-500">{progress}%</span>}
        </div>
        {progress > 0 && (
          <div className="mt-1.5 h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-[#451ebb]"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Note Expand Modal ───────────────────────────────────────────────────────
function NoteModal({ open, onClose, defaultContent, lectureTitle, onSaved }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(defaultContent || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(`Lecture Note – ${lectureTitle || "Lecture"}`);
      setContent(defaultContent || "");
      setSaved(false);
      setErr("");
    }
  }, [open, defaultContent, lectureTitle]);

  async function handleSave() {
    if (!title.trim()) return setErr("Please enter a title.");
    if (!content.trim()) return setErr("Note content is empty.");
    setSaving(true);
    setErr("");
    try {
      await createNote({ title: title.trim(), content: content.trim(), source: "Lecture" });
      Swal.fire({
        title: "Note Saved!",
        text: "Your note was successfully added to the Notes tab.",
        icon: "success",
        confirmButtonColor: "#451ebb",
        timer: 2500,
        showConfirmButton: false,
      });
      if (onSaved) onSaved();
      onClose();
    } catch {
      setErr("Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-[#451ebb]" />
            <h2 className="text-base font-black text-gray-900">Save Note</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="px-7 py-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Note Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#451ebb]/20 focus:border-[#451ebb]/40 transition-all"
              placeholder="Give your note a title..."
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Content</label>
            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#451ebb]/20 focus:border-[#451ebb]/40 transition-all resize-y leading-relaxed"
              placeholder="Your notes here..."
            />
          </div>
          {err && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{err}</p>}
          {saved && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 font-bold">✓ Note saved to your Notes tab!</p>}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#451ebb] hover:bg-[#3a18cc] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200/60">
            <Save size={14} className="inline mr-2" />
            {saving ? "Saving…" : "Save to Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentLecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [error, setError] = useState("");
  const [watchProgress, setWatchProgress] = useState({});
  const lastSavedPct = useRef({});

  // Notes panel state
  const [noteText, setNoteText] = useState("");
  const [noteState, setNoteState] = useState("idle"); // "idle" | "saved"
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Load lectures + persisted progress on mount
  useEffect(() => {
    setLoadingLectures(true);
    Promise.all([api.get("/lectures"), api.get("/lectures/progress")])
      .then(([lecturesRes, progressRes]) => {
        setLectures(lecturesRes.data);
        if (lecturesRes.data.length > 0) setActiveLecture(lecturesRes.data[0]);
        // progressRes.data is Map<lectureId(string), pct>; convert keys to numbers
        const progMap = {};
        Object.entries(progressRes.data || {}).forEach(([k, v]) => { progMap[Number(k)] = v; });
        setWatchProgress(progMap);
        lastSavedPct.current = { ...progMap };
      })
      .catch(() => setError("Failed to load lectures."))
      .finally(() => setLoadingLectures(false));
  }, []);

  // Reset tab to overview when active lecture changes
  useEffect(() => { setActiveTab("overview"); }, [activeLecture?.id]);

  // Called by YouTubePlayer every 5s — throttled save: only when pct rises ≥5 or hits 100
  const handleProgress = useCallback((pct) => {
    if (!activeLecture) return;
    const id = activeLecture.id;
    setWatchProgress((prev) => {
      const existing = prev[id] ?? 0;
      if (pct <= existing) return prev;
      const next = { ...prev, [id]: pct };
      // Persist if progress jumped ≥5 points or hit 100
      const lastSaved = lastSavedPct.current[id] ?? 0;
      if (pct >= 100 || pct - lastSaved >= 5) {
        lastSavedPct.current[id] = pct;
        api.post(`/lectures/${id}/progress`, { progressPct: pct }).catch(() => {});
      }
      return next;
    });
  }, [activeLecture]);

  function goToPrev() {
    const idx = lectures.findIndex((l) => l.id === activeLecture?.id);
    if (idx > 0) setActiveLecture(lectures[idx - 1]);
  }
  function goToNext() {
    const idx = lectures.findIndex((l) => l.id === activeLecture?.id);
    if (idx < lectures.length - 1) setActiveLecture(lectures[idx + 1]);
  }

  // Quick-save from panel (opens modal)
  function handleQuickSave() {
    if (!noteText.trim()) return;
    setNoteModalOpen(true);
  }

  // Called when NoteModal successfully saves
  function handleNoteSaved() {
    setNoteState("idle");
    setNoteText("");
  }

  function handleOpenNew() {
    setNoteText("");
    setNoteState("idle");
  }

  const activeIdx = lectures.findIndex((l) => l.id === activeLecture?.id);
  const watchedCount = Object.values(watchProgress).filter((p) => p >= 90).length;
  const progressPct = lectures.length > 0 ? Math.round((watchedCount / lectures.length) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <StudentSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto">

            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Video Lectures</h1>
              <p className="text-gray-500 text-sm md:text-base mt-1 leading-relaxed">Watch your course lectures at your own pace.</p>
            </div>

            {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">{error}</div>}

            {loadingLectures ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="w-full aspect-video bg-gray-200 rounded-2xl animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-lg w-2/3 animate-pulse" />
                </div>
                <div className="space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
              </div>
            ) : lectures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mb-5">
                  <YoutubeIcon size={36} className="text-[#451ebb]/40" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No lectures available yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">Your instructor hasn't published any lectures. Check back soon!</p>
              </div>
            ) : (
              <>
                {/* Header/Title Row (Moved out of grid so the grid elements align perfectly at the top) */}
                {activeLecture && (
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#451ebb] bg-[#451ebb]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        <Video size={11} /> Lecture {activeIdx + 1} of {lectures.length}
                      </span>
                      {watchProgress[activeLecture.id] >= 90 && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          <CheckCircle2 size={11} /> Completed
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">{activeLecture.title}</h2>
                      {activeLecture.topic && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#451ebb] bg-[#451ebb]/10 px-2.5 py-0.5 rounded-full mt-2">
                          {activeLecture.topic}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* LEFT: Player + Info + Tabs */}
                  <div className="lg:col-span-2 space-y-5">
                    {activeLecture && (
                      <YouTubePlayer key={activeLecture.youtubeVideoId} videoId={activeLecture.youtubeVideoId} onProgress={handleProgress} />
                    )}

                  {activeLecture && (
                    <div className="flex flex-row items-center justify-between gap-2 mt-2 sm:mt-0">
                      <button onClick={goToPrev} disabled={activeIdx <= 0} className="flex-1 sm:flex-none justify-center flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm font-bold text-gray-500 hover:text-[#451ebb] bg-white border border-gray-200 hover:border-[#451ebb]/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all">
                        <ChevronLeft size={14} className="shrink-0" /> Previous
                      </button>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-2">{activeIdx + 1} / {lectures.length}</span>
                      <button onClick={goToNext} disabled={activeIdx >= lectures.length - 1} className="flex-1 sm:flex-none justify-center flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-[10px] sm:text-sm font-bold text-gray-500 hover:text-[#451ebb] bg-white border border-gray-200 hover:border-[#451ebb]/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all">
                        Next <ChevronRight size={14} className="shrink-0" />
                      </button>
                    </div>
                  )}

                  {/* Overview / Resources tabs */}
                  {activeLecture && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
                      <div className="flex gap-6 border-b border-gray-100 mb-4 sm:mb-5">
                        {["overview", "resources"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold capitalize transition-colors -mb-px ${
                              activeTab === tab
                                ? "text-[#451ebb] border-b-2 border-[#451ebb]"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {activeTab === "overview" && (
                        <DescriptionText text={activeLecture.description} />
                      )}

                      {activeTab === "resources" && (
                        activeLecture.resourceLinks && activeLecture.resourceLinks.length > 0 ? (
                          <ul className="space-y-2">
                            {activeLecture.resourceLinks.map((r, i) => (
                              <li key={i}>
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#451ebb] hover:underline"
                                >
                                  <ExternalLink size={14} className="shrink-0" />
                                  {r.label || r.url}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400 text-sm italic">No resources have been added for this lecture.</p>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT: Notes + Playlist */}
                <div className="space-y-5 sticky top-20">

                  {/* Notes card */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <div className="flex items-center gap-2">
                        <Pencil size={14} className="text-[#451ebb]" />
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Notes</h3>
                      </div>
                      <button
                        onClick={() => setNoteModalOpen(true)}
                        title="Expand notes"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#451ebb] hover:bg-[#451ebb]/10 transition-colors"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </div>
                    <div className="px-5 pb-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => { setNoteText(e.target.value); if (noteState === "saved") setNoteState("idle"); }}
                        placeholder="Jot down key formulas or insights..."
                        rows={5}
                        className="w-full text-sm text-gray-700 placeholder-gray-300 bg-gray-50/70 border border-gray-100 rounded-xl px-3 py-3 resize-none outline-none focus:ring-2 focus:ring-[#451ebb]/20 focus:border-[#451ebb]/30 transition-all leading-relaxed"
                      />
                    </div>
                    <div className="px-5 pb-5">
                      {noteState === "saved" ? (
                        <button
                          onClick={handleOpenNew}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
                        >
                          Open New
                        </button>
                      ) : (
                        <button
                          onClick={handleQuickSave}
                          disabled={!noteText.trim()}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-[#451ebb] hover:bg-[#5d3fd3] disabled:opacity-40 text-white shadow-md shadow-indigo-200/60 transition-all"
                        >
                          <Save size={14} /> Save to Notes
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lecture Playlist card */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-[#451ebb]" />
                          <h3 className="text-sm font-bold text-gray-800">Lecture Playlist</h3>
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                          {watchedCount}/{lectures.length} Completed
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#451ebb] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>
                    <div className="px-3 pb-4 space-y-0.5 max-h-[55vh] overflow-y-auto custom-scrollbar">
                      {lectures.map((lecture, idx) => (
                        <CurriculumItem
                          key={lecture.id}
                          lecture={lecture}
                          index={idx}
                          active={activeLecture?.id === lecture.id}
                          progress={watchProgress[lecture.id] ?? 0}
                          onClick={setActiveLecture}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          </div>
        </main>
      </div>

      {/* Note expand modal */}
      <NoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        defaultContent={noteText}
        lectureTitle={activeLecture?.title}
        onSaved={handleNoteSaved}
      />
    </div>
  );
}