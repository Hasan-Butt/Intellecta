import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  BadgeCheck, 
  GraduationCap, 
  ClipboardCheck, 
  Zap 
} from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';

/* --- SUB-COMPONENT: PROFICIENCY DASHBOARD --- */
const ProficiencyDashboard = ({ score, total }) => {
  const proficiencyValue = total > 0 ? Math.round((score / total) * 100) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (proficiencyValue / 100) * circumference;

  const getGrade = (val) => {
    if (val >= 90) return 'A+';
    if (val >= 80) return 'A';
    if (val >= 70) return 'B';
    if (val >= 60) return 'C';
    if (val >= 50) return 'D';
    return 'F';
  };

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="md:col-span-2 relative overflow-hidden bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-lg flex flex-col md:flex-row items-center justify-between">
        <GraduationCap className="absolute -top-10 -right-10 text-slate-50 w-72 h-72 -rotate-12 pointer-events-none" strokeWidth={1} />
        <div className="relative z-10 flex flex-col max-w-full md:max-w-[60%]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 w-fit">
             <span>Overall Standing</span>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <h1 className="text-6xl font-extrabold text-slate-900 leading-none tracking-tighter">{proficiencyValue}%</h1>
            <span className="text-xl font-bold text-emerald-600">{getGrade(proficiencyValue)}</span>
          </div>
          <p className="text-slate-500 text-base leading-relaxed font-medium">
            Assessment completed! You've correctly answered <span className="text-slate-900 font-bold">{score} out of {total}</span> questions.
          </p>
        </div>
        <div className="relative mt-8 md:mt-0 flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <circle cx="96" cy="96" r={radius} stroke="#6366f1" strokeWidth="12" strokeDasharray={circumference} style={{ strokeDashoffset }} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-3.5 shadow-xl">
              <BadgeCheck className="text-[#6366f1] w-10 h-10" fill="currentColor" fillOpacity={0.1} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-3xl p-6 flex items-center gap-5 border border-slate-200 shadow-md flex-1">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl shrink-0"><ClipboardCheck size={24} /></div>
          <div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Accuracy</p>
            <h2 className="text-3xl font-extrabold text-slate-900">{score}/{total}</h2>
          </div>
        </div>
        <div className="bg-[#BEF264] rounded-[2.5rem] p-6 flex items-center gap-6 shadow-lg flex-1">
          <div className="p-4 bg-black/10 text-[#0F172A] rounded-2xl"><Zap size={28} fill="currentColor" /></div>
          <div>
            <p className="text-[#0F172A]/50 font-black uppercase tracking-widest text-[10px] mb-1">Experience</p>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">+{score * 50} XP</h2>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --- SUB-COMPONENT: DETAILED BREAKDOWN --- */
const DetailedBreakdown = ({ quiz, userAnswers }) => {
  if (!quiz || !quiz.questions || !userAnswers) return null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Question Breakdown</h2>
      <div className="space-y-4">
        {quiz.questions.map((q, idx) => {
          const userAnswer = userAnswers[q.id];
          const isCorrect = userAnswer === q.correctOptionIndex;
          const isSkipped = userAnswer === undefined || userAnswer === null;

          return (
            <div key={q.id} className={`p-6 rounded-3xl border shadow-sm ${isCorrect ? 'bg-emerald-50/30 border-emerald-100' : isSkipped ? 'bg-white border-slate-200' : 'bg-red-50/30 border-red-100'}`}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <h3 className="text-lg font-bold text-slate-800 leading-relaxed">
                  <span className="text-slate-300 mr-2">{idx + 1}.</span> {q.text}
                </h3>
                <div className="shrink-0">
                  {isCorrect ? (
                    <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={16} /> Correct</div>
                  ) : isSkipped ? (
                    <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">Skipped</div>
                  ) : (
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={16} /> Incorrect</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => {
                  const isUserSelection = userAnswer === optIdx;
                  const isActualCorrect = q.correctOptionIndex === optIdx;
                  
                  let optionClass = "bg-white border-slate-100 text-slate-600 hover:border-slate-200";
                  if (isActualCorrect) {
                    optionClass = "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold shadow-sm shadow-emerald-100/50";
                  } else if (isUserSelection && !isActualCorrect) {
                    optionClass = "bg-red-50 border-red-200 text-red-800 font-bold shadow-sm shadow-red-100/50";
                  }

                  return (
                    <div key={optIdx} className={`p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all ${optionClass}`}>
                      <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black shrink-0 ${isActualCorrect ? 'bg-emerald-500 text-white' : isUserSelection ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
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
  );
};


/* --- MAIN PAGE COMPONENT --- */
const QuizResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const attempt = location.state?.attempt;
  const quiz = location.state?.quiz;

  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-xl font-bold text-slate-400">No result data available.</p>
        <button onClick={() => navigate('/quiz')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Navbar />

      <div className="flex flex-1 relative">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* 1. Statistics Header */}
            <ProficiencyDashboard score={attempt.score} total={attempt.totalQuestions} />

            {/* 2. Detailed Breakdown */}
            {quiz && attempt.userAnswers && (
               <DetailedBreakdown quiz={quiz} userAnswers={attempt.userAnswers} />
            )}

            {/* 3. Completion Card */}
            <section className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-12 p-10 text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Quiz Submitted Successfully!</h1>
              <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                Great job completing the <span className="text-slate-900 font-bold">{attempt.quiz?.topic || 'Assessment'}</span>. Your progress has been updated in the global leaderboard.
              </p>
              
              <div className="flex flex-col md:flex-row gap-5 justify-center">
                <button 
                  onClick={() => navigate('/quiz')}
                  className="flex-1 max-w-xs group flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-2xl shadow-indigo-500/30"
                >
                  <RotateCcw size={24} className="group-hover:rotate-[-45deg] transition-transform" />
                  Try Another Quiz
                </button>
                <button 
                   onClick={() => navigate('/leaderboard')}
                   className="flex-1 max-w-xs px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm"
                >
                   Check Leaderboard
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizResultsPage;
;