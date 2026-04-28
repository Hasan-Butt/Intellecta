import React, { useState } from "react";
import {
  ArrowRight,
  Zap,
  Search,
  ListFilter,
  CalendarDays,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  Star,
  Layers,
  Microscope,
  Sigma,
} from "lucide-react";

// --- LAYOUT IMPORTS ---
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";

const QuizPlatform = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/*Dashboard Sidebar */}
      <Sidebar />

      {/*Primary Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/*Dashboard Navbar */}
        <Navbar />

        {/* Scrollable Quiz Platform Body */}
        <main className="flex-1 overflow-y-auto font-sans selection:bg-indigo-100 selection:text-indigo-900">
          <div className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto">
            {/* --- HERO SECTION --- */}
            <section className="relative w-full overflow-hidden rounded-[3.5rem] shadow-2xl shadow-indigo-900/20 mb-20 min-h-[400px] flex items-center">
              {/* Image Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000')`,
                }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex flex-col py-24 px-10 md:px-24">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#BEF264] text-[#0F172A] text-[11px] font-black uppercase tracking-[0.2em] mb-10 w-fit">
                  <Zap size={14} fill="currentColor" />
                  <span>Flash Challenge</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] mb-8 tracking-tighter max-w-4xl">
                  Quantum Mechanics & <br />
                  <span className="text-indigo-400">Wave Functions</span>
                </h1>

                <p className="text-slate-300 text-xl md:text-2xl leading-relaxed max-w-2xl mb-12 font-medium">
                  Push your limits with our weekly intensive quiz. 15 rapid-fire
                  questions covering the observer effect.
                </p>

                <div className="flex flex-wrap gap-5">
                  <button className="group flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-2xl shadow-indigo-500/40">
                    Start Challenge
                    <ArrowRight
                      size={22}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                  <button className="px-10 py-5 rounded-2xl font-bold text-lg text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-xl">
                    View Syllabus
                  </button>
                </div>
              </div>
            </section>

            {/* --- SEARCH & FILTERS --- */}
            <section className="mb-20 p-3 bg-slate-200/50 rounded-[2.5rem] flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow flex items-center">
                <Search className="absolute left-7 w-6 h-6 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for subjects..."
                  className="w-full h-20 pl-16 pr-8 bg-white rounded-[2rem] text-lg text-slate-700 font-medium placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button className="flex items-center justify-center gap-3 h-20 px-8 bg-white hover:bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-base transition-all border border-transparent hover:border-slate-200 shadow-sm">
                  <ListFilter size={20} /> Filter
                </button>
                <button className="flex items-center justify-center gap-3 h-20 px-8 bg-white hover:bg-slate-50 text-slate-700 rounded-[2rem] font-bold text-base transition-all border border-transparent hover:border-slate-200 shadow-sm">
                  <CalendarDays size={20} /> Recent
                </button>
              </div>
            </section>

            {/* --- COURSE GRID --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
              {/* Molecular Biology */}
              <article className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col">
                <div className="w-full aspect-[16/10] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Biology"
                  />
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Microscope size={24} />
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Available
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Molecular Biology
                  </h3>
                  <p className="text-slate-500 text-base mb-8">
                    Cellular structures, DNA replication, and protein synthesis.
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> 20 mins
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} /> 25 Qs
                    </span>
                  </div>
                </div>
              </article>

              {/* Advanced Calculus */}
              <article className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="w-full aspect-[16/10] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="Math"
                  />
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                      <Sigma size={24} />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Score: 92%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Advanced Calculus
                  </h3>
                  <p className="text-slate-500 text-base mb-8">
                    Differential equations and multi-variable integration.
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-black uppercase">
                      45 mins
                    </span>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      <button className="text-indigo-600 font-bold text-sm hover:underline">
                        Re-attempt
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              {/* Astrophysics II (Locked) */}
              <article className="bg-slate-50/50 rounded-[3rem] border border-slate-200 overflow-hidden flex flex-col opacity-75">
                <div className="w-full aspect-[16/10] bg-slate-200 flex items-center justify-center grayscale">
                  <Lock size={40} className="text-slate-400" />
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-slate-200 text-slate-500 rounded-2xl">
                      <Lock size={24} />
                    </div>
                    <span className="px-3 py-1 bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Locked
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-400 mb-3">
                    Astrophysics II
                  </h3>
                  <p className="text-slate-400 text-base italic mb-8">
                    Complete "General Relativity" to unlock.
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-slate-300">
                    <span className="text-[10px] font-black uppercase">
                      30 mins
                    </span>
                    <Lock size={16} />
                  </div>
                </div>
              </article>

              {/* Featured Card (Neuropharmacology) */}
              <article className="lg:col-span-2 group bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row">
                <div className="md:w-2/5 h-80 md:h-auto overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/8533087/pexels-photo-8533087.jpeg"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt="Neuro"
                  />
                </div>
                <div className="p-12 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Available
                    </span>
                    <span className="flex items-center gap-2 text-indigo-600 font-black text-[11px] uppercase tracking-widest">
                      <Star size={16} fill="currentColor" /> Premium Quiz
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">
                    Neuropharmacology Principles
                  </h3>
                  <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                    Assessment on synaptic transmission and neurotransmitter
                    pathways.
                  </p>
                  <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex gap-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <span className="flex items-center gap-2">
                        <Clock size={16} /> 60m
                      </span>
                      <span className="flex items-center gap-2 text-indigo-500">
                        <Layers size={16} /> Expert
                      </span>
                    </div>
                    <button className="bg-[#0F172A] text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all active:scale-95">
                      Start Now
                    </button>
                  </div>
                </div>
              </article>

              {/* Modern History Ethics */}
              <article className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="w-full aspect-[16/10] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=800"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="History"
                  />
                </div>
                <div className="p-10 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
                      <BookOpen size={24} />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      Score: 68%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    History Ethics
                  </h3>
                  <p className="text-slate-500 text-base mb-8">
                    Analyzing ethical frameworks within 20th-century conflicts.
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-black uppercase">
                      25 mins
                    </span>
                    <button className="text-red-600 font-black text-sm hover:underline">
                      Review Mistakes
                    </button>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizPlatform;
