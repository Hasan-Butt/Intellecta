import React, { useState } from "react";
import {
  Users as UsersIcon,
  Brain,
  Activity,
  Medal,
  Plus,
  //Search,
  Filter,
  Calendar,
  Download,
  MoreHorizontal,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("Users");
  // Mock data for the table
  const students = [
    {
      id: 1,
      name: "Julian Thorne",
      email: "julian.t@edu.intellecta.com",
      level: "Advanced",
      activity: "Cognitive Logic Module 4",
      time: "2 minutes ago",
      score: 94,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julian",
    },
    {
      id: 2,
      name: "Elena Rodriguez",
      email: "elena.r@edu.intellecta.com",
      level: "Intermediate",
      activity: "Linguistic Patterning",
      time: "1 hour ago",
      score: 78,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    },
    {
      id: 3,
      name: "Marcus Wu",
      email: "m.wu@edu.intellecta.com",
      level: "Beginner",
      activity: "Neural Connectivity Intro",
      time: "12 minutes ago",
      score: 82,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    {
      id: 4,
      name: "Sarah Jenkins",
      email: "s.jenkins@edu.intellecta.com",
      level: "Advanced",
      activity: "Mathematical Intuition III",
      time: "5 hours ago",
      score: 91,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
        {/* 4. Sidebar now receives consistent props */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">
            {/* HEADER SECTION */}
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight">
                  User Management
                </h2>
                <p className="text-gray-400 font-bold mt-1">
                  Monitor and manage 1,248 active student learners.
                </p>
              </div>
              <button className="bg-[#6C5DD3] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-[#5b4eb3] transition-all">
                <Plus size={20} strokeWidth={3} /> Register Student
              </button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={<UsersIcon />}
                label="Total Students"
                value="1,248"
                trend="+12%"
                color="text-[#6C5DD3]"
              />
              <StatCard
                icon={<Brain />}
                label="Avg. Focus Score"
                value="88.4"
                trend="+4.2%"
                color="text-purple-500"
              />
              <StatCard
                icon={<Activity />}
                label="Active Sessions"
                value="42"
                trend="Stable"
                color="text-blue-500"
              />
              <div className="bg-[#6C5DD3] rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                <Medal className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 rotate-12" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                  High Performers
                </p>
                <h4 className="text-4xl font-black mt-4">312</h4>
              </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 border border-gray-100">
                    <Filter size={14} /> All Levels
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 border border-gray-100">
                    <Calendar size={14} /> Last 30 Days
                  </button>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-[#6C5DD3]">
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">
                    <th className="px-8 py-5">Name</th>
                    <th className="px-8 py-5">Level</th>
                    <th className="px-8 py-5">Recent Activity</th>
                    <th className="px-8 py-5">Avg. Focus</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full border border-gray-100"
                          />
                          <div>
                            <p className="text-sm font-black text-[#111827]">
                              {s.name}
                            </p>
                            <p className="text-[11px] font-bold text-gray-400">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase">
                          {s.level}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-600">
                          {s.activity}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          {s.time}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full">
                            <div
                              className="h-full bg-[#6C5DD3] rounded-full"
                              style={{ width: `${s.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-black text-[#111827]">
                            {s.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-gray-300 hover:text-gray-600">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LOWER SECTION: ALERT & SYSTEM STATUS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-gradient-to-br from-white to-indigo-50/30 rounded-[40px] p-10 border border-gray-100 flex justify-between items-center relative overflow-hidden">
                <div className="max-w-md relative z-10">
                  <h4 className="text-2xl font-black">
                    Cognitive Health Alert
                  </h4>
                  <p className="text-gray-400 font-bold mt-4 text-sm leading-relaxed">
                    34 students show a downward trend in focus score over the
                    last 48 hours. Suggest triggering proactive intervention
                    modules.
                  </p>
                  <div className="mt-8 flex gap-4">
                    <button className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold text-sm">
                      Automate Intervention
                    </button>
                    <button className="bg-white text-zinc-900 border border-gray-100 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm">
                      Review Students
                    </button>
                  </div>
                </div>
                <div className="opacity-10 absolute right-10 top-10 rotate-12">
                  <Brain size={120} />
                </div>
              </div>

              <div className="bg-gray-100/50 rounded-[40px] p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-black text-lg">System Status</h4>
                  <span className="bg-emerald-400 text-emerald-900 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                    Operational
                  </span>
                </div>
                <div className="space-y-4">
                  <StatusRow label="Real-time Sync" value="Active" />
                  <StatusRow label="Database Latency" value="14ms" />
                  <StatusRow label="Storage Capacity" value="42%" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-12 tracking-widest text-center">
                  Last Maintenance: Oct 24, 2023 at 04:00 AM
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl bg-gray-50 ${color}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
        {trend}
      </span>
    </div>
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-6">
      {label}
    </p>
    <h4 className="text-3xl font-black mt-1">{value}</h4>
  </div>
);

const StatusRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-bold text-gray-400">{label}</span>
    <span className="text-sm font-black text-[#111827]">{value}</span>
  </div>
);

export default UsersPage;
