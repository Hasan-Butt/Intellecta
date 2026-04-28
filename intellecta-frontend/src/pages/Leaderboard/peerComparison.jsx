import React, { useState } from 'react';
import { Moon, Timer, BrainCircuit, Play, FileText } from 'lucide-react';

import Sidebar from '../../components/dashboard/StudentSidebar';
import Navbar from '../../components/dashboard/Navbar';

// --- START: HEATMAP COMPONENTS ---

const HeatmapSquare = ({ intensity }) => {
  const bgColors = [
    'bg-[#F1F3F9]', 
    'bg-[#E2E4F0]', 
    'bg-[#B5A9F0]', 
    'bg-[#8E79E3]', 
    'bg-[#5D2ECC]', 
  ];

  return (
    <div 
      className={`w-full aspect-square rounded-sm transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-purple-200 cursor-pointer ${bgColors[intensity]}`}
    />
  );
};

const HeatmapSection = ({ name, label, data, isUser }) => (
  <div className="flex-1 min-w-[350px]">
    <div className="flex justify-between items-end mb-6">
      <h3 className={`text-xs font-bold tracking-[0.2em] uppercase ${isUser ? 'text-[#8E79E3]' : 'text-[#4c35b5]'}`}>
        {name} {isUser && <span className="opacity-70">(YOU)</span>}
      </h3>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </div>
    <div className="grid grid-cols-7 gap-3">
      {data.map((val, idx) => (
        <HeatmapSquare key={idx} intensity={val} />
      ))}
    </div>
  </div>
);

const WeeklyFocusHeatmap = () => {
  const [filter, setFilter] = useState('high-focus');
  
  const jordanData = [1, 1, 3, 3, 4, 3, 3, 1, 1, 2, 4, 4, 3, 3];
  const alexData = [2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1];

  return (

    <section className="bg-white p-10 md:p-14 rounded-[40px] border border-gray-100 shadow-sm mt-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Weekly Focus Heatmaps</h2>
          <p className="text-gray-500 text-base mt-2">Comparing temporal density of high-focus study hours</p>
        </div>

        <div className="flex items-center gap-3 bg-[#F8FAFC] p-1.5 rounded-full border border-gray-100">
          <button 
            onClick={() => setFilter('high-focus')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === 'high-focus' ? 'bg-white shadow-md text-[#5D2ECC]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#5D2ECC]" />
            High Focus
          </button>
          <button 
            onClick={() => setFilter('idle')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              filter === 'idle' ? 'bg-white shadow-md text-gray-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#E2E4F0]" />
            Idle
          </button>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-16">
        <HeatmapSection 
          name="Jordan S." 
          label="Mostly Late Evening" 
          data={jordanData} 
          isUser={false} 
        />
        <HeatmapSection 
          name="Alex" 
          label="Consistent Mid-Day" 
          data={alexData} 
          isUser={true} 
        />
      </div>
    </section>
  );
};

// --- Peer Comparison Page Title Section ---
const PeerComparisonTitle = () => {
  const participants = [
    { id: 1, name: 'You', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' },
    { id: 2, name: 'Jordan S.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }
  ];

  return (
    <section className="w-full mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4c35b5]">
            Deep Peer Comparison
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-normal">
            Detailed performance breakdown between you and Jordan S.
          </p>
        </div>

        <div className="flex items-center bg-[#f4f7f9] rounded-2xl p-5 md:py-4 md:px-6 border border-gray-100 shadow-sm self-start md:self-center">
          <div className="flex -space-x-4 mr-8">
            {participants.map((user) => (
              <div key={user.id} className="relative inline-block">
                <img
                  className="h-12 w-12 rounded-full ring-4 ring-white object-cover"
                  src={user.image}
                  alt={user.name}
                />
              </div>
            ))}
          </div>
          <div className="h-12 w-[1px] bg-gray-200 mx-2" aria-hidden="true" />
          <div className="ml-6 flex flex-col">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">
              Comparison ID
            </span>
            <span className="text-base font-semibold text-gray-700 font-mono mt-2">
              #INT-2024-88A
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Dashboard Card Wrapper ---
const Card = ({ title, subtitle, badge, children }) => (
  <section className="bg-white p-10 md:p-12 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full min-h-[500px]">
    <div className="flex justify-between items-start mb-10">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
        <p className="text-base text-gray-500 mt-2">{subtitle}</p>
      </div>
      {badge && (
        <span className="px-4 py-1.5 text-xs font-bold text-[#4c35b5] uppercase tracking-widest bg-[#f4f3ff] rounded-full">
          {badge}
        </span>
      )}
    </div>
    <div className="flex-1 flex flex-col justify-center">
      {children}
    </div>
  </section>
);

// --- Subject Proficiency (Radar) ---
const SubjectProficiency = () => {
  const jordanPoints = "100,35 155,75 140,145 60,145 45,75";
  const alexPoints = "100,60 135,85 125,130 75,130 65,85";

  return (
    <Card title="Subject Proficiency" subtitle="Skill distribution across core disciplines">
      <div className="relative flex flex-col items-center justify-center flex-1 py-6">
        <svg viewBox="0 0 200 200" className="w-72 h-72 md:w-80 md:h-80 overflow-visible">
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <circle key={scale} cx="100" cy="100" r={80 * scale} fill="none" stroke="#E5E7EB" strokeDasharray="4 4" />
          ))}
          {[0, 72, 144, 216, 288].map((angle) => (
            <line 
              key={angle} x1="100" y1="100" 
              x2={100 + 80 * Math.cos((angle - 90) * Math.PI / 180)} 
              y2={100 + 80 * Math.sin((angle - 90) * Math.PI / 180)} 
              stroke="#E5E7EB" 
            />
          ))}
          <polygon points={jordanPoints} fill="#4c35b5" fillOpacity="0.1" stroke="#4c35b5" strokeWidth="2.5" />
          <polygon points={alexPoints} fill="none" stroke="#b8b0e8" strokeWidth="2.5" strokeDasharray="4 2" />
          
          <text x="100" y="25" textAnchor="middle" className="text-[11px] fill-gray-500 font-bold">Mathematics</text>
          <text x="175" y="90" textAnchor="start" className="text-[11px] fill-gray-500 font-bold">Physics</text>
          <text x="150" y="170" textAnchor="start" className="text-[11px] fill-gray-500 font-bold">Logic</text>
          <text x="50" y="170" textAnchor="end" className="text-[11px] fill-gray-500 font-bold">Literature</text>
          <text x="25" y="90" textAnchor="end" className="text-[11px] fill-gray-500 font-bold">History</text>
        </svg>

        <div className="flex gap-8 mt-12">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-[#4c35b5]" />
            <span className="text-sm font-bold text-gray-700">Jordan S.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full border-2 border-[#b8b0e8]" />
            <span className="text-sm font-bold text-gray-700">Alex (You)</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- Daily Focus Intensity (Line) ---
const DailyFocusIntensity = () => {
  return (
    <Card title="Daily Focus Intensity" subtitle="Cognitive load tracking over the last 7 days" badge="Weekly View">
      <div className="flex-1 flex flex-col">
        <div className="relative h-64 w-full bg-[#f8fafc] rounded-[24px] mb-8 overflow-hidden">
          <svg viewBox="0 0 700 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full p-6">
            <path 
              d="M0,120 C100,50 200,180 350,20 C500,220 600,20 700,100" 
              fill="none" stroke="#4c35b5" strokeWidth="5" strokeLinecap="round" 
            />
            <path 
              d="M0,150 C150,120 250,180 350,100 C450,40 550,180 700,130" 
              fill="none" stroke="#b8b0e8" strokeWidth="4" strokeDasharray="10 8" strokeLinecap="round"
            />
          </svg>
          <div className="absolute bottom-4 left-0 right-0 flex justify-between px-10">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
              <span key={day} className="text-[11px] font-black text-gray-400 tracking-widest">{day}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#f4f7f9] p-8 rounded-[24px] border border-gray-50">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-[#4c35b5]">84%</span>
              <span className="text-base font-medium text-gray-500">Jordan</span>
            </div>
            <p className="text-[11px] text-gray-400 uppercase font-black mt-2 tracking-widest">Avg. Daily Intensity</p>
          </div>
          <div className="bg-[#f4f7f9] p-8 rounded-[24px] border border-gray-50">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-[#b8b0e8]">62%</span>
              <span className="text-base font-medium text-gray-500">Alex</span>
            </div>
            <p className="text-[11px] text-gray-400 uppercase font-black mt-2 tracking-widest">Avg. Daily Intensity</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- Behavioral Insights ---
const BehavioralInsights = () => {
  const insights = [
    {
      id: 1,
      title: "Nocturnal Shift",
      description: "Jordan studies 2.4h more at night (10PM-2AM) compared to your morning routine. This correlates with their 15% higher score in Logic.",
      icon: <Moon className="w-8 h-8" />,
      variant: "primary", 
    },
    {
      id: 2,
      title: "Session Durations",
      description: "Your focus sessions are shorter but more frequent. Jordan averages 90-minute blocks, while you peak at 45 minutes.",
      icon: <Timer className="w-8 h-8" />,
      variant: "secondary",
    },
    {
      id: 3,
      title: "Recovery Time",
      description: "Jordan takes 5-minute micro-breaks every 25 minutes (Pomodoro). Your breaks are fewer but longer, leading to slower mental reboot.",
      icon: <BrainCircuit className="w-8 h-8" />,
      variant: "secondary",
    }
  ];

  return (
    <section className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {insights.map((item) => (
        <div
          key={item.id}
          className={`p-10 rounded-[40px] border transition-all duration-300 hover:scale-[1.02] ${
            item.variant === 'primary'
              ? "bg-[#4c35b5] text-white border-[#4c35b5] shadow-xl shadow-purple-100"
              : "bg-white text-gray-900 border-gray-100 shadow-sm"
          }`}
        >
          <div className={`mb-8 ${item.variant === 'primary' ? "text-white" : "text-[#4c35b5]"}`}>
            {item.id === 2 ? (
              <span className="text-3xl font-bold font-serif leading-none">3</span>
            ) : (
              item.icon
            )}
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-4">
            {item.title}
          </h3>
          <p className={`text-base leading-relaxed ${
            item.variant === 'primary' ? "text-purple-100" : "text-gray-500"
          }`}>
            {item.description}
          </p>
        </div>
      ))}
    </section>
  );
};

const ComparisonCTA = () => {
  return (
    <section className="bg-white p-16 md:p-20 rounded-[40px] border border-gray-100 shadow-sm mt-10 flex flex-col items-center text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight max-w-2xl">
        Ready to Close the Gap?
      </h2>
      
      <p className="text-gray-600 text-lg md:text-xl mt-6 mb-12 max-w-3xl leading-relaxed">
        Start a Focus Session to remove the gap, then in the Schedule Optimization tab, apply the suggested changes to align your study blocks with your natural circadian rhythm.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <button className="flex items-center gap-3 px-10 py-5 rounded-full text-white bg-[#5D2ECC] hover:bg-[#4c35b5] transition-all hover:scale-105 shadow-xl shadow-purple-200 text-base font-bold">
          <Play className="w-6 h-6 fill-current" />
          Apply Schedule Optimization
        </button>
        <button className="flex items-center gap-3 px-10 py-5 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all text-base font-bold">
          <FileText className="w-6 h-6 text-gray-500" />
          Download PDF Report
        </button>
      </div>
    </section>
  );
};


// --- Full Page Layout ---
const PeerComparisonPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdfe] font-sans">
          <Navbar />
          
          <div className="flex flex-1">
            <Sidebar />

        <main className="p-8 md:p-16 max-w-[1600px] mx-auto">
          {/* Header Section */}
          <PeerComparisonTitle />
          
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <SubjectProficiency />
            </div>
            <div className="lg:col-span-7">
              <DailyFocusIntensity />
            </div>
          </div>

          {/* Behavioral Insights Cards */}
          <BehavioralInsights />

          {/* Weekly Focus Heatmap Section */}
          <WeeklyFocusHeatmap />

          {/* Comparison CTA Section */}
          <ComparisonCTA />
        </main>
      </div>
    </div>
  );
};

export default PeerComparisonPage;