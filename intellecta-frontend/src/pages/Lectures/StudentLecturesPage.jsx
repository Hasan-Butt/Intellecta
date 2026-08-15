import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Play,
  CheckCircle2,
  Lock,
  Pencil,
  Save,
  Maximize2,
  Video,
} from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";
import StudentSidebar from "../../components/dashboard/StudentSidebar";

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

// ─── YouTube IFrame Player ────────────────────────────────────────────────────
// onProgress(pct) fires every 5 s so parent can track watch %.
function YouTubePlayer({ videoId, onProgress }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const clearTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const startTracking = useCallback(() => {
    clearTracking();
    intervalRef.current = setInterval(() => {
      if (!playerRef.current) return;
      try {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        if (total > 0 && onProgress) {
          onProgress(Math.round((current / total) * 100));
        }
      } catch {
        // player not ready yet
      }
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
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
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

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      clearTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startTracking, clearTracking, onProgress]);

  return (
    <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

// ─── Curriculum Lecture Item ──────────────────────────────────────────────────
function CurriculumItem({ lecture, index, active, progress, onClick }) {
  const done = progress >= 90;
  return (
    <button
      onClick={() => onClick(lecture)}
      className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl transition-all group ${
        active
          ? "bg-[#451ebb]/10 border border-[#451ebb]/25"
          : "hover:bg-gray-50 border border-transparent"
      }`}
    >
      {/* Status icon */}
      <div className="shrink-0 mt-0.5">
        {done ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : active ? (
          <div className="w-4.5 h-4.5 rounded-full bg-[#451ebb] flex items-center justify-center">
            <Play size={9} fill="white" className="text-white ml-0.5" />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-snug line-clamp-2 ${
            active
              ? "text-[#451ebb]"
              : done
              ? "text-gray-500 line-through decoration-gray-300"
              : "text-gray-700 group-hover:text-gray-900"
          }`}
        >
          {index + 1}. {lecture.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {active && (
            <span className="text-[10px] font-bold text-[#451ebb] uppercase tracking-wider">
              Currently Playing
            </span>
          )}
          {done && !active && (
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
              ✓ Watched
            </span>
          )}
          {!done && !active && progress > 0 && (
            <span className="text-[10px] text-indigo-500">{progress}%</span>
          )}
        </div>
        {/* Per-lecture progress bar */}
        {progress > 0 && (
          <div className="mt-1.5 h-0.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                done ? "bg-emerald-500" : "bg-[#451ebb]"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudentLecturesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [activeLecture, setActiveLecture] = useState(null);
  const [loadingLectures, setLoadingLectures] = useState(false);
  const [error, setError] = useState("");

  // watchProgress: { [lectureId]: percentage }
  const [watchProgress, setWatchProgress] = useState({});

  // Quick-notes state
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  // Load enrolled courses
  useEffect(() => {
    api
      .get("/courses")
      .then((res) => {
        setCourses(res.data);
        if (res.data.length > 0) setSelectedCourseId(res.data[0].id);
      })
      .catch(() => setError("Failed to load your courses."));
  }, []);

  // Load lectures when course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    setLoadingLectures(true);
    setActiveLecture(null);
    api
      .get(`/lectures/course/${selectedCourseId}`)
      .then((res) => {
        setLectures(res.data);
        if (res.data.length > 0) setActiveLecture(res.data[0]);
      })
      .catch(() => setError("Failed to load lectures."))
      .finally(() => setLoadingLectures(false));
  }, [selectedCourseId]);

  // Called by YouTubePlayer every 5 s with current watch percentage
  const handleProgress = useCallback(
    (pct) => {
      if (!activeLecture) return;
      setWatchProgress((prev) => {
        const existing = prev[activeLecture.id] ?? 0;
        if (pct <= existing) return prev;
        return { ...prev, [activeLecture.id]: pct };
      });
    },
    [activeLecture]
  );

  function goToPrev() {
    const idx = lectures.findIndex((l) => l.id === activeLecture?.id);
    if (idx > 0) setActiveLecture(lectures[idx - 1]);
  }

  function goToNext() {
    const idx = lectures.findIndex((l) => l.id === activeLecture?.id);
    if (idx < lectures.length - 1) setActiveLecture(lectures[idx + 1]);
  }

  function handleSaveNote() {
    if (!noteText.trim()) return;
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
    // Note: wire to backend here if needed
  }

  const activeIdx = lectures.findIndex((l) => l.id === activeLecture?.id);
  const watchedCount = Object.values(watchProgress).filter((p) => p >= 90).length;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const progressPct =
    lectures.length > 0 ? Math.round((watchedCount / lectures.length) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <StudentSidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 max-w-[1400px] mx-auto">

            {/* ── Page Header ── */}
            <div className="mb-6">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Video Lectures
              </h1>
              <p className="text-gray-500 text-base mt-1 leading-relaxed">
                Watch your course lectures at your own pace.
              </p>
            </div>

            {/* ── Error Banner ── */}
            {error && (
              <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            {/* ── Course Tabs ── */}
            {courses.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {courses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                      selectedCourseId === c.id
                        ? "bg-[#451ebb] text-white border-[#451ebb] shadow-lg shadow-indigo-200"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#451ebb]/40 hover:text-[#451ebb]"
                    }`}
                  >
                    {c.courseName}
                  </button>
                ))}
              </div>
            )}

            {/* ── Loading skeleton ── */}
            {loadingLectures ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="w-full aspect-video bg-gray-200 rounded-2xl animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded-lg w-2/3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            ) : lectures.length === 0 ? (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mb-5">
                  <YoutubeIcon size={36} className="text-[#451ebb]/40" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No lectures available yet
                </h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Your instructor hasn't published any lectures for this course. Check back soon!
                </p>
              </div>
            ) : (
              /* ── Main Layout ── */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ── LEFT: Player + Info + Notes ── */}
                <div className="lg:col-span-2 space-y-5">

                  {/* Module label */}
                  {activeLecture && (
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#451ebb] bg-[#451ebb]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        <Video size={11} />
                        Lecture {activeIdx + 1} of {lectures.length}
                      </span>
                      {watchProgress[activeLecture.id] >= 90 && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                          <CheckCircle2 size={11} />
                          Completed
                        </span>
                      )}
                    </div>
                  )}

                  {/* Video title */}
                  {activeLecture && (
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                        {activeLecture.title}
                      </h2>
                      <p className="text-[#451ebb] text-sm font-semibold mt-1">
                        {activeLecture.courseName}
                      </p>
                    </div>
                  )}

                  {/* YouTube Player */}
                  {activeLecture && (
                    <YouTubePlayer
                      key={activeLecture.youtubeVideoId}
                      videoId={activeLecture.youtubeVideoId}
                      onProgress={handleProgress}
                    />
                  )}

                  {/* Prev / Next navigation */}
                  {activeLecture && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={goToPrev}
                        disabled={activeIdx <= 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#451ebb] bg-white border border-gray-200 hover:border-[#451ebb]/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {activeIdx + 1} / {lectures.length}
                      </span>
                      <button
                        onClick={goToNext}
                        disabled={activeIdx >= lectures.length - 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-[#451ebb] bg-white border border-gray-200 hover:border-[#451ebb]/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Overview tabs area */}
                  {activeLecture && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                      {/* Tab-style header */}
                      <div className="flex gap-6 border-b border-gray-100 mb-4">
                        <span className="pb-3 text-sm font-bold text-[#451ebb] border-b-2 border-[#451ebb] -mb-px">
                          Overview
                        </span>
                        <span className="pb-3 text-sm font-medium text-gray-400 cursor-default">
                          Resources
                        </span>
                      </div>

                      {activeLecture.description ? (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {activeLecture.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">
                          No description available for this lecture.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ── RIGHT: Notes + Curriculum ── */}
                <div className="space-y-5 sticky top-20">

                  {/* Sanctuary Notes card */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <div className="flex items-center gap-2">
                        <Pencil size={14} className="text-[#451ebb]" />
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Sanctuary Notes
                        </h3>
                      </div>
                      <Maximize2 size={14} className="text-gray-400" />
                    </div>
                    <div className="px-5 pb-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Distillation begins here. Jot down key formulas or insights..."
                        rows={5}
                        className="w-full text-sm text-gray-700 placeholder-gray-300 bg-gray-50/70 border border-gray-100 rounded-xl px-3 py-3 resize-none outline-none focus:ring-2 focus:ring-[#451ebb]/20 focus:border-[#451ebb]/30 transition-all leading-relaxed"
                      />
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        onClick={handleSaveNote}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          noteSaved
                            ? "bg-emerald-500 text-white"
                            : "bg-[#451ebb] hover:bg-[#5d3fd3] text-white shadow-md shadow-indigo-200/60"
                        }`}
                      >
                        <Save size={14} />
                        {noteSaved ? "Saved!" : "Save to Sanctuary"}
                      </button>
                    </div>
                  </div>

                  {/* Course Curriculum card */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-[#451ebb]" />
                          <h3 className="text-sm font-bold text-gray-800">
                            {selectedCourse?.courseName ?? "Course"} Curriculum
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                          {watchedCount}/{lectures.length} Completed
                        </span>
                      </div>

                      {/* Overall progress bar */}
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#451ebb] rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Lecture list */}
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}