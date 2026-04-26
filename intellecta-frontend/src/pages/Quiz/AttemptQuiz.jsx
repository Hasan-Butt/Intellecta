import React, { useState, useEffect } from 'react';
import { Timer, Info, ArrowLeft, ArrowRight, Bookmark, CheckCircle2 } from 'lucide-react';

const FullAssessmentInterface = ({ 
  currentStep = 4, 
  totalSteps = 15, 
  initialSeconds = 899,
  topic = "Cognitive Architectures & Synaptic Plasticity",
  marks = "+4.0 Marks" 
}) => {
  // --- STATE & LOGIC ---
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
    <div className="min-h-screen bg-[#FDFDFF] pb-12 font-['Inter',_sans-serif]">
      {/* 1. TOP HEADER (Progress & Timer - image_2cb9d8.png) */}
      <div className="w-full max-w-6xl mx-auto p-4 flex flex-col gap-4">
        <section className="bg-[#F8F9FA] rounded-2xl shadow-sm border border-gray-200/60 p-4 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-1 items-center gap-6 w-full">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm font-bold tracking-tight text-slate-500 uppercase">PROGRESS:</span>
              <span className="text-lg font-bold text-[#2563EB]">{currentStep} / {totalSteps}</span>
            </div>
            <div className="relative h-3 w-full bg-slate-200/70 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-[#2563EB] rounded-full transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-slate-200 mx-2" />

          <div className="flex items-center gap-4 bg-[#FEE2E2]/40 border border-[#FEE2E2] rounded-2xl px-6 py-3 min-w-[180px]">
            <Timer className="w-7 h-7 text-[#7F1D1D]" strokeWidth={2} />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#7F1D1D]/80 uppercase tracking-wide leading-tight">TIME REMAINING</span>
              <span className="text-2xl font-bold text-[#7F1D1D] tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </section>

        {/* 2. SUB-HEADER (Question Info & Auto-Submit - image_2cb21f.png) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 items-stretch">
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-baseline gap-2">
                  Question {currentStep} <span className="text-slate-400 font-medium text-2xl">of {totalSteps}</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">{topic}</p>
              </div>
              <div className="bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-200">
                {marks}
              </div>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden mt-4">
              <div className="h-full bg-indigo-600" style={{ width: '25%' }} />
              <div className="h-full bg-indigo-200" style={{ width: '8%' }} />
              <div className="flex-1 h-full bg-slate-100" />
            </div>
          </section>

          <aside className="bg-blue-50/60 rounded-2xl border border-blue-100 p-5 flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full border-2 border-blue-800 flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-800" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-black text-blue-900 uppercase tracking-tight">Auto-Submit Enabled</h2>
              <p className="text-[13px] leading-relaxed text-blue-700 font-medium">
                Your progress is being synced in real-time. Session ends automatically at 00:00.
              </p>
            </div>
          </aside>
        </div>

        {/* 3. MAIN BODY (Questions & Navigator - image_2caad6.png) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-2">
          {/* Question Content */}
          <section className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <h2 className="text-xl font-semibold text-slate-800 leading-relaxed mb-10 relative z-10">
                In the context of "Parallel Distributed Processing" (PDP) models, how does the system primarily achieve learning through the adjustment of connection weights?
              </h2>
              <div className="space-y-4">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left ${
                      selectedOption === option.id 
                      ? 'border-indigo-500 bg-indigo-50/30' 
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-4 shrink-0 ${
                      selectedOption === option.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'
                    }`}>
                      {option.id}
                    </span>
                    <p className={`flex-1 text-sm font-medium ${selectedOption === option.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      {option.text}
                    </p>
                    {selectedOption === option.id && <CheckCircle2 className="text-indigo-600 w-5 h-5 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-5 h-5" /> Previous Question
              </button>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setMarkedForReview(!markedForReview)}
                  className={`flex items-center gap-2 font-bold transition-colors ${markedForReview ? 'text-orange-600' : 'text-green-700 hover:text-green-800'}`}
                >
                  <Bookmark className={`w-5 h-5 ${markedForReview ? 'fill-current' : ''}`} /> Mark for Review
                </button>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-200">
                  Save & Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-3">
                {navigatorItems.map((item) => (
                  <button
                    key={item.id}
                    className={`h-10 rounded-lg text-xs font-bold border ${
                      item.status === 'answered' ? 'bg-indigo-600 border-indigo-600 text-white' :
                      item.status === 'marked' ? 'bg-[#436117] border-[#436117] text-white' :
                      item.status === 'current' ? 'border-indigo-600 text-indigo-600 ring-1 ring-indigo-600' :
                      'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {item.id}
                  </button>
                ))}
              </div>
              <div className="mt-8 space-y-3 border-t pt-6">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <div className="w-4 h-4 bg-indigo-600 rounded" /> Answered (3)
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <div className="w-4 h-4 bg-[#436117] rounded" /> Marked for Review (1)
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded" /> Not Visited (11)
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Deep Research Context</h4>
                <p className="text-xs text-indigo-100 leading-relaxed">Review the foundational paper by Rumelhart & McClelland if unsure.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FullAssessmentInterface;