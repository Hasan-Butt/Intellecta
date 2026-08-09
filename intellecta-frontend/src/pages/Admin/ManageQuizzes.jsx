import React, { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import Swal from "sweetalert2";
import {
  ClipboardCheck,
  Clock,
  PenLine,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Save,
  History,
  FileText,
  PenSquare
} from "lucide-react";
import quizService from "../../services/quizService";

const ManageQuizzes = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [grades, setGrades] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await quizService.getPendingSubmissions();
      setPending(res || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openDetail = async (attemptId) => {
    try {
      const res = await quizService.getSubmissionDetail(attemptId);
      setSelected(res);
      const initial = {};
      (res.questions || []).forEach(q => {
        if (q.type === "DESCRIPTIVE") initial[q.id] = q.awardedMarks ?? 0;
      });
      setGrades(initial);
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };

  const setGrade = (questionId, value) => {
    const num = parseInt(value, 10);
    setGrades(prev => ({ ...prev, [questionId]: isNaN(num) ? 0 : num }));
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await quizService.gradeSubmission(selected.attemptId, grades);
      await Swal.fire({
        title: "Graded!",
        text: "Submission graded and results published to the student.",
        icon: "success",
        confirmButtonColor: "#6C5DD3"
      });
      setSelected(null);
      setGrades({});
      fetchPending();
    } catch (err) {
      console.error("Error grading:", err);
      Swal.fire({
        title: "Error",
        text: "Could not save the grading. Please try again.",
        icon: "error",
        confirmButtonColor: "#6C5DD3"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <div className="flex min-h-screen bg-[#F9FAFB] font-inter">
        <Sidebar />
        <main className="flex-1 p-10 space-y-8 overflow-x-hidden">
          <div className="max-w-[1000px] mx-auto">
            <header className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#111827] flex items-center gap-3">
                  <PenSquare className="text-[#6C5DD3]" /> Quiz Submissions
                </h2>
                <p className="text-gray-400 font-bold mt-2">
                  Review and grade descriptive answers submitted by students.
                </p>
              </div>
              <button onClick={fetchPending} className="text-sm font-bold text-gray-500 hover:text-[#6C5DD3] transition-colors">
                ↻ Refresh
              </button>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-[#6C5DD3] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#6C5DD3] font-bold">Loading submissions...</p>
              </div>
            ) : selected ? (
              <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ClipboardCheck size={24} /></div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{selected.quizCategory}</p>
                      <h3 className="text-xl font-black text-[#111827]">{selected.quizTopic}</h3>
                      <p className="text-sm text-gray-400 font-semibold">Student: {selected.studentName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="flex items-center gap-2 text-gray-400 font-bold hover:text-[#111827] transition-all"
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                </div>

                {(selected.questions || []).map((q, idx) => (
                  <div key={q.id} className="border border-gray-100 rounded-3xl p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-bold text-lg text-[#111827]"><span className="text-gray-300 mr-2">{idx + 1}.</span>{q.text}</h4>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.type === 'DESCRIPTIVE' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {q.type === 'DESCRIPTIVE' ? 'Descriptive' : 'Objective'}
                      </span>
                    </div>

                    {q.type === 'DESCRIPTIVE' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Student Answer</p>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{q.studentAnswer || <span className="text-slate-400">No answer submitted.</span>}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Model Answer</p>
                          <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">{q.modelAnswer || <span className="text-slate-400 italic">No model answer set.</span>}</p>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Marks within max {q.maxMarks || 1}</span>
                          <input
                            type="number"
                            min="0"
                            max={q.maxMarks || 1}
                            value={grades[q.id] ?? 0}
                            onChange={(e) => setGrade(q.id, e.target.value)}
                            className="w-24 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 font-bold text-sm outline-none focus:border-[#6C5DD3]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(q.options || []).map((opt, oi) => {
                          const isCorrect = oi === q.correctOptionIndex;
                          const isSelected = oi === q.selectedOptionIndex;
                          return (
                            <div key={oi} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm ${isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : isSelected ? 'border-red-200 bg-red-50 text-red-800' : 'border-gray-100 bg-gray-50 text-slate-600'}`}>
                              {isCorrect ? <CheckCircle2 size={16} className="text-emerald-500" /> : isSelected ? <XCircle size={16} className="text-red-500" /> : <span className="w-4" />}
                              <span className="font-bold">{String.fromCharCode(65 + oi)}.</span> {opt}
                              {isSelected && !isCorrect && <span className="ml-auto text-[10px] font-black uppercase">Student's choice</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#6C5DD3] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <CheckCircle2 size={20} /> {saving ? "Saving..." : "Save & Publish Grade"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pending.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
                    <div className="p-6 bg-slate-50 rounded-full mb-6"><ClipboardCheck size={40} className="text-gray-300" /></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Submissions</h3>
                    <p className="text-gray-400 max-w-md text-center">Descriptive quiz submissions awaiting your review will appear here.</p>
                  </div>
                ) : (
                  pending.map((p) => {
                    const q = p.quiz || {};
                    return (
                      <button
                        key={p.id}
                        onClick={() => openDetail(p.id)}
                        className="w-full text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#6C5DD3]/30 transition-all p-6 flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0"><FileText size={22} /></div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-gray-900 truncate">{q.topic || 'Untitled Quiz'}</p>
                            <p className="text-xs text-gray-400 font-medium">{q.category || 'General'} • {p.user?.username || 'Student'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-gray-400">
                          <span className="flex items-center gap-1 text-xs font-bold"><Clock size={14} /> {new Date(p.endTime || p.startTime || Date.now()).toLocaleDateString()}</span>
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">Pending</span>
                          <ArrowLeft size={18} className="opacity-0 -rotate-180 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageQuizzes;