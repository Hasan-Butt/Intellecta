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

/* --- SUB-COMPONENT: PROFICIENCY DASHBOARD --- */
const ProficiencyDashboard = () => {
  const proficiencyValue = 92;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (proficiencyValue / 100) * circumference;

  return (
    <section className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
      {/* Main Score Card */}
      <div className="md:col-span-2 relative overflow-hidden bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-2xl shadow-indigo-500/5 flex flex-col md:flex-row items-center justify-between">
        <GraduationCap className="absolute -top-10 -right-10 text-slate-50 w-72 h-72 -rotate-12 pointer-events-none" strokeWidth={1} />
        
        <div className="relative z-10 flex flex-col max-w-full md:max-w-[60%]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 w-fit">
             <span>Overall Standing</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <h1 className="text-7xl md:text-8xl font-extrabold text-slate-900 leading-none tracking-tighter">92%</h1>
            <span className="text-2xl font-bold text-emerald-600">A+</span>
          </div>
          <p className="text-slate-500 text-lg md:text-xl leading-relaxed font-medium">
            Excellent performance! You've shown deep understanding of the core concepts in <span className="text-slate-900 font-bold">Modern Rationalism</span>.
          </p>
        </div>

        {/* Progress Ring - Sized to match design intent */}
        <div className="relative mt-8 md:mt-0 flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <circle cx="96" cy="96" r={radius} stroke="#6366f1" strokeWidth="12" strokeDasharray={circumference} style={{ strokeDashoffset }} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-4 shadow-xl border border-slate-50">
              <BadgeCheck className="text-[#6366f1] w-10 h-10" fill="currentColor" fillOpacity={0.1} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Column */}
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-[3rem] p-10 flex items-center gap-6 border border-slate-100 shadow-sm transition-all hover:shadow-indigo-500/10">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><ClipboardCheck size={28} /></div>
          <div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Accuracy</p>
            <h2 className="text-3xl font-extrabold text-slate-900">14/15 <span className="text-lg font-bold text-slate-400 ml-1">Correct</span></h2>
          </div>
        </div>
        
        <div className="bg-[#BEF264] rounded-[3rem] p-10 flex items-center gap-6 shadow-xl shadow-lime-500/20 transition-all active:scale-95">
          <div className="p-4 bg-black/10 text-[#0F172A] rounded-2xl"><Zap size={28} fill="currentColor" /></div>
          <div>
            <p className="text-[#0F172A]/50 font-black uppercase tracking-widest text-[10px] mb-1">Experience</p>
            <h2 className="text-3xl font-extrabold text-[#0F172A]">+250 <span className="text-lg font-bold text-[#0F172A]/70 ml-1">XP Earned</span></h2>
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
    <section className="relative pl-16 md:pl-20 border-b border-slate-50 pb-12 last:border-0 last:pb-0">
      <span className="absolute left-0 top-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
        {id}
      </span>
      
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
        {text}
      </h2>

      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-6 ${
        isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
      }`}>
        {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />} 
        {status}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-8 rounded-[2.5rem] border-2 ${
          isCorrect ? 'bg-emerald-50/20 border-emerald-500/20' : 'bg-red-50/20 border-red-500/20'
        }`}>
          <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Your Answer</span>
          <p className="text-xl font-bold text-slate-800">{userAnswer}</p>
        </div>

        {!isCorrect && (
          <div className="p-8 rounded-[2.5rem] border-2 bg-emerald-50/20 border-emerald-500/20">
            <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-3">Correct Solution</span>
            <p className="text-xl font-bold text-slate-800">{correctSolution}</p>
          </div>
        )}
      </div>

      {!isCorrect && explanation && (
        <div className="bg-slate-50 p-8 rounded-[2.5rem] italic text-slate-500 leading-relaxed font-medium border border-slate-100">
          {explanation}
        </div>
      )}
    </section>
  );
};

/* --- MAIN PAGE COMPONENT --- */
const QuizResultsPage = () => {
  const questions = [
    { id: '01', text: "Who is often referred to as the 'Father of Modern Philosophy' due to his meditation on the 'Cogito'?", status: 'correct', userAnswer: 'René Descartes' },
    { id: '05', text: "Spinoza's concept of 'Deus sive Natura' suggests that God and nature are what?", status: 'incorrect', userAnswer: 'Distinct and hierarchical entities', correctSolution: 'Identical, one and the same substance', explanation: '"For Spinoza, God is not a creator outside of the universe, but rather the single substance of which everything is a part."' },
    { id: '12', text: "The principle of 'Tabula Rasa' is most closely associated with which philosopher?", status: 'correct', userAnswer: 'John Locke' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans py-16 px-6 md:px-12 lg:px-16 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. Statistics Header */}
      <ProficiencyDashboard />

      {/* 2. Detailed Review Section */}
      <main className="max-w-7xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/5 border border-slate-100 overflow-hidden mb-12">
        <header className="p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Question Review</h1>
            <p className="text-slate-400 text-lg mt-1 font-medium">Deep dive into your performance and methodology.</p>
          </div>
          <div className="flex gap-3 mt-8 md:mt-0">
            <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
              All Questions
            </button>
            <button className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100 shadow-sm">
              Mistakes (1)
            </button>
          </div>
        </header>

        <div className="p-10 md:p-14 flex flex-col gap-16">
          {questions.map((q) => (
            <QuestionItem key={q.id} {...q} />
          ))}
        </div>
      </main>

      {/* Navigation Buttons */}
      <nav className="max-w-7xl mx-auto flex flex-col md:flex-row gap-5">
        <button className="flex-1 group flex items-center justify-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[2rem] font-bold text-xl transition-all active:scale-95 shadow-2xl shadow-indigo-500/30">
          <RotateCcw size={24} className="group-hover:rotate-[-45deg] transition-transform" />
          Retake Quiz
        </button>
        <button className="flex-1 flex items-center justify-center gap-4 bg-white border border-slate-200 text-slate-700 py-6 rounded-[2rem] font-bold text-xl transition-all hover:bg-slate-50 shadow-sm">
          <LayoutDashboard size={24} />
          Back to Dashboard
        </button>
      </nav>
    </div>
  );
};

export default QuizResultsPage;