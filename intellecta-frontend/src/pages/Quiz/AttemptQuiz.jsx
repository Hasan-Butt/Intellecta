import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Timer, Info, ArrowLeft, ArrowRight, Bookmark, CheckCircle2, XCircle } from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';
import api from '../../services/api';

const FullAssessmentInterface = () => {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('id');
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> optionIndex
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markedForReview, setMarkedForReview] = useState({});
  const [showReviewQueue, setShowReviewQueue] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${quizId}`);
        setQuiz(response.data);
        // FOR TESTING: Temporarily forced to 1 minute (60 seconds) to test auto-submit
        setTimeLeft(60); 
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    if (quizId) fetchQuiz();
  }, [quizId]);

  // Use a ref to hold the latest answers to avoid stale closures during auto-submit
  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    // Wait until quiz is fully loaded
    if (loading || !quiz) return;

    if (timeLeft <= 0) {
      alert("Time is up! Auto-submitting your quiz...");
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, quiz, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/quizzes/submit', {
        userId: 1, // Assuming hardcoded for now
        quizId: quiz.id,
        answers: answersRef.current // Use ref for guaranteed fresh answers
      });
      navigate(`/Result`, { state: { attempt: response.data, quiz: quiz } });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("There was an error submitting your quiz. Please try again.");
    }
  };

  if (loading || !quiz) return <div className="flex items-center justify-center h-screen font-bold text-indigo-600">Preparing Assessment...</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

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
            <section className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-8 w-full">
                <div className="flex flex-col gap-0.5 whitespace-nowrap">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">Current Progress</span>
                  <span className="text-lg font-bold text-[#2563EB] tabular-nums">
                    {currentQuestionIndex + 1} <span className="text-slate-300 font-light">/</span> {quiz.questions.length}
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
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pb-4 items-start">
              <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h1 className="text-lg font-extrabold text-slate-800 tracking-tight">
                      Question {currentQuestionIndex + 1} <span className="text-slate-300 font-normal ml-1">of {quiz.questions.length}</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium tracking-wide">{quiz.title}</p>
                  </div>
                  <div className="bg-slate-50 text-slate-600 px-6 py-2 rounded-full text-sm font-bold border border-slate-100">
                    +1.0 Marks
                  </div>
                </div>
              </section>

              <aside className="bg-indigo-600 rounded-3xl p-5 flex flex-col justify-center gap-2 text-white shadow-xl shadow-indigo-100">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-indigo-200" strokeWidth={2} />
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Sync Status</h2>
                </div>
                <p className="text-sm leading-relaxed text-indigo-50 font-medium">
                  Auto-Submit is active. Progress saved.
                </p>
              </aside>
            </div>

            {/* 3. MAIN BODY */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12 pb-20 items-stretch">
              {/* Question Content */}
              <section className="space-y-12">
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 relative">
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-800 leading-[1.5] mb-8">
                    {currentQuestion.text}
                  </h2>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(index)}
                        className={`w-full flex items-center p-3.5 rounded-xl border-2 transition-all text-left group ${
                          answers[currentQuestion.id] === index 
                          ? 'border-indigo-600 bg-indigo-50/30' 
                          : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg mr-5 shrink-0 transition-all ${
                          answers[currentQuestion.id] === index 
                          ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' 
                          : 'bg-white text-slate-400 border border-slate-200'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <p className={`flex-1 text-base font-medium leading-relaxed ${answers[currentQuestion.id] === index ? 'text-slate-900' : 'text-slate-600'}`}>
                          {option}
                        </p>
                        {answers[currentQuestion.id] === index && (
                          <CheckCircle2 className="text-indigo-600 w-6 h-6 ml-4" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <button 
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className={`flex items-center gap-3 text-lg font-bold transition-colors ${currentQuestionIndex === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-800'}`}
                  >
                    <ArrowLeft className="w-6 h-6" /> Previous
                  </button>
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setMarkedForReview({...markedForReview, [currentQuestionIndex]: !markedForReview[currentQuestionIndex]})}
                      className={`flex items-center gap-3 text-lg font-bold transition-all ${markedForReview[currentQuestionIndex] ? 'text-orange-500' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                      <Bookmark className={`w-6 h-6 ${markedForReview[currentQuestionIndex] ? 'fill-current' : ''}`} /> Review Later
                    </button>
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                      <button 
                        onClick={() => setShowReviewQueue(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                      >
                        Finish Quiz
                      </button>
                    ) : (
                      <button 
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                      >
                        Save & Next <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Right Navigator Sidebar */}
              <aside className="space-y-6 sticky top-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Question Navigator</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {quiz.questions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentQuestionIndex(i)}
                        className={`h-9 rounded-lg text-xs font-bold border-2 transition-all ${
                          currentQuestionIndex === i ? 'border-indigo-600 text-indigo-600 ring-4 ring-indigo-50 bg-white' :
                          markedForReview[i] ? 'bg-orange-500 border-orange-500 text-white' :
                          answers[quiz.questions[i].id] !== undefined ? 'bg-indigo-600 border-indigo-600 text-white' :
                          'bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-3 tracking-tight">Expert Hint</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      Trust your first instinct. Read all options carefully before finalizing.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Review Queue Modal */}
      {showReviewQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Review Your Assessment</h2>
              <button onClick={() => setShowReviewQueue(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={28} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                  <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-1">Answered</p>
                  <p className="text-2xl font-black text-emerald-700">{Object.keys(answers).length}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Unanswered</p>
                  <p className="text-2xl font-black text-slate-700">{quiz.questions.length - Object.keys(answers).length}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
                  <p className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1">Marked</p>
                  <p className="text-2xl font-black text-orange-700">{Object.values(markedForReview).filter(Boolean).length}</p>
                </div>
              </div>

              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Question Queue</h3>
              <div className="grid grid-cols-5 md:grid-cols-8 gap-3">
                {quiz.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentQuestionIndex(i);
                      setShowReviewQueue(false);
                    }}
                    className={`h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                      markedForReview[i] ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200' :
                      answers[quiz.questions[i].id] !== undefined ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' :
                      'bg-slate-200 border-slate-300 text-slate-600 hover:bg-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-500">You can still go back and change your answers.</p>
              <button 
                onClick={handleSubmit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all w-full md:w-auto"
              >
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullAssessmentInterface;
