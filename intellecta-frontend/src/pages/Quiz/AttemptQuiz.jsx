import React, { useState, useEffect } from 'react';
import { Timer, Info, ArrowLeft, ArrowRight, Bookmark, CheckCircle2 } from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';

const FullAssessmentInterface = ({ 
  currentStep = 4, 
  totalSteps = 15, 
  initialSeconds = 899,
  topic = "Cognitive Architectures & Synaptic Plasticity",
  marks = "+4.0 Marks" 
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [selectedOption, setSelectedOption] = useState('B');
  const [markedForReview, setMarkedForReview] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const options = [
    { id: 'A', text: 'By implementing a strict linear hierarchy of information flow from sensory input to motor output.' },
    { id: 'B', text: 'Through iterative backpropagation of error signals that minimize the delta between output and target.' },
    { id: 'C', text: 'By utilizing a centralized \'Executive Processor\' that coordinates individual neuron firing rates.' },
    { id: 'D', text: 'Through the elimination of all redundant synaptic connections via a process of natural pruning.' },
  ];

  const navigatorItems = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    status: i < 3 ? 'answered' : i === 7 ? 'marked' : i === 3 ? 'current' : 'not-visited'
  }));

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 antialiased flex flex-col ">
      <Navbar />

      <div className="flex flex-1 relative items-start">
        <aside className="h-full flex-shrink-0 sticky top-0">
           <Sidebar />
        </aside>
      
        <main className="flex-1 overflow-y-auto py-6 px-8">
          <div className="mx-auto max-w-6xl flex flex-col gap-5">
            
            {/* 1. TOP HEADER */}
            <section className="bg-white rounded-1xl shadow-sm border border-slate-200/60 p-4 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-8 w-full">
                <div className="flex flex-col gap-0.5 whitespace-nowrap">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">Current Progress</span>
                  <span className="text-lg font-bold text-[#2563EB] tabular-nums">
                    {currentStep} <span className="text-slate-300 font-light">/</span> {totalSteps}
                  </span>
                </div>
                <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#2563EB] rounded-full transition-all duration-1000 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-slate-100 mx-2" />

              <div className="flex items-center gap-4 bg-red-50/50 border border-red-100 rounded-xl px-4 py-2 min-w-[160px]">
                <Timer className="w-6 h-6 text-red-600" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-[0.15em] mb-1">Remaining</span>
                  <span className="text-lg font-bold text-red-700 tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </section>

            {/* 2. SUB-HEADER */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pb-10 items-start">
              <section className="bg-white rounded-x1 border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                      Question {currentStep} <span className="text-slate-300 font-normal ml-1">of {totalSteps}</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium tracking-wide">{topic}</p>
                  </div>
                  <div className="bg-slate-50 text-slate-600 px-6 py-2 rounded-full text-sm font-bold border border-slate-100">
                    {marks}
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full flex overflow-hidden mt-12">
                  <div className="h-full bg-indigo-500" style={{ width: '25%' }} />
                  <div className="h-full bg-indigo-200" style={{ width: '8%' }} />
                  <div className="flex-1 h-full bg-slate-50" />
                </div>
              </section>

              <aside className="bg-indigo-600 rounded-[32px] p-8 flex flex-col justify-center gap-4 text-white shadow-xl shadow-indigo-100">
                <div className="flex items-center gap-4">
                  <Info className="w-6 h-6 text-indigo-200" strokeWidth={2} />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Sync Status</h2>
                </div>
                <p className="text-lg leading-relaxed text-indigo-50 font-medium">
                  Auto-Submit is active. Your progress is being saved to the cloud.
                </p>
              </aside>
            </div>

            {/* 3. MAIN BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 pb-20 items-stretch">
              {/* Question Content */}
              <section className="space-y-12">
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 relative">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-[1.5] mb-8">
                    In the context of "Parallel Distributed Processing" (PDP) models, how does the system primarily achieve learning through the adjustment of connection weights?
                  </h2>
                  <div className="space-y-6">
                    {options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        className={`w-full flex items-center p-3.5 rounded-lg border-2 transition-all text-left group ${
                          selectedOption === option.id 
                          ? 'border-indigo-600 bg-indigo-50/30' 
                          : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl mr-5 shrink-0 transition-all ${
                          selectedOption === option.id 
                          ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' 
                          : 'bg-white text-slate-400 border border-slate-200'
                        }`}>
                          {option.id}
                        </span>
                        <p className={`flex-1 text-lg font-medium leading-relaxed ${selectedOption === option.id ? 'text-slate-900' : 'text-slate-600'}`}>
                          {option.text}
                        </p>
                        {selectedOption === option.id && (
                          <CheckCircle2 className="text-indigo-600 w-7 h-7 ml-4" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-3 text-slate-400 text-lg font-bold hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-6 h-6" /> Previous
                  </button>
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setMarkedForReview(!markedForReview)}
                      className={`flex items-center gap-3 text-lg font-bold transition-all ${markedForReview ? 'text-orange-500' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                      <Bookmark className={`w-6 h-6 ${markedForReview ? 'fill-current' : ''}`} /> Review Later
                    </button>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ...">
                      Save & Next <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Right Navigator Sidebar */}
              <aside className="space-y-6 sticky top-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-10">Question Navigator</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {navigatorItems.map((item) => (
                      <button
                        key={item.id}
                        className={`h-9 rounded-md text-xs font-bold border-2 transition-all ${
                          item.status === 'answered' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' :
                          item.status === 'marked' ? 'bg-emerald-700 border-emerald-700 text-white shadow-md' :
                          item.status === 'current' ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-50' :
                          'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {item.id}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-12 space-y-5 border-t border-slate-50 pt-10">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <div className="w-4 h-4 bg-indigo-600 rounded-md" /> Answered
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <div className="w-4 h-4 bg-emerald-700 rounded-md" /> Marked
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <div className="w-4 h-4 bg-slate-100 rounded-md" /> Pending
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="font-bold text-xl mb-4 tracking-tight">Expert Hint</h4>
                    <p className="text-base text-slate-400 leading-relaxed font-medium">
                      Focus on "Parallelism." Connectionism relies on simultaneous weight updates.
                    </p>
                  </div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FullAssessmentInterface;