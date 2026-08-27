import React, { useState, useEffect, useCallback } from "react";
import Swal from 'sweetalert2';
import {
  Plus, ChevronDown, ChevronRight, AlertTriangle,
  Check, Trash2, X, Loader2, BookOpen, CalendarClock,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import api from "../../services/api";
import { getUserId } from "../../utils/auth";
import {
  getTopicsBySubject, getTopicsByExam, createTopic,
  bulkUpdateTopicStatuses, deleteTopic,
  getExamsBySubject, createExam, updateExamDate, deleteExam,
  getChecklistByExam, createChecklistItem, toggleChecklistItem, deleteChecklistItem,
} from "../../services/coverageService";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  MASTERED:    { label: "MASTERED",    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", ring: "#10B981" },
  IN_PROGRESS: { label: "IN PROGRESS", color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200",  ring: "#7C3AED" },
  REVIEWED:    { label: "REVIEWED",    color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200",    ring: "#3B82F6" },
  NOT_STARTED: { label: "NOT STARTED", color: "text-gray-400",    bg: "bg-gray-50",    border: "border-gray-200",    ring: "#D1D5DB" },
};

const STATUS_ORDER = ["NOT_STARTED", "IN_PROGRESS", "REVIEWED", "MASTERED"];

const STATUS_ICONS = {
  MASTERED: "✦", IN_PROGRESS: "✳", REVIEWED: "✧", NOT_STARTED: "✩",
};

const WEIGHT = { NOT_STARTED: 0, IN_PROGRESS: 25, REVIEWED: 50, MASTERED: 100 };

// ── Helpers ───────────────────────────────────────────────────────────────────

const calcWeightedProgress = (topics) => {
  if (!topics.length) return 0;
  const sum = topics.reduce((acc, t) => acc + (WEIGHT[t.status] || 0), 0);
  return Math.round(sum / topics.length);
};

const calcPanicLevel = (daysLeft, progress) => {
  if (daysLeft <= 7  && progress < 50) return "Critical";
  if (daysLeft <= 14 && progress < 70) return "High";
  if (daysLeft <= 30 && progress < 85) return "Medium";
  return "Low";
};

const calcRecommendedHours = (topics, daysLeft, progressPct, panicLevel) => {
  const remaining = topics.filter((t) => t.status !== "MASTERED").length;
  if (remaining === 0) return "0";
  const hoursNeeded = remaining * 2;
  const progressMultiplier = 1 + (1 - progressPct / 100) * 0.5;
  const panicMultipliers = { Critical: 1.8, High: 1.4, Medium: 1.0, Low: 0.7 };
  const panicMultiplier = panicMultipliers[panicLevel] || 1.0;
  const adjustedHours = (hoursNeeded * progressMultiplier * panicMultiplier) / Math.max(daysLeft, 1);
  const rounded = Math.round(adjustedHours * 2) / 2;
  if (rounded < 0.5 && remaining > 0) return "0.5";
  return rounded.toFixed(1);
};

const formatDate = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
};

// ── Shared presentational primitives ─────────────────────────────────────────

/** Small stat pill for the header strip — scannable page state at a glance. */
const StatChip = ({ value, label }) => (
  <div className="neu-sm px-5 py-3 flex flex-col items-center min-w-[86px]">
    <span className="font-mono text-lg font-bold text-gray-900 leading-none">{value}</span>
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{label}</span>
  </div>
);

/** Unified circular progress ring — the same visual language used for both
 *  "days left" (exam countdown) and "% mastered" (subject/exam progress),
 *  so the page has one consistent way of showing "how far along". */
const ProgressRing = ({
  pct, size = 140, stroke = 12,
  trackColor = "rgba(124,58,237,0.08)", fillColor = "#7C3AED",
}) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(1, pct / 100)) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={fillColor} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};

/** Colored icon badge for a topic's status — one shared component so the
 *  main topic list and the exam-detail modal read as the same system. */
const StatusIconBadge = ({ status, size = "md" }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;
  const dims = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm";
  return (
    <span className={cn("rounded-xl flex items-center justify-center font-bold flex-shrink-0", dims, cfg.bg, cfg.color)}>
      {STATUS_ICONS[status]}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;
  return (
    <span className={cn(
      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border cursor-pointer select-none transition-transform hover:scale-105",
      cfg.color, cfg.bg, cfg.border
    )}>
      {cfg.label}
    </span>
  );
};

const CircularCountdown = ({ days, pulse = false }) => {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, 1 - days / 30));
  const dash = pct * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className={cn(pulse && "animate-pulse")}>
      <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
      <circle cx="36" cy="36" r={radius} fill="none" stroke="white" strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" />
      <text x="36" y="33" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" className="font-mono">
        {days < 0 ? "—" : days}
      </text>
      <text x="36" y="46" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="7" fontWeight="700">
        {days < 0 ? "EXPIRED" : "DAYS LEFT"}
      </text>
    </svg>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

const Modal = ({ isOpen, onClose, title, children, wide = false }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={cn(
          "neu p-10 flex flex-col gap-6 max-h-[90vh] overflow-y-auto",
          wide ? "w-full max-w-2xl" : "w-full max-w-md"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InputField = ({ label, required, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      className="w-full px-5 py-3.5 neu-inset bg-transparent border-none text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 font-medium"
      {...props}
    />
  </div>
);

const ModalBtn = ({ onClick, disabled, loading, children, variant = "primary" }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "flex-1 py-3.5 rounded-2xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
      variant === "primary"
        ? "btn-primary shadow-lg shadow-indigo-100"
        : "neu-inset bg-transparent text-gray-500 hover:scale-[1.02]"
    )}
  >
    {loading && <Loader2 size={14} className="animate-spin" />}
    {children}
  </button>
);

// ── Exam Detail Modal Content ─────────────────────────────────────────────────

const ExamDetailModal = ({
  exam, onClose, activeSubjectId, allSubjectTopics,
  onTopicStatusChange, onDeleteTopic, onAddTopic, onDeleteExam, onUpdateDate,
  openConfirm,
}) => {
  const [examTopics, setExamTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [editDate, setEditDate] = useState(exam.examDate);
  const [savingDate, setSavingDate] = useState(false);
  const [addTopicModal, setAddTopicModal] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [pendingStatuses, setPendingStatuses] = useState({});

  const fetchExamTopics = useCallback(async () => {
    setLoadingTopics(true);
    try {
      const res = await getTopicsByExam(exam.id);
      setExamTopics(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load exam topics:", err);
    } finally {
      setLoadingTopics(false);
    }
  }, [exam.id]);

  useEffect(() => {
    fetchExamTopics();
  }, [fetchExamTopics]);

  const effectiveTopics = examTopics.map((t) => ({
    ...t,
    status: pendingStatuses[t.id] ?? t.status,
  }));

  const examProgress = calcWeightedProgress(effectiveTopics);
  const examPanic = calcPanicLevel(exam.daysLeft, examProgress);

  const panicColors = {
    Critical: "text-red-500",
    High: "text-orange-500",
    Medium: "text-yellow-600",
    Low: "text-emerald-500",
  };

  const handleCycleStatus = async (topicId, currentStatus) => {
    const idx = STATUS_ORDER.indexOf(currentStatus);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    setPendingStatuses((prev) => ({ ...prev, [topicId]: next }));
    try {
      await bulkUpdateTopicStatuses([{ id: topicId, status: next }]);
      await fetchExamTopics();
      onTopicStatusChange();
    } catch (err) {
      setPendingStatuses((prev) => {
        const c = { ...prev };
        delete c[topicId];
        return c;
      });
    }
  };

  const handleDeleteTopicFromExam = (topicId) => {
    openConfirm(
      "Remove this topic?",
      "This topic will be permanently deleted and cannot be recovered.",
      async () => {
        try {
          await deleteTopic(topicId);
          await fetchExamTopics();
          onDeleteTopic();
        } catch (err) {
          console.error("Failed to delete topic:", err);
        }
      }
    );
  };

  const handleAddTopic = async () => {
    if (!topicForm.title.trim()) return;
    setCreating(true);
    try {
      await createTopic(activeSubjectId, {
        title: topicForm.title.trim(),
        description: topicForm.description.trim() || null,
        status: "NOT_STARTED",
        examId: exam.id,
      });
      await fetchExamTopics();
      onAddTopic();
      setAddTopicModal(false);
      setTopicForm({ title: "", description: "" });
    } catch (err) {
      console.error("Failed to add topic:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveDate = async () => {
    if (!editDate) return;
    setSavingDate(true);
    try {
      await onUpdateDate(exam.id, editDate);
    } finally {
      setSavingDate(false);
    }
  };

  return (
    <>
      {/* Exam header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {formatDate(exam.examDate)}
            {" · "}
            {exam.daysLeft < 0 ? (
              <span className="text-red-500 font-bold">Expired</span>
            ) : (
              <span className="text-[#7c3aed] font-bold font-mono">
                {exam.daysLeft} days left
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Panic Level:
            </span>
            <span className={cn("text-sm font-black", panicColors[examPanic])}>
              {examPanic}
            </span>
          </div>
        </div>
        <button
          onClick={() =>
            openConfirm(
              `Delete "${exam.name}"?`,
              "Are you sure you want to delete this exam permenantly?",
              () => onDeleteExam(exam.id)
            )
          }
          className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
        >
          <Trash2 size={13} /> Delete Exam
        </button>
      </div>

      {/* Exam Progress */}
      <div className="neu-inset bg-transparent border-none px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Exam Coverage Progress
          </span>
          <span className="font-mono text-lg font-black text-gray-900">{examProgress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7c3aed] rounded-full transition-all duration-700"
            style={{ width: `${examProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Based on {effectiveTopics.length} topic
          {effectiveTopics.length !== 1 ? "s" : ""} linked to this exam
        </p>
      </div>

      {/* Change date */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <InputField
            label="Change Exam Date"
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />
        </div>
        <ModalBtn onClick={handleSaveDate} disabled={!editDate} loading={savingDate}>
          Save
        </ModalBtn>
      </div>

      {/* Topics for this exam */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-gray-800">
            Topics for this Exam
          </h3>
          <button
            onClick={() => setAddTopicModal(true)}
            className="flex items-center gap-1 text-[#7c3aed] text-[11px] font-black hover:underline"
          >
            <Plus size={12} /> Add Topic
          </button>
        </div>

        <div className="neu overflow-hidden">
          {loadingTopics ? (
            <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </div>
          ) : effectiveTopics.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-8 italic">
              No topics linked to this exam yet. Click "+ Add Topic" above.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {effectiveTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIconBadge status={topic.status} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {topic.title}
                      </p>
                      {topic.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <button
                      onClick={() => handleCycleStatus(topic.id, topic.status)}
                    >
                      <StatusBadge status={topic.status} />
                    </button>
                    <button
                      onClick={() => handleDeleteTopicFromExam(topic.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Topic inline form */}
      {addTopicModal && (
        <div className="neu-inset p-5 flex flex-col gap-4">
          <h4 className="text-sm font-extrabold text-[#7c3aed]">
            New Topic for this Exam
          </h4>
          <InputField
            label="Topic Name"
            required
            placeholder="e.g. Wave Functions"
            value={topicForm.title}
            onChange={(e) =>
              setTopicForm((p) => ({ ...p, title: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
          />
          <InputField
            label="Description"
            placeholder="Brief description (optional)"
            value={topicForm.description}
            onChange={(e) =>
              setTopicForm((p) => ({ ...p, description: e.target.value }))
            }
          />
          <div className="flex gap-3">
            <ModalBtn
              variant="secondary"
              onClick={() => {
                setAddTopicModal(false);
                setTopicForm({ title: "", description: "" });
              }}
            >
              Cancel
            </ModalBtn>
            <ModalBtn
              onClick={handleAddTopic}
              disabled={!topicForm.title.trim()}
              loading={creating}
            >
              Add Topic
            </ModalBtn>
          </div>
        </div>
      )}
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const CoverageTrackerPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [pendingStatuses, setPendingStatuses] = useState({});
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingCheckItem, setAddingCheckItem] = useState(false);
  const [newCheckText, setNewCheckText] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Modals
  const [topicModal, setTopicModal] = useState(false);
  const [examModal, setExamModal] = useState(false);
  const [examDetailModal, setExamDetailModal] = useState(null);

  // Modal form state
  const [topicForm, setTopicForm] = useState({
    title: "", description: "", examId: "",
  });
  const [examForm, setExamForm] = useState({ name: "", examDate: "" });
  const [modalLoading, setModalLoading] = useState(false);

  const openConfirm = (title, message, onConfirm) =>
    setConfirmDialog({ open: true, title, message, onConfirm });
  const closeConfirm = () =>
    setConfirmDialog({ open: false, title: "", message: "", onConfirm: null });

  // ── Fetch subjects from the Subjects table (what topics & exams are linked to) ──

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    api.get(`/subjects/user/${userId}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setSubjects(data);
        if (data.length > 0) setActiveSubject(data[0]);
      })
      .catch((err) => console.error("Failed to load subjects:", err));
  }, []);

  const fetchTopics = useCallback(async (subjectId) => {
    try {
      const res = await getTopicsBySubject(subjectId);
      setTopics(Array.isArray(res.data) ? res.data : []);
      setPendingStatuses({});
    } catch (err) {
      console.error("Failed to load topics:", err);
    }
  }, []);

  const fetchExams = useCallback(async (subjectId) => {
    try {
      const res = await getExamsBySubject(subjectId);
      const data = Array.isArray(res.data) ? res.data : [];
      setExams(data);
      const upcoming = data.filter((e) => e.daysLeft >= 0);
      setSelectedExam(upcoming[0] || data[0] || null);
    } catch (err) {
      console.error("Failed to load exams:", err);
    }
  }, []);

  const fetchChecklist = useCallback(async (examId) => {
    if (!examId) { setChecklist([]); return; }
    try {
      const res = await getChecklistByExam(examId);
      setChecklist(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load checklist:", err);
    }
  }, []);

  useEffect(() => {
    if (!activeSubject?.id) return;
    setLoading(true);
    setTopics([]); setExams([]); setChecklist([]); setPendingStatuses({});
    Promise.all([
      fetchTopics(activeSubject.id),
      fetchExams(activeSubject.id),
    ]).finally(() => setLoading(false));
  }, [activeSubject, fetchTopics, fetchExams]);

  useEffect(() => {
    fetchChecklist(selectedExam?.id);
  }, [selectedExam, fetchChecklist]);

  // ── Derived values ────────────────────────────────────────────────────────

  const effectiveTopics = topics.map((t) => ({
    ...t, status: pendingStatuses[t.id] ?? t.status,
  }));

  const progressPct = calcWeightedProgress(effectiveTopics);
  const upcomingExams = exams.filter((e) => e.daysLeft >= 0);
  const nearestExam = upcomingExams[0] || null;
  const daysLeft = nearestExam ? nearestExam.daysLeft : 9999;
  const nearestExamTopics = effectiveTopics.filter(
    (t) => nearestExam && t.examId === nearestExam.id
  );
  const examTopicsForCalc =
    nearestExamTopics.length > 0 ? nearestExamTopics : [];
  const examProgress = calcWeightedProgress(examTopicsForCalc);

  const panicLevel = nearestExam
    ? calcPanicLevel(
        daysLeft,
        examTopicsForCalc.length > 0 ? examProgress : progressPct
      )
    : "Low";

  const panicColors = {
    Critical: { bar: "from-red-400 to-red-600",       text: "text-red-500",     width: "w-full" },
    High:     { bar: "from-orange-400 to-red-500",    text: "text-orange-500",  width: "w-4/5"  },
    Medium:   { bar: "from-yellow-400 to-orange-400", text: "text-yellow-600",  width: "w-3/5"  },
    Low:      { bar: "from-green-400 to-emerald-500", text: "text-emerald-500", width: "w-2/5"  },
  };

  const recommendedHours = nearestExam
    ? calcRecommendedHours(
        examTopicsForCalc.length > 0 ? examTopicsForCalc : effectiveTopics,
        daysLeft,
        examTopicsForCalc.length > 0 ? examProgress : progressPct,
        panicLevel
      )
    : "—";

  const lowestTopic = [
    ...(examTopicsForCalc.length > 0 ? nearestExamTopics : effectiveTopics),
  ].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  )[0];

  const showBehindAlert =
    nearestExam &&
    daysLeft <= 14 &&
    (examTopicsForCalc.length > 0 ? examProgress : progressPct) < 50;

  // Status breakdown for the hero mastery ring — presentational only
  const statusCounts = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = effectiveTopics.filter((t) => t.status === status).length;
    return acc;
  }, {});

  // ── Topic handlers ────────────────────────────────────────────────────────

  const cycleStatus = async (topicId, currentStatus) => {
    const idx = STATUS_ORDER.indexOf(currentStatus);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    setPendingStatuses((prev) => ({ ...prev, [topicId]: next }));
    try {
      await bulkUpdateTopicStatuses([{ id: topicId, status: next }]);
      await fetchTopics(activeSubject.id);
    } catch (err) {
      console.error("Failed to auto-save status:", err);
      setPendingStatuses((prev) => {
        const c = { ...prev };
        delete c[topicId];
        return c;
      });
    }
  };

  const handleDeleteTopic = (topicId) => {
    openConfirm(
      "Delete this topic?",
      "This topic will be permanently removed from the tracker.",
      async () => {
        try {
          await deleteTopic(topicId);
          await fetchTopics(activeSubject.id);
        } catch (err) {
          console.error("Failed to delete topic:", err);
        }
      }
    );
  };

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim()) return;
    if (!activeSubject) {
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Please select or create a subject first.' });
      return;
    }

    setModalLoading(true);
    try {
      await createTopic(activeSubject.id, {
        title: topicForm.title.trim(),
        description: topicForm.description.trim() || null,
        status: "NOT_STARTED",
        examId: topicForm.examId ? Number(topicForm.examId) : null,
      });
      await fetchTopics(activeSubject.id);
      setTopicModal(false);
      setTopicForm({ title: "", description: "", examId: "" });
      setPendingStatuses({});
    } catch (err) {
      console.error("Failed to create topic:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // ── Exam handlers ─────────────────────────────────────────────────────────

  const handleCreateExam = async () => {
  if (!examForm.name.trim() || !examForm.examDate) return;
  if (!activeSubject) {
    Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Please select or create a subject first.' });
    return;
  }

  // Check if date is in the past
  const selectedDate = new Date(examForm.examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Cannot create exam with a past date. Please select today or a future date.' });
    return;
  }

  setModalLoading(true);
  try {
    await createExam({ name: examForm.name.trim(), examDate: examForm.examDate, subjectId: activeSubject.id });
    await fetchExams(activeSubject.id);
    setExamModal(false);
    setExamForm({ name: "", examDate: "" });
  } catch (err) {
    console.error("Failed to create exam:", err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create exam. Please try again.' });
  } finally {
    setModalLoading(false);
  }
};

 const handleUpdateExamDate = async (examId, newDate) => {
  // Check if date is in the past
  const selectedDate = new Date(newDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Cannot set exam date to a past date. Please select today or a future date.' });
    return;
  }

  try {
    await updateExamDate(examId, newDate);
    await fetchExams(activeSubject.id);
    setExamDetailModal(null);
  } catch (err) {
    console.error("Failed to update exam date:", err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update exam date. Please try again.' });
  }
};

  const handleDeleteExam = async (examId) => {
    // Check if this exam has any topics linked to it before attempting deletion
    try {
      const topicsRes = await getTopicsByExam(examId);
      const linkedTopics = Array.isArray(topicsRes.data) ? topicsRes.data : [];
      if (linkedTopics.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Cannot Delete Exam',
          html: `This exam has <strong>${linkedTopics.length} topic${linkedTopics.length !== 1 ? 's' : ''}</strong> linked to it.<br/>Please remove or reassign all topics first before deleting the exam.`,
          confirmButtonColor: '#7c3aed',
        });
        return;
      }
    } catch (err) {
      console.error("Failed to check linked topics:", err);
    }

    try {
      await deleteExam(examId);
      await fetchExams(activeSubject.id);
      setExamDetailModal(null);
      if (selectedExam?.id === examId) setSelectedExam(null);
    } catch (err) {
      console.error("Failed to delete exam:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the exam. Please try again.',
        confirmButtonColor: '#7c3aed',
      });
    }
  };

  // ── Checklist handlers ────────────────────────────────────────────────────

  const handleAddCheckItem = async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const text = newCheckText.trim();
    if (!text || !selectedExam) return;
    setNewCheckText("");
    setAddingCheckItem(false);
    try {
      await createChecklistItem(selectedExam.id, text);
      await fetchChecklist(selectedExam.id);
    } catch (err) {
      console.error("Failed to add checklist item:", err);
    }
  };

  const handleToggleCheck = async (itemId) => {
    try {
      await toggleChecklistItem(itemId);
      await fetchChecklist(selectedExam.id);
    } catch (err) {
      console.error("Failed to toggle item:", err);
    }
  };

  const handleDeleteCheckItem = (itemId) => {
    openConfirm(
      "Remove checklist item?",
      "This item will be permanently removed from the checklist.",
      async () => {
        try {
          await deleteChecklistItem(itemId);
          await fetchChecklist(selectedExam.id);
        } catch (err) {
          console.error("Failed to delete item:", err);
        }
      }
    );
  };

  const primaryExam = exams[0] || null;
  const secondaryExams = exams.slice(1);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[var(--color-base,#f9f9ff)] min-h-screen flex w-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="px-10 py-10">
            <div className="max-w-6xl">

              {/* ── PAGE HEADER ── */}
              <header className="mb-8">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div>
                    <span className="font-mono text-[11px] font-bold tracking-[0.3em] text-[#7c3aed] uppercase">
                      Coverage Tracker
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mt-1">
                      {activeSubject?.name || "Your Curriculum"}
                    </h1>
                    <p className="text-gray-500 text-base mt-2 max-w-md leading-relaxed">
                      Map your curriculum, track topic mastery, and prep for what's next.
                    </p>
                  </div>

                  {/* Subject Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setSubjectOpen(!subjectOpen)}
                      className="flex items-center gap-2 px-5 py-3 neu-inset bg-transparent border-none text-xs font-bold text-gray-700 transition-colors"
                    >
                      {activeSubject?.name || "Select Subject"}
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform",
                          subjectOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {subjectOpen && (
                      <div className="absolute right-0 mt-2 w-56 neu py-1.5 z-20">
                        {subjects.length === 0 && (
                          <p className="text-xs text-gray-400 px-4 py-3 italic">
                            No subjects yet.
                          </p>
                        )}
                        {subjects.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setActiveSubject(s);
                              setSubjectOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between gap-2",
                              activeSubject?.id === s.id
                                ? "text-[#7c3aed] bg-[#f5f3ff]"
                                : "text-gray-600 hover:bg-gray-50"
                            )}
                          >
                            <span className="truncate">{s.name}</span>
                            <span className="text-gray-400 text-[9px] shrink-0">
                              {s.semester}
                            </span>
                            {activeSubject?.id === s.id && (
                              <Check size={12} className="shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* At-a-glance stat strip */}
                <div className="flex gap-3 mt-6 flex-wrap">
                  <StatChip value={effectiveTopics.length} label="Topics" />
                  <StatChip value={statusCounts.MASTERED} label="Mastered" />
                  <StatChip value={upcomingExams.length} label="Upcoming Exams" />
                  <StatChip value={`${progressPct}%`} label="Overall" />
                </div>
              </header>

              <div className="grid grid-cols-[1fr_380px] gap-8">

                {/* ── LEFT ── */}
                <div className="flex flex-col gap-6">

                  {/* Hero: Subject Mastery ring — the page's opening thesis */}
                  <div className="neu p-8 flex items-center gap-8 flex-wrap">
                    <div className="relative inline-flex items-center justify-center">
                      <ProgressRing pct={progressPct} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono text-3xl font-black text-gray-900">
                          {progressPct}%
                        </span>
                        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">
                          Mastery
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        Subject Breakdown — {activeSubject?.name || "—"}
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {STATUS_ORDER.slice().reverse().map((status) => (
                          <div key={status} className="flex items-center gap-3">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: STATUS_CONFIG[status].ring }}
                            />
                            <span className="text-xs font-semibold text-gray-600 flex-1">
                              {STATUS_CONFIG[status].label}
                            </span>
                            <span className="font-mono text-sm font-bold text-gray-900">
                              {statusCounts[status]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Topic List */}
                  <div className="neu overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50">
                      <h3 className="text-sm font-extrabold text-gray-800">
                        All Topics
                      </h3>
                    </div>
                    {loading ? (
                      <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                        <Loader2 size={18} className="animate-spin" /> Loading topics…
                      </div>
                    ) : effectiveTopics.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <BookOpen size={28} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          No topics yet. Add your first one below to start tracking mastery.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {effectiveTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between py-4 px-5 hover:bg-gray-50/80 transition-colors group"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <StatusIconBadge status={topic.status} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-gray-800 truncate">
                                    {topic.title}
                                  </p>
                                  {topic.examId ? (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#f0eeff] text-[#7c3aed] border border-[#ddd6fe] shrink-0">
                                      {exams.find((e) => e.id === topic.examId)?.name || "Exam"}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 shrink-0">
                                      General
                                    </span>
                                  )}
                                </div>
                                {topic.description && (
                                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                    {topic.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                              <button
                                onClick={() => cycleStatus(topic.id, topic.status)}
                              >
                                <StatusBadge status={topic.status} />
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setTopicForm({ title: "", description: "", examId: "" });
                        setTopicModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-4 text-[#7c3aed] text-xs font-black hover:bg-[#f5f3ff] transition-colors border-t border-gray-50"
                    >
                      <Plus size={14} /> Add Topic
                    </button>
                  </div>
                </div>

                {/* ── RIGHT ── */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Exam Prep
                    </h2>
                    <button
                      onClick={() => {
                        setExamForm({ name: "", examDate: "" });
                        setExamModal(true);
                      }}
                      className="flex items-center gap-1.5 text-[#7c3aed] text-xs font-bold hover:underline"
                    >
                      <Plus size={13} /> Add Exam
                    </button>
                  </div>

                  {primaryExam ? (
                    <div
                      className={cn(
                        "bg-[#7c3aed] rounded-3xl p-6 relative overflow-hidden cursor-pointer hover:bg-[#6d28d9] transition-colors",
                        panicLevel === "Critical" && "animate-pulse"
                      )}
                      onClick={() => setExamDetailModal(primaryExam)}
                    >
                      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                      <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div>
                          <h3 className="text-white font-extrabold text-lg leading-tight">
                            {primaryExam.name}
                          </h3>
                          <p className="text-white/60 text-xs mt-1">
                            {formatDate(primaryExam.examDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 relative z-10">
                        <CircularCountdown days={primaryExam.daysLeft} />
                        <div>
                          <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">
                            Panic Level
                          </p>
                          <p className="text-white font-extrabold text-xl">
                            {panicLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="neu p-6 text-center text-gray-400 text-sm">
                      <CalendarClock size={22} className="text-gray-200 mx-auto mb-2" />
                      No exams yet. Click "+ Add Exam" above to set your first countdown.
                    </div>
                  )}

                  {secondaryExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="neu px-5 py-4 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform"
                      onClick={() => setExamDetailModal(exam)}
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {exam.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {formatDate(exam.examDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-black text-[#7c3aed] bg-[#f5f3ff] px-3 py-1.5 rounded-full">
                          {exam.daysLeft < 0
                            ? "EXPIRED"
                            : `${exam.daysLeft} DAYS LEFT`}
                        </span>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    </div>
                  ))}

                  {/* Exam Readiness — panic + recommended hours, one decision */}
                  <div className="neu p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Exam Readiness
                    </p>
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                      <div className="pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle
                            size={15}
                            className={panicColors[panicLevel]?.text}
                          />
                          <span
                            className={cn(
                              "text-sm font-black",
                              panicColors[panicLevel]?.text
                            )}
                          >
                            {panicLevel}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full bg-gradient-to-r rounded-full",
                              panicColors[panicLevel]?.bar,
                              panicColors[panicLevel]?.width
                            )}
                          />
                        </div>
                        <p className="text-[9px] text-gray-400 mt-2 leading-relaxed">
                          {nearestExamTopics.length > 0
                            ? `Based on ${nearestExamTopics.length} topics for your nearest exam`
                            : "Based on days left + coverage"}
                        </p>
                      </div>
                      <div className="pl-4">
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="font-mono text-2xl font-black text-gray-900">
                            {recommendedHours === "0.0" || recommendedHours === "0" ? "0" : `~${recommendedHours}`}
                          </span>
                          <span className="text-xs font-bold text-gray-400">hrs/day</span>
                        </div>
                        <p className="text-[9px] text-gray-400 leading-relaxed">
                          Suggested daily study target to stay on track
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Behind Alert */}
                  {showBehindAlert && lowestTopic && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-start gap-3">
                      <AlertTriangle
                        size={15}
                        className="text-red-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-black text-red-600">
                          You're falling behind
                        </p>
                        <p className="text-[11px] text-red-400 mt-0.5 leading-relaxed">
                          Your exam is in <strong>{daysLeft} days</strong> but you've
                          only covered{" "}
                          <strong>
                            {examTopicsForCalc.length > 0 ? examProgress : progressPct}%
                          </strong>{" "}
                          of topics. Focus on <strong>"{lowestTopic.title}"</strong> next.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Exam Checklist */}
                  <div className="neu overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white/50">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-sm font-extrabold text-gray-800">
                          Exam Checklist
                        </h3>
                        {exams.length > 1 && (
                          <div className="flex gap-1 flex-wrap">
                            {exams.map((exam) => (
                              <button
                                key={exam.id}
                                onClick={() => setSelectedExam(exam)}
                                className={cn(
                                  "text-[9px] font-black px-2 py-0.5 rounded-full border transition-colors",
                                  selectedExam?.id === exam.id
                                    ? "bg-[#7c3aed] text-white border-[#7c3aed]"
                                    : "text-gray-500 border-gray-200 hover:border-[#c4b5fd]"
                                )}
                              >
                                {exam.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedExam && (
                          <span className="font-mono text-[10px] text-gray-400 font-bold">
                            {checklist.filter((c) => c.done).length}/
                            {checklist.length} checked
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setAddingCheckItem(true)}
                        disabled={!selectedExam}
                        className="flex items-center gap-1 text-[#7c3aed] text-[11px] font-black hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} /> Add Item
                      </button>
                    </div>

                    <div className="px-5 py-3 divide-y divide-gray-50">
                      {!selectedExam && (
                        <p className="text-xs text-gray-400 text-center py-6 italic">
                          Add an exam first.
                        </p>
                      )}
                      {checklist.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 py-3 group"
                        >
                          <button
                            onClick={() => handleToggleCheck(item.id)}
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                              item.done
                                ? "bg-[#7c3aed] border-[#7c3aed]"
                                : "border-gray-200 hover:border-[#c4b5fd]"
                            )}
                          >
                            {item.done && (
                              <Check
                                size={10}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </button>
                          <span
                            className={cn(
                              "text-sm font-medium flex-1 transition-colors",
                              item.done
                                ? "text-gray-400 line-through"
                                : "text-gray-700"
                            )}
                          >
                            {item.description}
                          </span>
                          <button
                            onClick={() => handleDeleteCheckItem(item.id)}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {addingCheckItem && (
                        <input
                          autoFocus
                          type="text"
                          value={newCheckText}
                          onChange={(e) => setNewCheckText(e.target.value)}
                          onKeyDown={handleAddCheckItem}
                          onBlur={() =>
                            setTimeout(() => {
                              setAddingCheckItem(false);
                              setNewCheckText("");
                            }, 200)
                          }
                          placeholder="Type item and press Enter…"
                          className="w-full py-3 text-sm outline-none placeholder:text-gray-300 text-gray-700"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>


      {/* ── Add Topic Modal ── */}
      <Modal
        isOpen={topicModal}
        onClose={() => setTopicModal(false)}
        title="Add New Topic"
      >
        <InputField
          label="Topic Name"
          required
          placeholder="e.g. Schrödinger's Equation"
          value={topicForm.title}
          onChange={(e) =>
            setTopicForm((p) => ({ ...p, title: e.target.value }))
          }
          onKeyDown={(e) => e.key === "Enter" && handleCreateTopic()}
        />
        <InputField
          label="Description"
          placeholder="Brief description (optional)"
          value={topicForm.description}
          onChange={(e) =>
            setTopicForm((p) => ({ ...p, description: e.target.value }))
          }
        />
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Link to Exam{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            value={topicForm.examId}
            onChange={(e) =>
              setTopicForm((p) => ({ ...p, examId: e.target.value }))
            }
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] transition-all font-medium"
          >
            <option value="">General (not linked to any exam)</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-gray-400">
          Subject: <strong>{activeSubject?.name || "—"}</strong>
        </p>
        <div className="flex gap-3">
          <ModalBtn variant="secondary" onClick={() => setTopicModal(false)}>
            Cancel
          </ModalBtn>
          <ModalBtn
            onClick={handleCreateTopic}
            disabled={!topicForm.title.trim()}
            loading={modalLoading}
          >
            Create Topic
          </ModalBtn>
        </div>
      </Modal>

      {/* ── Add Exam Modal ── */}
      <Modal
        isOpen={examModal}
        onClose={() => setExamModal(false)}
        title="Add New Exam"
      >
        <InputField
          label="Exam Name"
          required
          placeholder="e.g. Quantum Mechanics Midterm"
          value={examForm.name}
          onChange={(e) =>
            setExamForm((p) => ({ ...p, name: e.target.value }))
          }
        />
        <InputField
  label="Exam Date" required
  type="date"
  value={examForm.examDate}
  onChange={(e) => setExamForm((p) => ({ ...p, examDate: e.target.value }))}
  min={new Date().toISOString().split('T')[0]}
/>
        <p className="text-[10px] text-gray-400">Subject: <strong>{activeSubject?.name || "—"}</strong></p>
        <div className="flex gap-3">
          <ModalBtn variant="secondary" onClick={() => setExamModal(false)}>
            Cancel
          </ModalBtn>
          <ModalBtn
            onClick={handleCreateExam}
            disabled={!examForm.name.trim() || !examForm.examDate}
            loading={modalLoading}
          >
            Create Exam
          </ModalBtn>
        </div>
      </Modal>

      {/* ── Exam Detail Modal ── */}
      <Modal
        isOpen={!!examDetailModal}
        onClose={() => setExamDetailModal(null)}
        title={examDetailModal?.name || "Exam"}
        wide
      >
        {examDetailModal && (
          <ExamDetailModal
            exam={examDetailModal}
            onClose={() => setExamDetailModal(null)}
            activeSubjectId={activeSubject?.id}
            allSubjectTopics={effectiveTopics}
            onTopicStatusChange={() => fetchTopics(activeSubject.id)}
            onDeleteTopic={() => fetchTopics(activeSubject.id)}
            onAddTopic={() => fetchTopics(activeSubject.id)}
            onDeleteExam={handleDeleteExam}
            onUpdateDate={handleUpdateExamDate}
            openConfirm={openConfirm}
          />
        )}
      </Modal>

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={closeConfirm}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

export default CoverageTrackerPage;