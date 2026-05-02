import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, ChevronDown, ChevronRight, AlertTriangle,
  Shuffle, Check, Zap, Trash2, X, Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import { getSubjects } from "../../services/documentService";
import {
  getTopicsBySubject, getTopicsByExam, createTopic,
  bulkUpdateTopicStatuses, deleteTopic,
  getExamsBySubject, createExam, updateExamDate, deleteExam,
  getChecklistByExam, createChecklistItem, toggleChecklistItem, deleteChecklistItem,
} from "../../services/coverageService";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  MASTERED:    { label: "MASTERED",    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  IN_PROGRESS: { label: "IN PROGRESS", color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200"  },
  REVIEWED:    { label: "REVIEWED",    color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200"    },
  NOT_STARTED: { label: "NOT STARTED", color: "text-gray-400",    bg: "bg-gray-50",    border: "border-gray-200"    },
};

const STATUS_ORDER = ["NOT_STARTED", "IN_PROGRESS", "REVIEWED", "MASTERED"];

const STATUS_ICONS = {
  MASTERED: "✦", IN_PROGRESS: "✳", REVIEWED: "✧", NOT_STARTED: "✩",
};

const WEIGHT = { NOT_STARTED: 0, IN_PROGRESS: 25, REVIEWED: 50, MASTERED: 100 };

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

// ── Sub Components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;
  return (
    <span className={cn(
      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border cursor-pointer select-none",
      cfg.color, cfg.bg, cfg.border
    )}>
      {cfg.label}
    </span>
  );
};

const CircularCountdown = ({ days }) => {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, 1 - days / 30));
  const dash = pct * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
      <circle cx="36" cy="36" r={radius} fill="none" stroke="white" strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" />
      <text x="36" y="33" textAnchor="middle" fill="white" fontSize="13" fontWeight="800">
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col gap-6 max-h-[90vh] overflow-y-auto",
          wide ? "w-full max-w-2xl" : "w-full max-w-md"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
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
      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] transition-all placeholder:text-gray-300 font-medium"
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
        ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9] shadow-lg shadow-indigo-100"
        : "border border-gray-200 text-gray-500 hover:bg-gray-50"
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

  useEffect(() => { fetchExamTopics(); }, [fetchExamTopics]);

  const effectiveTopics = examTopics.map((t) => ({
    ...t,
    status: pendingStatuses[t.id] ?? t.status,
  }));

  const examProgress = calcWeightedProgress(effectiveTopics);
  const examPanic = calcPanicLevel(exam.daysLeft, examProgress);

  const panicColors = {
    Critical: "text-red-500", High: "text-orange-500",
    Medium: "text-yellow-600", Low: "text-emerald-500",
  };

  const handleCycleStatus = async (topicId, currentStatus) => {
    const idx = STATUS_ORDER.indexOf(currentStatus);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    setPendingStatuses((prev) => ({ ...prev, [topicId]: next }));
    try {
      await bulkUpdateTopicStatuses([{ id: topicId, status: next }]);
      await fetchExamTopics();
      onTopicStatusChange(); // refresh parent subject topics too
    } catch (err) {
      setPendingStatuses((prev) => { const c = { ...prev }; delete c[topicId]; return c; });
    }
  };

  const handleDeleteTopicFromExam = async (topicId) => {
    if (!window.confirm("Remove this topic from exam?")) return;
    try {
      await deleteTopic(topicId);
      await fetchExamTopics();
      onDeleteTopic();
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
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
              <span className="text-[#7c3aed] font-bold">{exam.daysLeft} days left</span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Panic Level:</span>
            <span className={cn("text-sm font-black", panicColors[examPanic])}>{examPanic}</span>
          </div>
        </div>
        <button
          onClick={() => onDeleteExam(exam.id)}
          className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
        >
          <Trash2 size={13} /> Delete Exam
        </button>
      </div>

      {/* Exam Progress Bar */}
      <div className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Exam Coverage Progress
          </span>
          <span className="text-lg font-black text-gray-900">{examProgress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#7c3aed] rounded-full transition-all duration-700"
            style={{ width: `${examProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Based on {effectiveTopics.length} topic{effectiveTopics.length !== 1 ? "s" : ""} linked to this exam
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
          <h3 className="text-sm font-extrabold text-gray-800">Topics for this Exam</h3>
          <button
            onClick={() => setAddTopicModal(true)}
            className="flex items-center gap-1 text-[#7c3aed] text-[11px] font-black hover:underline"
          >
            <Plus size={12} /> Add Topic
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                    <span className={cn("text-base w-5 text-center flex-shrink-0", STATUS_CONFIG[topic.status]?.color)}>
                      {STATUS_ICONS[topic.status]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{topic.title}</p>
                      {topic.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{topic.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <button onClick={() => handleCycleStatus(topic.id, topic.status)}>
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

      {/* Add Topic inline modal */}
      {addTopicModal && (
        <div className="bg-[#f5f3ff] rounded-2xl p-5 border border-[#ddd6fe] flex flex-col gap-4">
          <h4 className="text-sm font-extrabold text-[#7c3aed]">New Topic for this Exam</h4>
          <InputField
            label="Topic Name" required
            placeholder="e.g. Wave Functions"
            value={topicForm.title}
            onChange={(e) => setTopicForm((p) => ({ ...p, title: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
          />
          <InputField
            label="Description"
            placeholder="Brief description (optional)"
            value={topicForm.description}
            onChange={(e) => setTopicForm((p) => ({ ...p, description: e.target.value }))}
          />
          <div className="flex gap-3">
            <ModalBtn variant="secondary" onClick={() => { setAddTopicModal(false); setTopicForm({ title: "", description: "" }); }}>
              Cancel
            </ModalBtn>
            <ModalBtn onClick={handleAddTopic} disabled={!topicForm.title.trim()} loading={creating}>
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

  // Modals
  const [topicModal, setTopicModal] = useState(false);
  const [examModal, setExamModal] = useState(false);
  const [examDetailModal, setExamDetailModal] = useState(null); // exam object

  // Modal form state
  const [topicForm, setTopicForm] = useState({ title: "", description: "", examId: "" });
  const [examForm, setExamForm] = useState({ name: "", examDate: "" });
  const [modalLoading, setModalLoading] = useState(false);

  // ── Fetch subjects ──────────────────────────────────────────────────────────

  useEffect(() => {
    getSubjects()
      .then((res) => {
        let data = res.data;
        if (data && !Array.isArray(data) && Array.isArray(data.data)) data = data.data;
        if (!Array.isArray(data)) data = [];
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
    Promise.all([fetchTopics(activeSubject.id), fetchExams(activeSubject.id)])
      .finally(() => setLoading(false));
  }, [activeSubject, fetchTopics, fetchExams]);

  useEffect(() => { fetchChecklist(selectedExam?.id); }, [selectedExam, fetchChecklist]);

  // ── Derived values ──────────────────────────────────────────────────────────

  // All topics for subject-level progress bar (including general)
  const effectiveTopics = topics.map((t) => ({
    ...t, status: pendingStatuses[t.id] ?? t.status,
  }));

  // Subject-level progress counts ALL topics
  const progressPct = calcWeightedProgress(effectiveTopics);

  // For panic meter and recommended hours: use only topics linked to nearest exam
  const upcomingExams = exams.filter((e) => e.daysLeft >= 0);
  const nearestExam = upcomingExams[0] || null;
  const daysLeft = nearestExam ? nearestExam.daysLeft : 9999;

  // Topics linked to nearest exam only
  const nearestExamTopics = effectiveTopics.filter(
    (t) => nearestExam && t.examId === nearestExam.id
  );

  // Use exam-specific topics if they exist, fall back to all topics if exam has no linked topics
  const examTopicsForCalc = nearestExamTopics.length > 0 ? nearestExamTopics : [];
  const examProgress = calcWeightedProgress(examTopicsForCalc);

  const panicLevel = nearestExam
    ? calcPanicLevel(daysLeft, examTopicsForCalc.length > 0 ? examProgress : progressPct)
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

  const lowestTopic = [...(examTopicsForCalc.length > 0 ? nearestExamTopics : effectiveTopics)]
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))[0];

  const showBehindAlert = nearestExam && daysLeft <= 14 &&
    (examTopicsForCalc.length > 0 ? examProgress : progressPct) < 50;

  // ── Topic handlers ──────────────────────────────────────────────────────────

  const cycleStatus = async (topicId, currentStatus) => {
    const idx = STATUS_ORDER.indexOf(currentStatus);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    setPendingStatuses((prev) => ({ ...prev, [topicId]: next }));
    try {
      await bulkUpdateTopicStatuses([{ id: topicId, status: next }]);
      await fetchTopics(activeSubject.id);
    } catch (err) {
      console.error("Failed to auto-save status:", err);
      setPendingStatuses((prev) => { const c = { ...prev }; delete c[topicId]; return c; });
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("Delete this topic?")) return;
    try {
      await deleteTopic(topicId);
      await fetchTopics(activeSubject.id);
    } catch (err) {
      console.error("Failed to delete topic:", err);
    }
  };

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim()) return;
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

  // ── Exam handlers ───────────────────────────────────────────────────────────

  const handleCreateExam = async () => {
    if (!examForm.name.trim() || !examForm.examDate) return;
    setModalLoading(true);
    try {
      await createExam({ name: examForm.name.trim(), examDate: examForm.examDate, subjectId: activeSubject.id });
      await fetchExams(activeSubject.id);
      setExamModal(false);
      setExamForm({ name: "", examDate: "" });
    } catch (err) {
      console.error("Failed to create exam:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateExamDate = async (examId, newDate) => {
    try {
      await updateExamDate(examId, newDate);
      await fetchExams(activeSubject.id);
      setExamDetailModal(null);
    } catch (err) {
      console.error("Failed to update exam date:", err);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Delete this exam?")) return;
    try {
      await deleteExam(examId);
      await fetchExams(activeSubject.id);
      setExamDetailModal(null);
      if (selectedExam?.id === examId) setSelectedExam(null);
    } catch (err) {
      console.error("Failed to delete exam:", err);
    }
  };

  // ── Checklist handlers ──────────────────────────────────────────────────────

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

  const handleDeleteCheckItem = async (itemId) => {
    if (!window.confirm("Remove this checklist item?")) return;
    try {
      await deleteChecklistItem(itemId);
      await fetchChecklist(selectedExam.id);
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const primaryExam = exams[0] || null;
  const secondaryExams = exams.slice(1);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="px-10 py-10">
            <div className="grid grid-cols-[1fr_380px] gap-8 max-w-6xl">

              {/* ── LEFT ── */}
              <div>
                <div className="mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coverage Tracker</h1>
                      <p className="text-gray-400 text-sm mt-1">Monitor your curriculum mastery in real-time.</p>
                    </div>

                    {/* Subject Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setSubjectOpen(!subjectOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 hover:border-gray-300 transition-colors shadow-sm"
                      >
                        {activeSubject?.name || "Select Subject"}
                        <ChevronDown size={13} className={cn("transition-transform", subjectOpen && "rotate-180")} />
                      </button>
                      {subjectOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20">
                          {subjects.length === 0 && (
                            <p className="text-xs text-gray-400 px-4 py-3 italic">No subjects yet.</p>
                          )}
                          {subjects.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => { setActiveSubject(s); setSubjectOpen(false); }}
                              className={cn(
                                "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between gap-2",
                                activeSubject?.id === s.id ? "text-[#7c3aed] bg-[#f5f3ff]" : "text-gray-600 hover:bg-gray-50"
                              )}
                            >
                              <span className="truncate">{s.name}</span>
                              <span className="text-gray-400 text-[9px] shrink-0">{s.semester}</span>
                              {activeSubject?.id === s.id && <Check size={12} className="shrink-0" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject-level progress — ALL topics */}
                <div className="bg-white rounded-3xl px-6 py-5 mb-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Overall Subject Progress — {activeSubject?.name || "—"}
                    </span>
                    <span className="text-2xl font-black text-gray-900">{progressPct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7c3aed] rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    All topics · NOT STARTED=0% · IN PROGRESS=25% · REVIEWED=50% · MASTERED=100%
                  </p>
                </div>

                {/* Topic List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-5">
                  {loading ? (
                    <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                      <Loader2 size={18} className="animate-spin" /> Loading topics…
                    </div>
                  ) : effectiveTopics.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-10">
                      No topics yet. Click "+ Add Topic" or the ⚡ button.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {effectiveTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between py-4 px-5 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <span className={cn("text-lg w-6 text-center flex-shrink-0", STATUS_CONFIG[topic.status]?.color)}>
                              {STATUS_ICONS[topic.status]}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-800 truncate">{topic.title}</p>
                                {/* Show which exam this topic is linked to */}
                                {topic.examId && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#f0eeff] text-[#7c3aed] border border-[#ddd6fe] shrink-0">
                                    {exams.find((e) => e.id === topic.examId)?.name || "Exam"}
                                  </span>
                                )}
                                {!topic.examId && (
                                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 shrink-0">
                                    General
                                  </span>
                                )}
                              </div>
                              {topic.description && (
                                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{topic.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                            <button onClick={() => cycleStatus(topic.id, topic.status)}>
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
                    onClick={() => { setTopicForm({ title: "", description: "", examId: "" }); setTopicModal(true); }}
                    className="w-full flex items-center gap-2 px-5 py-4 text-[#7c3aed] text-xs font-black hover:bg-[#f5f3ff] transition-colors border-t border-gray-50"
                  >
                    <Plus size={14} /> Add Topic
                  </button>
                </div>
              </div>

              {/* ── RIGHT ── */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-extrabold text-gray-900">Exam Prep</h2>
                  <button
                    onClick={() => { setExamForm({ name: "", examDate: "" }); setExamModal(true); }}
                    className="flex items-center gap-1.5 text-[#7c3aed] text-xs font-bold hover:underline"
                  >
                    <Plus size={13} /> Add Exam
                  </button>
                </div>

                {primaryExam ? (
                  <div
                    className="bg-[#7c3aed] rounded-3xl p-6 mb-4 relative overflow-hidden cursor-pointer hover:bg-[#6d28d9] transition-colors"
                    onClick={() => setExamDetailModal(primaryExam)}
                  >
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                    <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div>
                        <h3 className="text-white font-extrabold text-lg leading-tight">{primaryExam.name}</h3>
                        <p className="text-white/60 text-xs mt-1">{formatDate(primaryExam.examDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 relative z-10">
                      <CircularCountdown days={primaryExam.daysLeft} />
                      <div>
                        <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-1">Panic Level</p>
                        <p className="text-white font-extrabold text-xl">{panicLevel}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-3xl p-6 mb-4 text-center text-gray-400 text-sm">
                    No exams yet. Click "+ Add Exam" above.
                  </div>
                )}

                {secondaryExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white rounded-2xl px-5 py-4 mb-3 border border-gray-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#c4b5fd] transition-colors"
                    onClick={() => setExamDetailModal(exam)}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-800">{exam.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(exam.examDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-[#7c3aed] bg-[#f5f3ff] px-3 py-1.5 rounded-full">
                        {exam.daysLeft < 0 ? "EXPIRED" : `${exam.daysLeft} DAYS LEFT`}
                      </span>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                ))}

                {/* Panic Meter + Recommended */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Panic Meter</p>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className={panicColors[panicLevel]?.text} />
                      <span className={cn("text-sm font-black", panicColors[panicLevel]?.text)}>{panicLevel}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full bg-gradient-to-r rounded-full", panicColors[panicLevel]?.bar, panicColors[panicLevel]?.width)} />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2">
                      {nearestExamTopics.length > 0
                        ? `Based on ${nearestExamTopics.length} topics linked to nearest exam`
                        : "Based on days left + coverage"}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recommended</p>
                    <p className="text-3xl font-black text-gray-900">
                      {recommendedHours === "0.0" || recommendedHours === "0" ? "0 hrs" : `~${recommendedHours} hrs`}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Daily study target</p>
                  </div>
                </div>

                {/* Behind Alert */}
                {showBehindAlert && lowestTopic && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4 flex items-start gap-3">
                    <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-red-600">You're falling behind</p>
                      <p className="text-[11px] text-red-400 mt-0.5 leading-relaxed">
                        You're falling behind on <strong>{activeSubject?.name}</strong>. Your exam is in{" "}
                        <strong>{daysLeft} days</strong> but you've only covered{" "}
                        <strong>{examTopicsForCalc.length > 0 ? examProgress : progressPct}%</strong> of topics. Focus on{" "}
                        <strong>"{lowestTopic.title}"</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pre-Exam Checklist */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-50">
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-sm font-extrabold text-gray-800">Pre-Exam Checklist</h3>
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
                        <span className="text-[10px] text-gray-400 font-bold">
                          {checklist.filter((c) => c.done).length}/{checklist.length} checked
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
                      <p className="text-xs text-gray-400 text-center py-6 italic">Add an exam first.</p>
                    )}
                    {checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-3 group">
                        <button
                          onClick={() => handleToggleCheck(item.id)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                            item.done ? "bg-[#7c3aed] border-[#7c3aed]" : "border-gray-200 hover:border-[#c4b5fd]"
                          )}
                        >
                          {item.done && <Check size={10} className="text-white" strokeWidth={3} />}
                        </button>
                        <span className={cn("text-sm font-medium flex-1 transition-colors", item.done ? "text-gray-400 line-through" : "text-gray-700")}>
                          {item.description}
                        </span>
                        <button
                          onClick={() => handleDeleteCheckItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {addingCheckItem && (
                      <input
                        autoFocus type="text" value={newCheckText}
                        onChange={(e) => setNewCheckText(e.target.value)}
                        onKeyDown={handleAddCheckItem}
                        onBlur={() => setTimeout(() => { setAddingCheckItem(false); setNewCheckText(""); }, 200)}
                        placeholder="Type item and press Enter…"
                        className="w-full py-3 text-sm outline-none placeholder:text-gray-300 text-gray-700"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setTopicForm({ title: "", description: "", examId: "" }); setTopicModal(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#7c3aed] text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center hover:bg-[#6d28d9] transition-all hover:scale-105 active:scale-95 z-50"
      >
        <Zap size={22} fill="white" />
      </button>

      {/* ── Add Topic Modal ── */}
      <Modal isOpen={topicModal} onClose={() => setTopicModal(false)} title="Add New Topic">
        <InputField
          label="Topic Name" required
          placeholder="e.g. Schrödinger's Equation"
          value={topicForm.title}
          onChange={(e) => setTopicForm((p) => ({ ...p, title: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && handleCreateTopic()}
        />
        <InputField
          label="Description"
          placeholder="Brief description (optional)"
          value={topicForm.description}
          onChange={(e) => setTopicForm((p) => ({ ...p, description: e.target.value }))}
        />
        {/* Exam selector — optional */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">
            Link to Exam <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            value={topicForm.examId}
            onChange={(e) => setTopicForm((p) => ({ ...p, examId: e.target.value }))}
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#ede9fe] transition-all font-medium"
          >
            <option value="">General (not linked to any exam)</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.name}</option>
            ))}
          </select>
        </div>
        <p className="text-[10px] text-gray-400">
          Subject: <strong>{activeSubject?.name || "—"}</strong>
        </p>
        <div className="flex gap-3">
          <ModalBtn variant="secondary" onClick={() => setTopicModal(false)}>Cancel</ModalBtn>
          <ModalBtn onClick={handleCreateTopic} disabled={!topicForm.title.trim()} loading={modalLoading}>
            Create Topic
          </ModalBtn>
        </div>
      </Modal>

      {/* ── Add Exam Modal ── */}
      <Modal isOpen={examModal} onClose={() => setExamModal(false)} title="Add New Exam">
        <InputField
          label="Exam Name" required
          placeholder="e.g. Quantum Mechanics Midterm"
          value={examForm.name}
          onChange={(e) => setExamForm((p) => ({ ...p, name: e.target.value }))}
        />
        <InputField
          label="Exam Date" required
          type="date"
          value={examForm.examDate}
          onChange={(e) => setExamForm((p) => ({ ...p, examDate: e.target.value }))}
        />
        <p className="text-[10px] text-gray-400">Subject: <strong>{activeSubject?.name || "—"}</strong></p>
        <div className="flex gap-3">
          <ModalBtn variant="secondary" onClick={() => setExamModal(false)}>Cancel</ModalBtn>
          <ModalBtn onClick={handleCreateExam} disabled={!examForm.name.trim() || !examForm.examDate} loading={modalLoading}>
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
          />
        )}
      </Modal>
    </div>
  );
};

export default CoverageTrackerPage;