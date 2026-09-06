import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Zap,
  Hourglass,
  PenLine,
  GraduationCap
} from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import quizService from '../../services/quizService';

import { getUserId } from '../../utils/auth';

/* --- PROGRESS RING --- */
const ProficiencyRing = ({ score, total }) => {
  const value = total > 0 ? Math.round((score / total) * 100) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getGrade = (val) => {
    if (val >= 90) return 'A+';
    if (val >= 80) return 'A';
    if (val >= 70) return 'B';
    if (val >= 60) return 'C';
    if (val >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
        <circle cx="96" cy="96" r={radius} stroke="#6366f1" strokeWidth="12" strokeDasharray={circumference} style={{ strokeDashoffset }} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-slate-900">{value}%</span>
        <span className="mt-1 text-sm font-bold text-emerald-600">Grade {getGrade(value)}</span>
      </div>
    </div>
  );
};

/* --- RESULT DETAIL --- */
const ResultDetail = ({ detail, summary }) => {
  const quiz = summary.quiz || {};
  const graded = detail.graded === true;
  const score = detail.totalMarks ?? summary.score ?? 0;
  const total = detail.maxMarks || summary.totalQuestions || quiz.questions?.length || 0;
  const questions = detail.questions || [];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <section className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><GraduationCap size={28} /></div>
          <div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">{quiz.category}</p>
            <h1 className="text-2xl font-extrabold text-slate-900">{quiz.topic || 'Assessment'}</h1>
            {graded ? (
              <p className="text-sm text-slate-500 font-medium mt-1">You scored {score} / {total}</p>
            ) : (
              <p className="text-sm text-amber-500 font-semibold mt-1 flex items-center justify-center md:justify-start gap-1"><Hourglass size={14} /> Pending review — result will appear once graded</p>
            )}
          </div>
        </div>
        {graded && <ProficiencyRing score={score} total={total} />}
      </section>

      {/* Question breakdown */}
      <section>
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4">Question Breakdown</h2>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isDescriptive = q.type === 'DESCRIPTIVE';
            if (isDescriptive) {
              const studentText = q.studentAnswer || '';
              const awarded = graded ? (q.awardedMarks ?? null) : null;
              const maxMark = q.maxMarks || 1;
              return (
                <div key={q.id} className={`p-4 md:p-6 rounded-3xl border shadow-sm ${awarded != null ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-200'}`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-800"><span className="text-slate-300 mr-2">{idx + 1}.</span> {q.text}</h3>
                    <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${awarded != null ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {awarded != null ? <><CheckCircle2 size={14} /> {awarded}/{maxMark} marks</> : <><Hourglass size={14} /> {graded ? 'Not assessed' : 'Awaiting review'}</>}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Answer</p>
                    <p className="text-sm text-slate-700 leading-relaxed flex items-start gap-2"><PenLine size={14} className="shrink-0 mt-0.5 text-indigo-500" />{studentText || '—'}</p>
                  </div>
                  {graded && q.modelAnswer && (
                    <div className="bg-indigo-50 rounded-xl p-4 mt-3">
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Model Answer</p>
                      <p className="text-sm text-indigo-800 leading-relaxed">{q.modelAnswer}</p>
                    </div>
                  )}
                </div>
              );
            }
            const isCorrect = graded && q.isCorrect === true;
            const userAnswer = q.selectedOptionIndex;
            const isSkipped = userAnswer === undefined || userAnswer === null;
            const showCorrect = graded && q.correctOptionIndex != null;
            return (
              <div key={q.id} className={`p-4 md:p-6 rounded-3xl border shadow-sm ${isCorrect ? 'bg-emerald-50/30 border-emerald-100' : isSkipped ? 'bg-white border-slate-200' : 'bg-red-50/30 border-red-100'}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 mb-4">
                  <h3 className="text-lg font-bold text-slate-800"><span className="text-slate-300 mr-2">{idx + 1}.</span> {q.text}</h3>
                  <div className="shrink-0 w-fit">
                    {graded ? (
                      isCorrect ? (
                        <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Correct</div>
                      ) : isSkipped ? (
                        <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Skipped</div>
                      ) : (
                        <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={14} /> Incorrect</div>
                      )
                    ) : (
                      <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Hourglass size={14} /> Awaiting review</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(q.options || []).map((opt, optIdx) => {
                    const isUserSelection = userAnswer === optIdx;
                    const isActualCorrect = showCorrect && q.correctOptionIndex === optIdx;
                    let optionClass = "bg-white border-slate-100 text-slate-600";
                    if (isActualCorrect) optionClass = "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold";
                    else if (isUserSelection && !graded) optionClass = "bg-indigo-50 border-indigo-200 text-indigo-800 font-bold";
                    else if (isUserSelection && !isActualCorrect) optionClass = "bg-red-50 border-red-200 text-red-800 font-bold";
                    return (
                      <div key={optIdx} className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${optionClass}`}>
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-black shrink-0 ${isActualCorrect ? 'bg-emerald-500 text-white' : isUserSelection ? (graded ? 'bg-red-500 text-white' : 'bg-indigo-500 text-white') : 'bg-slate-100 text-slate-400'}`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

/* --- MAIN PAGE --- */
const QuizResultsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    quizService.getUserAttempts(userId)
      .then(res => setAttempts(res || []))
      .catch(err => { console.error("Error fetching attempts:", err); setAttempts([]); })
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (attempt) => {
    setSelectedAttempt(attempt);
    setLoadingDetail(true);
    setSelectedDetail(null);
    try {
      const detail = await quizService.getSubmissionResult(attempt.id);
      setSelectedDetail(detail);
    } catch (err) {
      console.error("Error fetching result detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto selection:bg-indigo-100 selection:text-indigo-900">
          <div className="p-4 md:p-12 lg:p-16 max-w-5xl mx-auto">
          {selectedAttempt ? (
            <>
              <button onClick={() => { setSelectedAttempt(null); setSelectedDetail(null); }} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 mb-6 transition-colors">
                <RotateCcw size={18} /> Back to Results
              </button>
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-600 font-bold">Loading breakdown...</p>
                </div>
              ) : selectedDetail ? (
                <ResultDetail detail={selectedDetail} summary={selectedAttempt} />
              ) : (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 md:p-10 text-center">
                  <p className="text-slate-500 font-medium">This attempt is still being reviewed. Check back after grading is complete.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quiz Results</h1>
                <p className="text-slate-500 font-medium mt-1">Track your performance across all assessments.</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-600 font-bold">Loading results...</p>
                </div>
              ) : attempts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-300">
                  <div className="p-6 bg-slate-50 rounded-full mb-6"><ClipboardCheck size={40} className="text-slate-300" /></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No Results Yet</h3>
                  <p className="text-slate-500 max-w-md text-center">Once you attempt a quiz, your result will appear here after grading.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attempts.map((a) => {
                    const quiz = a.quiz || {};
                    const questions = quiz.questions || [];
                    const maxMarksTotal = questions.reduce((sum, q) => sum + (q.maxMarks || 1), 0);
                    const score = a.totalMarks ?? a.score ?? 0;
                    const total = maxMarksTotal || a.totalQuestions || 0;
                    const graded = a.graded === true;
                    return (
                      <button
                        key={a.id}
                        onClick={() => openDetail(a)}
                        className="w-full text-left bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0"><Zap size={22} /></div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate">{quiz.topic || 'Assessment'}</p>
                            <p className="text-xs text-slate-400 font-medium">{quiz.category || 'General'} • {new Date(a.endTime || a.startTime || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                          {graded ? (
                            <>
                              <div className="text-left sm:text-right">
                                <p className="text-lg font-black text-indigo-600">{score}<span className="text-slate-300 text-sm">/{total}</span></p>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">+{a.xpGained || 0} XP</p>
                              </div>
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">Completed</span>
                            </>
                          ) : (
                            <>
                              <div className="text-left sm:text-right">
                                <p className="text-lg font-black text-amber-500">Pending</p>
                              </div>
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">Pending Review</span>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizResultsPage;