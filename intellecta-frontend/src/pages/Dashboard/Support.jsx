import React from 'react';
import { 
  LifeBuoy, MessageSquare, BookOpen, 
  ShieldCheck, ArrowUpRight, Search, 
  Mail, Globe, PlayCircle, ChevronDown // Added ChevronDown here
} from 'lucide-react';

// Standard Dashboard Components
import Sidebar from '../../components/dashboard/Sidebar';
import Navbar from '../../components/dashboard/Navbar';

const SupportPage = () => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-10 max-w-[1450px] mx-auto w-full space-y-12">
          {/* Header */}
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-[#111827]">Support Center</h2>
              <p className="text-gray-400 font-bold mt-2">
                Get technical assistance, browse system documentation, or contact the Intellecta core team.
              </p>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C5DD3] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search for solutions..." 
                className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[20px] w-80 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/20 font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Quick Actions Grid */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <SupportCard 
                icon={<MessageSquare size={28} />}
                title="Live Chat Support"
                desc="Average response time: < 5 minutes"
                buttonText="Start Conversation"
                primary
              />
              <SupportCard 
                icon={<BookOpen size={28} />}
                title="Documentation"
                desc="Detailed API logs and system setup guides."
                buttonText="Open Wiki"
              />
              <SupportCard 
                icon={<PlayCircle size={28} />}
                title="Video Tutorials"
                desc="Learn how to calibrate focus weights effectively."
                buttonText="Watch Library"
              />
              <SupportCard 
                icon={<ShieldCheck size={28} />}
                title="Security Protocols"
                desc="Review whitelist/blacklist governance rules."
                buttonText="View Policies"
              />
            </div>

            {/* System Status - Right Side Panel */}
            <div className="col-span-12 lg:col-span-4 bg-[#6C5DD3] p-10 rounded-[40px] text-white shadow-2xl shadow-indigo-100 h-fit">
              <div className="flex items-center justify-between mb-10">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Globe size={24} />
                </div>
                <span className="bg-emerald-400 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  All Systems Operational
                </span>
              </div>

              <h3 className="text-2xl font-black mb-6">Global Node Status</h3>
              
              <div className="space-y-6">
                <StatusRow label="AI Analysis Engine" status="Optimal" />
                <StatusRow label="Focus Scoring API" status="Optimal" />
                <StatusRow label="Database Clusters" status="98% Load" />
                <StatusRow label="Auth Gateways" status="Optimal" />
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4 text-center">Contact Priority Line</p>
                <div className="flex justify-center gap-4">
                  <div className="bg-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-colors">
                    <Mail size={20} />
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-colors text-[10px] font-black flex items-center px-6 tracking-widest">
                    SUBMIT TICKET
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="col-span-12 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-[#111827]">
                <LifeBuoy className="text-[#6C5DD3]" size={24} /> 
                Frequently Asked Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                <FAQItem question="How do I reset global focus weights?" />
                <FAQItem question="Whitelisting an app isn't reflecting on client nodes." />
                <FAQItem question="Can I export system logs to CSV?" />
                <FAQItem question="What happens during a manual force reset?" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sub-components
const SupportCard = ({ icon, title, desc, buttonText, primary = false }) => (
  <div className={`p-8 rounded-[35px] border ${primary ? 'border-[#6C5DD3] bg-white' : 'border-gray-100 bg-white'} shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
    <div>
      <div className={`${primary ? 'text-[#6C5DD3] bg-[#F5F6FF]' : 'text-gray-400 bg-gray-50'} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h4 className="text-lg font-black text-[#111827] mb-2">{title}</h4>
      <p className="text-sm font-bold text-gray-400 leading-relaxed">{desc}</p>
    </div>
    <button className={`mt-8 flex items-center justify-between w-full font-black text-[11px] uppercase tracking-widest ${primary ? 'text-[#6C5DD3]' : 'text-gray-400 group-hover:text-[#111827]'}`}>
      {buttonText}
      <ArrowUpRight size={18} strokeWidth={3} />
    </button>
  </div>
);

const StatusRow = ({ label, status }) => (
  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
    <span className="text-xs font-bold text-indigo-50">{label}</span>
    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-tighter bg-emerald-400/10 px-3 py-1 rounded-lg">
      {status}
    </span>
  </div>
);

const FAQItem = ({ question }) => (
  <div className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors border-b border-gray-50 group">
    <span className="text-sm font-bold text-gray-600 group-hover:text-[#111827]">{question}</span>
    <ChevronDown size={18} className="text-gray-300 group-hover:text-[#6C5DD3]" />
  </div>
);

export default SupportPage;