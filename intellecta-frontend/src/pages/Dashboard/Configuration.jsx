import React, { useState, useEffect, useCallback } from "react";
import {
  Zap, Trophy, Shield, CheckCircle2, XCircle,
  Plus, ChevronDown, RefreshCw, X, Loader2,
} from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import intellectaLogo from "../../assets/intellectaLogo.jpeg";
import api from "../../services/api";

const RESET_CYCLES = [
  { value: "WEEKLY",    label: "Weekly" },
  { value: "BI_WEEKLY", label: "Bi-Weekly (Fortnightly)" },
  { value: "MONTHLY",   label: "Monthly" },
];

const idleLabel  = (v) => v <= 25 ? "Low" : v <= 60 ? "Medium" : "High";
const fmtNodes   = (n) => !n ? "0" : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

export default function ConfigurationPage() {
  const [activeTab, setActiveTab] = useState("Configuration");

  // ── Data state ──────────────────────────────────────────────────────────────
  const [config,     setConfig]     = useState(null);
  const [draft,      setDraft]      = useState(null);
  const [rules,      setRules]      = useState([]);
  const [moderators, setModerators] = useState(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [resetting,    setResetting]    = useState(false);
  const [toast,        setToast]        = useState(null);
  const [cycleOpen,    setCycleOpen]    = useState(false);
  const [showAddRule,  setShowAddRule]  = useState(false);
  const [newRuleName,  setNewRuleName]  = useState("");
  const [newRuleType,  setNewRuleType]  = useState("WHITELIST");
  const [addingRule,   setAddingRule]   = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cfgRes, rulesRes, modRes] = await Promise.all([
        api.get("/admin/config"),
        api.get("/admin/config/governance"),
        api.get("/admin/config/moderators"),
      ]);
      setConfig(cfgRes.data);
      setDraft(cfgRes.data);
      setRules(rulesRes.data);
      setModerators(modRes.data);
    } catch {
      showToast("Failed to load configuration.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleDraft   = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));
  const handleDiscard = () => { setDraft(config); showToast("Changes discarded."); };

  const handleDeploy = async () => {
    setSaving(true);
    try {
      const res = await api.patch("/admin/config/deploy", {
        deepWorkMultiplier:   draft.deepWorkMultiplier,
        contextSwitchPenalty: draft.contextSwitchPenalty,
        idleDecayRate:        draft.idleDecayRate,
        leaderboardResetCycle: draft.leaderboardResetCycle,
      });
      setConfig(res.data);
      setDraft(res.data);
      showToast("Configuration deployed successfully.");
    } catch {
      showToast("Failed to deploy configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleForceReset = async () => {
    setResetting(true);
    try {
      const res = await api.post("/admin/config/leaderboard/reset");
      setConfig(res.data);
      setDraft(res.data);
      showToast("Leaderboard reset scheduled.");
    } catch {
      showToast("Failed to force reset.", "error");
    } finally {
      setResetting(false);
    }
  };

  const handleRemoveRule = async (id) => {
    try {
      await api.delete(`/admin/config/governance/${id}`);
      setRules(prev => prev.filter(r => r.id !== id));
      showToast("Rule removed.");
    } catch {
      showToast("Failed to remove rule.", "error");
    }
  };

  const handleAddRule = async () => {
    if (!newRuleName.trim()) return;
    setAddingRule(true);
    try {
      const res = await api.post("/admin/config/governance", {
        appName: newRuleName.trim(),
        type: newRuleType,
      });
      setRules(prev => [...prev, res.data]);
      setNewRuleName("");
      setShowAddRule(false);
      showToast("Rule added.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to add rule.", "error");
    } finally {
      setAddingRule(false);
    }
  };

  const handleExportRules = async () => {
    try {
      const res = await api.get("/admin/config/governance/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "app_rules.csv");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Rules exported.");
    } catch {
      showToast("Failed to export rules.", "error");
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const whitelist = rules.filter(r => r.type === "WHITELIST");
  const blacklist = rules.filter(r => r.type === "BLACKLIST");

  const isDirty = config && draft && (
    config.deepWorkMultiplier   !== draft.deepWorkMultiplier   ||
    config.contextSwitchPenalty !== draft.contextSwitchPenalty ||
    config.idleDecayRate        !== draft.idleDecayRate        ||
    config.leaderboardResetCycle !== draft.leaderboardResetCycle
  );

  const dwFill  = draft ? ((draft.deepWorkMultiplier - 1.0) / 3.0) * 100 : 0;
  const cspFill = draft ? ((draft.contextSwitchPenalty + 2.0) / 2.0) * 100 : 0;
  const idrFill = draft ? draft.idleDecayRate : 0;

  // ── Loading screen ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />
      <div className="flex min-h-screen bg-[#F9FAFB]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-bold text-sm">Loading configuration...</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar intellectaLogo={intellectaLogo} />

      <div className="flex min-h-screen bg-[#F9FAFB] font-inter text-[#111827]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-10 space-y-10 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-10">

            {/* Header */}
            <div className="mb-10">
              <h2 className="text-4xl font-black tracking-tight text-[#111827]">
                Global Configuration
              </h2>
              <p className="text-gray-400 font-bold mt-2">
                Manage core behavioral parameters for the Intellecta ecosystem,
                from AI focus sensitivity to application governance.
              </p>
              {config?.lastDeployedAt && (
                <p className="text-[11px] font-black text-gray-300 mt-2 uppercase tracking-widest">
                  Last deployed: {config.lastDeployedAt} by {config.deployedBy}
                </p>
              )}
            </div>

            <div className="grid grid-cols-12 gap-8">

              {/* Focus Intensity Weights */}
              <div className="col-span-12 lg:col-span-8 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                  <div className="bg-[#E3E0F7] p-3 rounded-2xl text-[#6C5DD3]">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#111827]">Focus Intensity Weights</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Calibrate how system actions impact user focus scores.
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  {/* Deep Work Multiplier */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black text-[#111827]">Deep Work Multiplier</span>
                      <span className="bg-indigo-50 text-[#6C5DD3] px-4 py-1.5 rounded-xl text-xs font-black">
                        {draft ? `${(draft.deepWorkMultiplier ?? 2.4).toFixed(1)}x` : "—"}
                      </span>
                    </div>
                    <input
                      type="range" min="1.0" max="4.0" step="0.1"
                      value={draft?.deepWorkMultiplier ?? 2.4}
                      onChange={(e) => handleDraft("deepWorkMultiplier", parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full cursor-pointer accent-[#6C5DD3] outline-none"
                      style={{ background: `linear-gradient(to right, #6C5DD3 ${dwFill}%, #F3F4F6 ${dwFill}%)` }}
                    />
                    <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                      <span>Standard</span><span>Extreme</span>
                    </div>
                  </div>

                  {/* Context Switch Penalty */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black text-[#111827]">Context Switch Penalty</span>
                      <span className="bg-red-50 text-red-500 px-4 py-1.5 rounded-xl text-xs font-black">
                        {draft ? (draft.contextSwitchPenalty ?? -0.8).toFixed(1) : "—"}
                      </span>
                    </div>
                    <input
                      type="range" min="-2.0" max="0.0" step="0.1"
                      value={draft?.contextSwitchPenalty ?? -0.8}
                      onChange={(e) => handleDraft("contextSwitchPenalty", parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full cursor-pointer accent-red-500 outline-none"
                      style={{ background: `linear-gradient(to right, #EF4444 ${cspFill}%, #F3F4F6 ${cspFill}%)` }}
                    />
                    <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                      <span>Minimal</span><span>Severe</span>
                    </div>
                  </div>

                  {/* Idle Decay Rate */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black text-[#111827]">Idle Decay Rate</span>
                      <span className="bg-indigo-50 text-[#6C5DD3] px-4 py-1.5 rounded-xl text-xs font-black">
                        {draft ? idleLabel(draft.idleDecayRate) : "—"}
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="5"
                      value={draft?.idleDecayRate ?? 25}
                      onChange={(e) => handleDraft("idleDecayRate", parseInt(e.target.value))}
                      className="w-full h-2 rounded-full cursor-pointer accent-[#6C5DD3] outline-none"
                      style={{ background: `linear-gradient(to right, #6C5DD3 ${idrFill}%, #F3F4F6 ${idrFill}%)` }}
                    />
                    <div className="flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                      <span>Static</span><span>Aggressive</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Intervals */}
              <div className="col-span-12 lg:col-span-4 bg-[#6C5DD3] p-10 rounded-[40px] text-white shadow-2xl shadow-indigo-100 flex flex-col justify-between">
                <div>
                  <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8 text-white">
                    <Trophy size={24} />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Leaderboard Intervals</h3>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed opacity-80">
                    Define the cadence for system-wide competitive reset cycles
                    and reward distribution.
                  </p>
                </div>

                <div className="space-y-4 mt-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-70">
                      Global Reset Cycle
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setCycleOpen(o => !o)}
                        className="w-full bg-white/10 border border-white/20 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/20 transition-colors"
                      >
                        <span className="text-sm font-bold">
                          {RESET_CYCLES.find(c => c.value === draft?.leaderboardResetCycle)?.label
                            ?? "Bi-Weekly (Fortnightly)"}
                        </span>
                        <ChevronDown size={18} className={`transition-transform ${cycleOpen ? "rotate-180" : ""}`} />
                      </button>
                      {cycleOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
                          {RESET_CYCLES.map(c => (
                            <button
                              key={c.value}
                              onClick={() => { handleDraft("leaderboardResetCycle", c.value); setCycleOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors ${
                                draft?.leaderboardResetCycle === c.value
                                  ? "text-[#6C5DD3] bg-[#6C5DD3]/5"
                                  : "text-[#111827] hover:bg-gray-50"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/10 border border-white/20 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">
                      Next Sync Window
                    </p>
                    <p className="text-3xl font-black">{config?.nextSyncWindow ?? "—"}</p>
                  </div>

                  <button
                    onClick={handleForceReset}
                    disabled={resetting}
                    className="w-full bg-white text-[#6C5DD3] py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-60"
                  >
                    <RefreshCw size={16} strokeWidth={3} className={resetting ? "animate-spin" : ""} />
                    {resetting ? "Resetting..." : "Manual Force Reset"}
                  </button>
                </div>
              </div>

              {/* Application Governance */}
              <div className="col-span-12 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">Application Governance</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        Whitelisted applications bypass focus filters; Blacklisted ones trigger notifications.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleExportRules}
                      className="px-6 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      Export Rules
                    </button>
                    <button
                      onClick={() => setShowAddRule(true)}
                      className="px-6 py-3 bg-[#6C5DD3] text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 transition-transform"
                    >
                      <Plus size={14} strokeWidth={4} /> Add New Rule
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AppList
                    title="Global Whitelist"
                    icon={<CheckCircle2 size={16} className="text-emerald-500" />}
                    apps={whitelist}
                    onRemove={handleRemoveRule}
                  />
                  <AppList
                    title="Global Blacklist"
                    icon={<XCircle size={16} className="text-red-500" />}
                    apps={blacklist}
                    onRemove={handleRemoveRule}
                  />
                </div>
              </div>

              {/* Moderator Status + Action Buttons */}
              <div className="col-span-12 space-y-12">
                <div className="bg-white p-8 rounded-[35px] border border-gray-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="flex -space-x-3">
                      {moderators?.avatars?.map((url, i) => (
                        <img key={i}
                          className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 object-cover shadow-sm"
                          src={url} alt="" />
                      ))}
                      {(moderators?.extraCount ?? 0) > 0 && (
                        <div className="w-12 h-12 rounded-full border-4 border-white bg-[#F3F4F6] flex items-center justify-center text-[11px] font-black text-gray-500 shadow-sm">
                          +{moderators.extraCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#111827]">
                        {moderators
                          ? `${moderators.moderatorCount} System Moderator${moderators.moderatorCount !== 1 ? "s" : ""} Active`
                          : "Loading..."}
                      </h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                        WATCHING {fmtNodes(moderators?.liveNodes)} LIVE SESSIONS
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">
                      System Integrity{" "}
                      {moderators ? `${(moderators.integrityScore ?? 0).toFixed(1)}%` : "—"}
                    </p>
                    <div className="w-56 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${moderators?.integrityScore ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-10 pr-4">
                  <button
                    onClick={handleDiscard}
                    disabled={!isDirty || saving}
                    className="text-base font-black text-gray-500 hover:text-[#111827] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleDeploy}
                    disabled={saving}
                    className="bg-[#6C5DD3] text-white px-12 py-5 rounded-[22px] font-black text-base shadow-2xl shadow-indigo-200 hover:scale-[1.02] hover:bg-[#5a4db3] transition-all active:scale-95 disabled:opacity-60 flex items-center gap-3"
                  >
                    {saving
                      ? <><Loader2 size={18} className="animate-spin" /> Deploying...</>
                      : <>Deploy Configuration {isDirty && <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />}</>}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#111827]">Add App Rule</h3>
              <button
                onClick={() => { setShowAddRule(false); setNewRuleName(""); }}
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  App / Domain Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., YouTube, TikTok Web"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRule()}
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#111827] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Rule Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["WHITELIST", "Whitelist", "text-emerald-600", "bg-emerald-50", "border-emerald-200"],
                    ["BLACKLIST", "Blacklist", "text-red-500",     "bg-red-50",     "border-red-200"    ],
                  ].map(([v, label, tc, bg, bc]) => (
                    <button
                      key={v}
                      onClick={() => setNewRuleType(v)}
                      className={`py-3 rounded-2xl text-sm font-black border-2 transition-all ${
                        newRuleType === v
                          ? `${bg} ${tc} ${bc}`
                          : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setShowAddRule(false); setNewRuleName(""); }}
                className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-2xl text-sm font-black hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                disabled={!newRuleName.trim() || addingRule}
                className="flex-1 py-3 bg-[#6C5DD3] text-white rounded-2xl text-sm font-black hover:bg-[#5b4eb3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingRule
                  ? <><Loader2 size={14} className="animate-spin" /> Adding...</>
                  : "Add Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-xl font-bold text-sm text-white z-50 transition-all ${
          toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const AppList = ({ title, icon, apps, onRemove }) => (
  <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
    <div className="flex items-center gap-2 mb-6">
      {icon}
      <span className="text-xs font-black uppercase tracking-widest text-gray-500">{title}</span>
      <span className="ml-auto text-[10px] font-black text-gray-300">{apps.length} rule{apps.length !== 1 ? "s" : ""}</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {apps.length === 0 ? (
        <p className="text-xs font-bold text-gray-300 py-1">No rules configured.</p>
      ) : apps.map((app) => (
        <div
          key={app.id}
          className="bg-white px-4 py-2.5 rounded-xl border border-gray-100 text-xs font-bold text-[#111827] flex items-center gap-3 shadow-sm hover:border-[#6C5DD3]/30 transition-all"
        >
          {app.appName}
          <button
            onClick={() => onRemove(app.id)}
            className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none font-black"
            title="Remove rule"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  </div>
);
