import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import api from "../../services/api";

const QuizPlatform = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get("/quizzes");
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleStartQuiz = (id) => {
    navigate(`/AttemptQuiz?id=${id}`);
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto selection:bg-indigo-100 selection:text-indigo-900">
          <div className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto">
            
            {/* --- HERO SECTION --- */}
            <section className="relative w-full overflow-hidden rounded-[3.5rem] shadow-2xl shadow-indigo-900/20 mb-20 min-h-[400px] flex items-center">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent" />

              <div className="relative z-10 flex flex-col py-24 px-10 md:px-24">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#BEF264] text-[#0F172A] text-[11px] font-black uppercase tracking-[0.2em] mb-10 w-fit">
                  <Zap size={14} fill="currentColor" />
                  <span>Flash Challenge</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.05] mb-8 tracking-tighter max-w-4xl">
                  Master Your <br />
                  <span className="text-indigo-400">Knowledge Base</span>
                </h1>

                <p className="text-slate-300 text-xl md:text-2xl leading-relaxed max-w-2xl mb-12 font-medium">
                  Challenge yourself with curated assessments across various disciplines. Track your progress and climb the leaderboard.
                </p>

                <div className="flex flex-wrap gap-5">
                  <button 
                    disabled={quizzes.length === 0}
                    onClick={() => quizzes.length > 0 && handleStartQuiz(quizzes[0].id)}
                    className={`group flex items-center gap-4 px-10 py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-2xl ${
                      quizzes.length > 0 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/40' 
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {loading ? "Loading Quizzes..." : "Start Latest Quiz"}
                    <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
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
            </section>

            {/* --- COURSE GRID --- */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-600 font-bold">Synchronizing Assessments...</p>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-300">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                  <BookOpen size={48} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Quizzes Found</h3>
                <p className="text-slate-500 mb-8 text-center max-w-sm">We couldn't find any assessments matching your search. Try adjusting your filters.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all"
                >
                  Refresh Page
                </button>
              </div>
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                {filteredQuizzes.map((quiz) => (
                  <article key={quiz.id} className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col">
                    <div className="w-full aspect-[16/10] overflow-hidden">
                      <img
                        src={quiz.imageUrl || "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800"}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        alt={quiz.title}
                      />
                    </div>
                    <div className="p-10 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                          {quiz.category === 'Biology' ? <Microscope size={24} /> : <Sigma size={24} />}
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                          {quiz.difficulty}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">
                        {quiz.title}
                      </h3>
                      <p className="text-slate-500 text-base mb-8">
                        {quiz.description}
                      </p>
                      <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col items-center gap-5">
                        <div className="flex justify-center gap-4 text-slate-600 text-sm font-semibold w-full">
                          <span className="flex flex-1 justify-center items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 whitespace-nowrap">
                            <Clock size={16} className="text-indigo-500 shrink-0" /> 
                            {quiz.timeLimit} {quiz.timeLimit === 1 ? 'Min' : 'Mins'}
                          </span>
                          <span className="flex flex-1 justify-center items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 whitespace-nowrap">
                            <BookOpen size={16} className="text-emerald-500 shrink-0" /> 
                            {quiz.questions?.length || 0} Qs
                          </span>
                        </div>
                        <button 
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition-all active:scale-95 text-sm shadow-md"
                        >
                          Start Quiz
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizPlatform;
