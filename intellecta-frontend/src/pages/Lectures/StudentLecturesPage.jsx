import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../services/api";
import { ChevronLeft, ChevronRight, BookOpen, Play } from "lucide-react";

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


// ─── YouTube Player wrapper ───────────────────────────────────────────────────
// Uses the YouTube IFrame API loaded via a script tag.
// onProgress(pct) fires every 5 seconds so parent can track watch %.

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
    // Load YouTube IFrame API script once
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }

    function initPlayer() {
      if (!containerRef.current) return;
      // Destroy existing player before creating a new one
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          rel: 0,          // don't show related videos from other channels
          modestbranding: 1,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onStateChange: (e) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (e.data === 1) startTracking();
            else clearTracking();
            // When video ends, report 100%
            if (e.data === 0 && onProgress) onProgress(100);
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // API not loaded yet — wait for the callback
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
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

// ─── Lecture List Item ────────────────────────────────────────────────────────

function LectureListItem({ lecture, active, progress, onClick }) {
  const done = progress >= 90;
  return (
    <button
      onClick={() => onClick(lecture)}
      className={`w-full text-left flex gap-3 p-3 rounded-xl transition-all group ${
        active
          ? "bg-indigo-600/20 border border-indigo-500/30"
          : "hover:bg-white/5 border border-transparent"
      }`}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-24 aspect-video rounded-lg overflow-hidden bg-gray-900">
        <img
          src={`https://img.youtube.com/vi/${lecture.youtubeVideoId}/default.jpg`}
          alt={lecture.title}
          className="w-full h-full object-cover"
        />
        {active && (
          <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
            <Play size={16} fill="white" className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug line-clamp-2 ${active ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
          {lecture.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-600">#{lecture.orderIndex}</span>
          {done && (
            <span className="text-xs text-emerald-400 font-medium">✓ Watched</span>
          )}
          {!done && progress > 0 && (
            <span className="text-xs text-indigo-400">{progress}%</span>
          )}
        </div>
        {/* Progress bar */}
        {progress > 0 && (
          <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${done ? "bg-emerald-500" : "bg-indigo-500"}`}
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

  // Load courses the student is enrolled in
  // Adjust endpoint if you have a student-specific courses endpoint
  useEffect(() => {
    api.get("/courses")
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
    api.get(`/lectures/course/${selectedCourseId}`)
      .then((res) => {
        setLectures(res.data);
        if (res.data.length > 0) setActiveLecture(res.data[0]);
      })
      .catch(() => setError("Failed to load lectures."))
      .finally(() => setLoadingLectures(false));
  }, [selectedCourseId]);

  // Called by YouTubePlayer every 5s with current watch percentage
  const handleProgress = useCallback((pct) => {
    if (!activeLecture) return;
    setWatchProgress((prev) => {
      const existing = prev[activeLecture.id] ?? 0;
      // Only update if new value is higher (never regress progress)
      if (pct <= existing) return prev;
      return { ...prev, [activeLecture.id]: pct };
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

  const activeIdx = lectures.findIndex((l) => l.id === activeLecture?.id);
  const watchedCount = Object.values(watchProgress).filter((p) => p >= 90).length;

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Video Lectures</h1>
          <p className="text-gray-500 text-sm mt-1">Watch your course lectures at your own pace.</p>
        </div>

        {error && (
          <div className="mb-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
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
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCourseId === c.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {c.courseName}
              </button>
            ))}
          </div>
        )}

        {/* ── Main Layout: Player + Sidebar ── */}
        {loadingLectures ? (
          <div className="w-full aspect-video bg-white/5 rounded-xl animate-pulse" />
        ) : lectures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Youtube size={28} className="text-gray-600" />
            </div>
            <h3 className="text-white font-medium mb-1">No lectures available yet</h3>
            <p className="text-gray-500 text-sm">Your instructor hasn't published any lectures for this course.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── Player Column ── */}
            <div className="flex-1 min-w-0">
              {/* Player */}
              {activeLecture && (
                <YouTubePlayer
                  key={activeLecture.youtubeVideoId}  // remount when video changes
                  videoId={activeLecture.youtubeVideoId}
                  onProgress={handleProgress}
                />
              )}

              {/* Lecture info */}
              {activeLecture && (
                <div className="mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-white font-semibold text-lg leading-snug">
                        {activeLecture.title}
                      </h2>
                      <p className="text-indigo-400 text-sm mt-1">{activeLecture.courseName}</p>
                    </div>
                    {/* Watch progress badge */}
                    {watchProgress[activeLecture.id] > 0 && (
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                        (watchProgress[activeLecture.id] ?? 0) >= 90
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                      }`}>
                        {(watchProgress[activeLecture.id] ?? 0) >= 90 ? "✓ Watched" : `${watchProgress[activeLecture.id]}%`}
                      </span>
                    )}
                  </div>

                  {activeLecture.description && (
                    <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                      {activeLecture.description}
                    </p>
                  )}

                  {/* Prev / Next navigation */}
                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={goToPrev}
                      disabled={activeIdx <= 0}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <span className="text-gray-600 text-xs">
                      {activeIdx + 1} / {lectures.length}
                    </span>
                    <button
                      onClick={goToNext}
                      disabled={activeIdx >= lectures.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar: Lecture List ── */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white/3 border border-white/10 rounded-2xl p-4 sticky top-6">
                {/* Sidebar header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} className="text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Course Playlist</h3>
                  </div>
                  <span className="text-xs text-gray-500">
                    {watchedCount} / {lectures.length} watched
                  </span>
                </div>

                {/* Progress bar for whole course */}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${lectures.length > 0 ? (watchedCount / lectures.length) * 100 : 0}%` }}
                  />
                </div>

                {/* List */}
                <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
                  {lectures.map((lecture) => (
                    <LectureListItem
                      key={lecture.id}
                      lecture={lecture}
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
    </div>
  );
}