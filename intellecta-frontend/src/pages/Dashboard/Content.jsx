import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Brain,
  Database,
  Zap,
  BarChart3,
  Upload,
  FileText,
  Users,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";

const ContentPage = () => {
  const [activeTab, setActiveTab] = useState("Content");
  const subjects = [
    {
      id: 1,
      title: "Advanced Cognition Psychology",
      code: "PSYCH-402",
      topics: 12,
      students: 450,
      subTopics: ["Neural Networks & Memory", "Sensory Perception"],
      icon: <Brain className="text-purple-500" />,
      bgColor: "bg-purple-50",
    },
    {
      id: 2,
      title: "Data Science Fundamentals",
      code: "CS-101",
      topics: 8,
      students: 1200,
      subTopics: ["Linear Algebra Foundations", "Probability & Stats"],
      icon: <Database className="text-emerald-500" />,
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter">
        {/* 5. Sidebar now receives the correct props */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-[#111827]">
                  Content Repository
                </h2>
                <p className="text-gray-400 font-bold mt-2">
                  Manage pedagogical structures and knowledge diagnostics.
                </p>
              </div>
              <button className="bg-[#6C5DD3] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 hover:scale-105 transition-transform">
                <Plus size={20} strokeWidth={3} /> Create New Subject
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex gap-5">
                        <div className={`${subject.bgColor} p-4 rounded-2xl`}>
                          {React.isValidElement(subject.icon)
                            ? React.cloneElement(subject.icon, { size: 28 })
                            : null}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black">
                            {subject.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[#6C5DD3] font-black text-xs uppercase tracking-widest">
                              {subject.code}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                              {subject.topics} Topics
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                              {subject.students} Students
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600 rounded-xl transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {subject.subTopics.map((topic, idx) => (
                        <button
                          key={idx}
                          className="flex items-center gap-3 bg-gray-50 p-5 rounded-[24px] border border-gray-100 hover:border-[#6C5DD3]/30 transition-all text-left group"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-[#6C5DD3]" />
                          <span className="text-sm font-black text-gray-700">
                            {topic}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button className="w-full mt-4 border-2 border-dashed border-gray-100 rounded-[24px] py-4 flex items-center justify-center gap-2 text-indigo-400 hover:bg-indigo-50/50 transition-all group">
                      <Plus
                        size={18}
                        strokeWidth={3}
                        className="group-hover:scale-110"
                      />
                      <span className="text-xs font-black uppercase tracking-widest">
                        Add New Topic
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#1C1C2D] rounded-[40px] p-8 text-white shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                      <Zap
                        size={20}
                        className="text-emerald-400 fill-emerald-400"
                      />
                    </div>
                    <h3 className="font-black text-lg">Adaptive Quiz Engine</h3>
                  </div>
                  <p className="text-xs text-gray-400 font-bold leading-relaxed mb-8">
                    System-wide AI monitoring active quiz banks to detect
                    student knowledge gaps.
                  </p>

                  <div className="space-y-4">
                    <QuizInsight
                      title="Quantum Decoherence Theory"
                      tag="CRITICAL WEAK POINT"
                      tagColor="bg-red-500/10 text-red-400"
                      rate="78% Failure Rate"
                      actionText="REINFORCE BANK"
                    />
                    <QuizInsight
                      title="Multivariate Calculus Basics"
                      tag="EMERGING GAP"
                      tagColor="bg-blue-500/10 text-blue-400"
                      rate="42% Failure Rate"
                      actionText="ADD QUIZ"
                    />
                  </div>

                  <button className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors">
                    <Zap size={16} fill="white" /> Generate Weakness Quiz Bank
                  </button>
                </div>

                <div className="bg-[#F3F4F6]/50 rounded-[40px] p-8">
                  <h4 className="font-black text-sm uppercase tracking-widest mb-6">
                    Quick Links
                  </h4>
                  <div className="space-y-5">
                    <QuickLink icon={<Upload />} text="Bulk Import Content" />
                    <QuickLink icon={<FileText />} text="Grading Rubrics" />
                    <QuickLink icon={<Users />} text="Peer Review Queue" />
                    <QuickLink icon={<BarChart3 />} text="Content Analytics" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const QuizInsight = ({ title, tag, tagColor, rate, actionText }) => {
  const match = rate ? rate.match(/\d+/) : null;
  const numericValue = match ? match[0] : 0;

  return (
    <div className="bg-white/5 rounded-[24px] p-5 border border-white/5">
      <div className="flex justify-between items-start mb-3">
        <span
          className={`${tagColor} text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-wider`}
        >
          {tag}
        </span>
      </div>
      <h4 className="font-black text-sm mb-4 leading-tight">{title}</h4>
      <div className="h-1.5 w-full bg-white/10 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full ${tag && tag.includes("CRITICAL") ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${numericValue}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-gray-500 uppercase">
          {rate}
        </span>
        <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
          {actionText}
        </button>
      </div>
    </div>
  );
};

const QuickLink = ({ icon, text }) => (
  <button className="flex items-center gap-4 w-full group text-left">
    <div className="bg-white p-2 rounded-xl border border-gray-100 group-hover:bg-indigo-50 group-hover:text-[#6C5DD3] transition-colors text-gray-400">
      {icon && React.isValidElement(icon)
        ? React.cloneElement(icon, { size: 18 })
        : null}
    </div>
    <span className="text-sm font-bold text-gray-600 group-hover:text-[#111827]">
      {text}
    </span>
  </button>
);

export default ContentPage;
