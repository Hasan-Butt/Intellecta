import React from 'react';
import { 
  RotateCcw, 
  LayoutDashboard, 
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
const ProficiencyDashboard = () => {
  const proficiencyValue = 92;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (proficiencyValue / 100) * circumference;

  return (
    <section className="w-full max-w-x8l ml-0 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="md:col-span-2 relative overflow-hidden bg-white rounded-2xl p-8 md:p-10 ring-1 ring-slate-200 shadow-sm shadow-indigo-500/5 flex flex-col md:flex-row items-center justify-between">
        <GraduationCap className="absolute -top-10 -right-10 text-slate-50 w-72 h-72 -rotate-12 pointer-events-none" strokeWidth={1} />
        <div className="relative z-10 flex flex-col max-w-full md:max-w-[60%]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 w-fit">
             <span>Overall Standing</span>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <h1 className="text-6xl font-extrabold text-slate-900 leading-none tracking-tighter">92%</h1>
            <span className="text-xl font-bold text-emerald-600">A+</span>
          </div>
          <p className="text-slate-500 text-base leading-relaxed font-medium">
            Excellent performance! You've shown deep understanding of <span className="text-slate-900 font-bold">Modern Rationalism</span>.
          </p>
        </div>
        <div className="relative mt-8 md:mt-0 flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <circle cx="96" cy="96" r={radius} stroke="#6366f1" strokeWidth="12" strokeDasharray={circumference} style={{ strokeDashoffset }} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-3.5 ring-1 ring-slate-100">
              <BadgeCheck className="text-[#6366f1] w-10 h-10" fill="currentColor" fillOpacity={0.1} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-6 flex items-center gap-5 ring-1 ring-slate-200 shadow-sm flex-1">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl shrink-0"><ClipboardCheck size={24} /></div>
          <div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Accuracy</p>
            <h2 className="text-3xl font-extrabold text-slate-900">14/15</h2>
          </div>
        </div>
        <div className="bg-[#BEF264] rounded-[3rem] p-6 flex items-center gap-6 shadow-sm flex-1">
          <div className="p-4 bg-black/10 text-[#0F172A] rounded-2xl"><Zap size={28} fill="currentColor" /></div>
          <div>
            <p className="text-[#0F172A]/50 font-black uppercase tracking-widest text-[10px] mb-1">Experience</p>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">+250 XP</h2>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --- SUB-COMPONENT: QUESTION ITEM --- */
const QuestionItem = ({ id, text, status, userAnswer, correctSolution, explanation }) => {
  const isCorrect = status === 'correct';
  return (
    <section className="relative pl-16 border-b border-slate-100 pb-10 last:border-0 last:pb-0">
      <span className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
        {id}
      </span>
      <h2 className="text-lg font-bold text-slate-900 leading-snug mb-4 tracking-tight">{text}</h2>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest mb-5 ${
        isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
      }`}>
        {isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {status}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl ring-1 ${isCorrect ? 'bg-emerald-50/30 ring-emerald-200' : 'bg-red-50/30 ring-red-200'}`}>
          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your Answer</span>
          <p className="text-base font-semibold text-slate-800">{userAnswer}</p>
        </div>
        {!isCorrect && (
          <div className="p-4 rounded-xl ring-1 bg-emerald-50/30 ring-emerald-200">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 mb-2">Correct Solution</span>
            <p className="text-base font-semibold text-slate-800">{correctSolution}</p>
          </div>
        )}
      </div>
    </section>
  );
};

/* --- MAIN PAGE COMPONENT --- */
const QuizResultsPage = () => {
  const questions = [
    { id: '01', text: "Who is often referred to as the 'Father of Modern Philosophy'?", status: 'correct', userAnswer: 'René Descartes' },
    { id: '05', text: "Spinoza's concept of 'Deus sive Natura' suggests that God and nature are what?", status: 'incorrect', userAnswer: 'Distinct entities', correctSolution: 'Identical substance', explanation: '"God is the single substance."' },
    { id: '12', text: "The principle of 'Tabula Rasa' is associated with which philosopher?", status: 'correct', userAnswer: 'John Locke' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Navbar />

      <div className="flex flex-1 relative">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto"></div>
          
          {/* 1. Statistics Header */}
          <ProficiencyDashboard />

          {/* 2. Detailed Review Section */}
          <section className="max-w-5xl ml-0 bg-white rounded-2xl shadow-2xl shadow-indigo-900/5 border border-slate-100 overflow-hidden mb-12">
            <header className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Question Review</h1>
                <p className="text-slate-400 text-lg mt-1 font-medium">Deep dive into your performance.</p>
              </div>
              <div className="flex gap-2 mt-6 md:mt-0">
                <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                  All Questions
                </button>
                <button className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100 shadow-sm">
                  Mistakes (1)
                </button>
              </div>
            </header>

            <div className="p-8 md:p-10 flex flex-col gap-10">
              {questions.map((q) => (
                <QuestionItem key={q.id} {...q} />
              ))}
            </div>
          </section>

          {/* Navigation Buttons */}
          <nav className="max-w-8xl ml-0 flex flex-col md:flex-row gap-5 pb-12">
            <button className="flex-1 group flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-2xl shadow-indigo-500/30">
              <RotateCcw size={24} className="group-hover:rotate-[-45deg] transition-transform" />
              Retake Quiz
            </button>
          </nav>
        </main>
      </div>
    </div>
  );
};

export default QuizResultsPage;