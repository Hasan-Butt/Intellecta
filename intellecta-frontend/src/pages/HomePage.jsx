import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Brain, CalendarDays, NotebookPen, Timer, Trophy, BarChart3,
  ShieldOff, Flame, ArrowRight, ChevronDown, Zap,
  Target, BookOpen, TrendingUp, CheckCircle2, Menu, X,
  Layers, BrainCog, SlidersHorizontal, Music,
  ChevronLeft, ChevronRight, Folder, ListChecks, LayoutGrid
} from "lucide-react";
import intellectaLogo from "../assets/intellectaLogo.jpeg";
import "../styles/home.css";
import screenshot1 from "../assets/app-screenshots/screenshot1.png";
import screenshot2 from "../assets/app-screenshots/screenshot2.png";
import screenshot3 from "../assets/app-screenshots/screenshot3.png";
import screenshot4 from "../assets/app-screenshots/screenshot4.png";
import screenshot5 from "../assets/app-screenshots/screenshot5.png";
import screenshot6 from "../assets/app-screenshots/screenshot6.png";
import screenshot7 from "../assets/app-screenshots/screenshot-7.png";
import screenshot8 from "../assets/app-screenshots/screenshot-8.jpg";

/* ─── HELPERS ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

function InViewSection({ children, id = "", style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-70px" });
  return (
    <motion.section ref={ref} id={id} initial="hidden"
      animate={inView ? "visible" : "hidden"}
      style={{ position: "relative", ...style }}>
      {children}
    </motion.section>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────────── */
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      let current = "";
      for (const id of ["features", "how-it-works", "about"]) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Features", "How It Works", "About"];
  const hrefFor = l => `#${l.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <motion.div
      className="hp-navbar-wrapper"
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* ── Full-width top bar: Sign In · Logo · Get Started ── */}
      <div className={`hp-navbar-topbar ${scrolled ? "scrolled" : ""}`}>
        <div className="hp-navbar-top-row">
          {/* LEFT — Sign In */}
          <div style={{ minWidth: 160, display: "flex", alignItems: "center" }}>
            <button className="nav-login-btn" onClick={() => navigate("/login")}>Sign In</button>
          </div>

          {/* CENTER — Logo */}
          <Link to="/" className="hp-navbar-center-logo">
            <img src={intellectaLogo} alt="Intellecta Logo" style={{
              width: 52, height: 52, borderRadius: 13,
              objectFit: "cover", flexShrink: 0,
              boxShadow: "0 4px 14px rgba(83,210,224,0.38)"
            }} />
            <span className="syne" style={{ fontSize: 20, fontWeight: 800, color: "var(--hp-ink)", letterSpacing: "-0.025em" }}>
              Intellecta
            </span>
          </Link>

          {/* ── When scrolled: inline links appear directly in place of the logo ── */}
          <AnimatePresence>
            {scrolled && (
              <motion.div
                key="inline-links"
                className="nav-center-links"
                initial={{ opacity: 0, y: 15, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -15, x: "-50%" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
                style={{
                  position: "absolute",
                  top: 0, left: "50%",
                  height: "100%", /* match the row height exactly */
                  display: "flex", alignItems: "center", gap: "2.8rem",
                  pointerEvents: "none",
                  zIndex: 10,
                }}>
                {links.map(l => (
                  <a key={l} href={hrefFor(l)}
                    className={`nav-link-top ${active === hrefFor(l).slice(1) ? "active" : ""}`}
                    style={{ pointerEvents: "auto", fontWeight: 600 }}>{l}</a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* RIGHT — CTA + mobile toggle */}
          <div style={{ minWidth: 160, display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 6px 26px rgba(83,210,224,0.42)" }}
              whileTap={{ scale: 0.96 }}
              className="hp-nav-btn-started"
              onClick={() => navigate("/login")}
            >
              Get Started Free
            </motion.button>
            <button className="mob-toggle" onClick={() => setMobileOpen(o => !o)}
              style={{ display: "none", background: "none", border: "none", color: "var(--hp-ink-mid)", cursor: "pointer", padding: 4 }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Pill: only around the nav links, visible when NOT scrolled ── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            key="links-pill"
            className="hp-navbar-links-pill"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {links.map(l => (
              <a key={l} href={hrefFor(l)} className={`nav-link-top ${active === hrefFor(l).slice(1) ? "active" : ""}`}>{l}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ width: "100%", background: "rgba(255,255,255,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--hp-border-soft)", padding: "0.5rem 2rem 1rem" }}>
            {links.map(l => (
              <div key={l} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--hp-border-soft)" }}>
                <a href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} onClick={() => setMobileOpen(false)}
                  style={{ color: "var(--hp-ink-mid)", textDecoration: "none", fontSize: 15, fontWeight: 500 }}>{l}</a>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── HERO ──────────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const floatY = useTransform(scrollY, [0, 500], [0, -50]);

  const MockCard = ({ label, value, sub, color, icon: Icon, delay }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-card"
      style={{ borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={19} color={color} />
      </div>
      <div>
        <div className="syne" style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 1 }}>{sub}</div>}
      </div>
    </motion.div>
  );

  return (
    <div className="dot-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 136, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-8%", right: "-4%", width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle,rgba(83,210,224,0.15) 0%,transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "0%", left: "-6%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(158,234,246,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "-5%", left: "30%", width: 500, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,230,200,0.25) 0%,transparent 60%)", pointerEvents: "none" }} />

      <div className="hp-hero-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem 5rem", width: "100%", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "3.5rem", alignItems: "center" }}>
        <motion.div initial="hidden" animate="visible">
          <motion.div variants={fadeUp} custom={0}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.8rem", background: "var(--cyan-soft)", border: "1px solid var(--cyan-tag)", borderRadius: 100, padding: "6px 16px 6px 10px" }}>
            <Brain size={14} color="var(--cyan-dark)" />
            <span style={{ fontSize: 13, color: "var(--cyan-dark)", fontWeight: 600 }}>The all-in-one study OS</span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1}
            style={{ fontSize: "clamp(2.8rem,5.8vw,5rem)", lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "1.4rem" }}>
            <span className="serif" style={{ color: "var(--ink)", display: "block" }}>Focus Deeper.</span>
            <span className="serif cyan-text" style={{ display: "block" }}>Learn Smarter.</span>
            <span className="serif" style={{ color: "var(--ink)", display: "block" }}>Achieve More.</span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2}
            style={{ fontSize: "clamp(0.98rem,1.6vw,1.1rem)", color: "var(--ink-light)", maxWidth: 480, lineHeight: 1.75, marginBottom: "2.2rem", fontWeight: 400 }}>
            Intellecta is the all-in-one academic performance platform — merging academic scheduling, deep work sessions, smart notes, distraction science, and competitive leaderboards into one unified sanctuary.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: "2.2rem" }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/login")}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,var(--hp-cyan-dark),var(--hp-cyan))", border: "none", color: "white", padding: "15px 30px", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "pulse-ring 2.5s ease-in-out infinite" }}>
              <Zap size={17} /> Enter the Sanctuary
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Free to start", "Study Planner", "Deep Focus Timer", "Global Leaderboard"].map(tag => (
              <span key={tag} style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-mid)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid var(--border-soft)", borderRadius: 100, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={12} color="var(--cyan)" />{tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div style={{ y: floatY, display: "flex", flexDirection: "column", gap: "0.9rem" }} className="hero-right">
          <div style={{ display: "flex", gap: "0.9rem", justifyContent: "flex-end" }}>
            <MockCard icon={Timer} label="Focus Streak" value="14 Days" sub="+2 this week" color="#53D2E0" delay={0.5} />
            <MockCard icon={Target} label="Daily Goal" value="4.2 / 6h" sub="70% done" color="#F97316" delay={0.65} />
          </div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            style={{ background: "linear-gradient(145deg,#1DA8B8 0%,#53D2E0 60%,#7EEAF4 100%)", borderRadius: 20, padding: "26px 26px 22px", boxShadow: "0 16px 60px rgba(83,210,224,0.4)", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -24, right: -24, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ position: "absolute", bottom: -28, right: 32, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", opacity: 0.65, marginBottom: 6 }}>CURRENT STANDING</div>
            <div className="syne" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>Level 12</div>
            <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 16 }}>Scholar</div>
            <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 5, display: "flex", justifyContent: "space-between" }}>
              <span>2,450 XP</span><span>3,000 XP</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: "82%" }} transition={{ delay: 1.1, duration: 1 }}
                style={{ height: "100%", background: "linear-gradient(90deg,rgba(255,255,255,0.6),rgba(255,255,255,0.9))", borderRadius: 3 }} />
            </div>
            <div style={{ marginTop: 12, fontSize: 11.5, opacity: 0.6 }}>550 XP to next level · Deep Thinker badge</div>
          </motion.div>

          <div style={{ display: "flex", gap: "0.9rem" }}>
            <MockCard icon={BarChart3} label="Focus Score" value="88.4" sub="Top 5% cohort" color="#10B981" delay={1.0} />
            <MockCard icon={Trophy} label="Global Rank" value="#42" sub="of 1,200" color="#F59E0B" delay={1.15} />
          </div>
        </motion.div>
      </div>

      <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}
        style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", color: "var(--muted)" }}>
        <ChevronDown size={22} />
      </motion.div>

      <style>{`@media(max-width:900px){.hero-right{display:none!important;}.hp-hero-grid{grid-template-columns:1fr!important;gap:2rem!important;}}`}</style>
    </div>
  );
}

/* ─── TICKER ─────────────────────────────────────────────── */
function Ticker() {
  const items = ["Deep Work Sessions", "Study Planning", "Smart Notes", "Distraction Analytics", "Coverage Tracker", "Quiz Engine", "Global Leaderboard", "Focus Intensity", "Peer Comparison", "Exam Prep", "Strategic Planning", "Scholar Streaks", "Lofi Music", "Theme Changer"];
  const doubled = [...items, ...items];
  return (
    <div className="hp-ticker" style={{ background: "linear-gradient(135deg,#1DA8B8 0%,#53D2E0 100%)", padding: "13px 0", overflow: "hidden", boxShadow: "0 4px 20px rgba(83,210,224,0.28)" }}>
      <div className="hp-ticker-track" style={{ display: "flex", width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="syne" style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", padding: "0 1.8rem", color: "rgba(255,255,255,0.92)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {item} <span style={{ opacity: 0.35, marginLeft: "1.8rem" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURES ───────────────────────────────────────────── */
const FEATURES = [
  { icon: Timer,        color: "#53D2E0", label: "Focus Sessions",  title: "Deep Work, Engineered",       desc: "Timed Sanctuary sessions with real-time focus intensity tracking. Biometric-style cognitive load monitoring reveals your peak performance windows." },
  { icon: CalendarDays, color: "#3EC8D8", label: "Study Schedule",  title: "Academic Trajectory",      desc: "Enroll courses with exam dates and deadlines. Organize your weekly curriculum and stay on top of upcoming milestones." },
  { icon: NotebookPen,  color: "#1DA8B8", label: "Smart Notes",     title: "Notes That Think With You",   desc: "Tag, pin, and organize notes across subjects. The slide-in editor lets you capture insights mid-session without breaking your flow state." },
  { icon: Folder,       color: "#F97316", label: "Subject Folders", title: "Curriculum Architecture",     desc: "Structure your academic world into subject folders. Each tracks coverage, upcoming exams, and review queues for a full bird's-eye view." },
  { icon: ShieldOff,    color: "#EF4444", label: "Distraction Log", title: "Neutralize Cognitive Leaks",  desc: "Log and analyze every distraction — social media, hunger, notifications. Trigger charts show exactly where your focus bleeds out." },
  { icon: ListChecks,   color: "#06B6D4", label: "Coverage Tracker",title: "Mastery, Topic by Topic",     desc: "Granular per-topic status — Mastered, In Progress, Reviewed, Not Started — paired with a Panic Meter and smart daily study target." },
  { icon: Trophy,       color: "#F59E0B", label: "Leaderboard",     title: "Compete Globally",            desc: "Rise through Global Standings and Sectional Leaderboards. Peer comparison tools pit your focus momentum against top scholars worldwide." },
  { icon: BarChart3,    color: "#10B981", label: "Analytics",       title: "Cognitive Performance Intel", desc: "Focus intensity curves, peak window heatmaps, mastery deficit tracking, and daily delta scores — know your mind better than your syllabus." },
];

/* Each card is its own component so hooks are called at top level */
function FeatureCard({ feat, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hov, setHov] = useState(false);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 44 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: `1.5px solid ${hov ? feat.color + "55" : "rgba(255,255,255,0.65)"}`,
        borderRadius: 16, padding: "1.7rem",
        boxShadow: hov ? `0 16px 44px ${feat.color}2E` : "0 2px 10px rgba(30,41,59,0.05)",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.28s ease", cursor: "default",
      }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: `${feat.color}16`, border: `1.5px solid ${feat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.2rem", boxShadow: hov ? `0 4px 18px ${feat.color}28` : "none", transition: "box-shadow 0.28s" }}>
        <feat.icon size={22} color={feat.color} />
      </div>
      <div style={{ fontSize: 11.5, color: feat.color, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{feat.label}</div>
      <h3 className="syne" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.6rem", lineHeight: 1.3 }}>{feat.title}</h3>
      <p style={{ fontSize: 14, color: "var(--ink-light)", lineHeight: 1.72 }}>{feat.desc}</p>
    </motion.div>
  );
}

function Features() {
  return (
    <InViewSection id="features" style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div variants={fadeUp} custom={0} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.4rem", background: "var(--cyan-soft)", border: "1px solid var(--cyan-tag)", borderRadius: 100, padding: "6px 18px" }}>
            <Layers size={13} color="var(--cyan-dark)" />
            <span style={{ fontSize: 13, color: "var(--cyan-dark)", fontWeight: 600 }}>Everything in one place</span>
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(2.2rem,4.5vw,3.6rem)", marginBottom: "1rem", lineHeight: 1.15, color: "var(--ink)" }}>
            Built for the <span className="cyan-text">relentlessly curious</span>
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--ink-light)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Every feature in Intellecta is engineered around one idea: protecting and amplifying your cognitive performance.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(265px,1fr))", gap: "1.1rem" }}>
          {FEATURES.map((feat, i) => <FeatureCard key={feat.label + i} feat={feat} i={i} />)}
        </div>
      </div>
    </InViewSection>
  );
}

/* ─── HOW IT WORKS ───────────────────────────────────────── */
/* FIX: extracted StepCard as a named component — hooks cannot be called inside .map() callbacks */
const HOW_STEPS = [
  { n: "01", icon: Target,     color: "#53D2E0", title: "Set Your Mission",        desc: "Enroll courses with exam dates, difficulty, and weekly hours. Intellecta maps your entire semester into a strategic academic trajectory." },
  { n: "02", icon: BrainCog,   color: "#3EC8D8", title: "Enter the Sanctuary",     desc: "Begin a deep work session. Focus intensity is tracked live. Every distraction is logged. Your cognitive score updates in real time." },
  { n: "03", icon: TrendingUp, color: "#F97316", title: "Track Mastery Precisely", desc: "Coverage Tracker breaks each subject into individual topics. Monitor your status and prioritize topics based on your actual progress." },
  { n: "04", icon: Trophy,     color: "#F59E0B", title: "Rise Through Rankings",   desc: "Focus hours, quiz scores, and mastery gains translate into XP. Climb the Global Leaderboard and earn Scholar achievement badges." },
];

function StepCard({ step, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: i * 0.1 }}
      style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.65)", borderRadius: 16, padding: "2rem 1.6rem", boxShadow: "0 2px 10px rgba(30,41,59,0.05)", position: "relative" }}>
      <div className="syne" style={{ position: "absolute", top: 18, right: 20, fontSize: 12, fontWeight: 800, color: step.color, opacity: 0.4, letterSpacing: "0.04em" }}>{step.n}</div>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: `${step.color}14`, border: `1.5px solid ${step.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.4rem" }}>
        <step.icon size={26} color={step.color} />
      </div>
      <h3 className="syne" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ink)", marginBottom: "0.6rem" }}>{step.title}</h3>
      <p style={{ fontSize: 14, color: "var(--ink-light)", lineHeight: 1.72 }}>{step.desc}</p>
    </motion.div>
  );
}

function HowItWorks() {
  return (
    <InViewSection id="how-it-works" style={{ padding: "6rem 2rem", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div variants={fadeUp} custom={0} style={{ textAlign: "center", marginBottom: "4.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.4rem", background: "var(--cyan-soft)", border: "1px solid var(--cyan-tag)", borderRadius: 100, padding: "6px 18px" }}>
            <BrainCog size={13} color="var(--cyan-dark)" />
            <span style={{ fontSize: 13, color: "var(--cyan-dark)", fontWeight: 600 }}>The method</span>
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(2.2rem,4.5vw,3.6rem)", color: "var(--ink)", marginBottom: "1rem" }}>
            How <span className="cyan-text">Intellecta</span> works
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--ink-light)", maxWidth: 460, margin: "0 auto" }}>
            Four powerful stages that transform how you study, focus, and perform.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.2rem" }}>
          {HOW_STEPS.map((step, i) => <StepCard key={step.n} step={step} i={i} />)}
        </div>
      </div>
    </InViewSection>
  );
}

/* ─── APP PREVIEW ─────────────────────────────────────────── */
/* FIX: extracted ScreenCard as a named component */
const SCREENS = [
  { label: "Focus Session",  color: "#53D2E0", bg: "rgba(83,210,224,0.12)",  icon: Timer,        desc: "Deep work timer with live focus tracking" },
  { label: "Study Schedule", color: "#F97316", bg: "rgba(249,115,22,0.1)",   icon: CalendarDays, desc: "Personalized weekly curriculum view" },
  { label: "All Notes",      color: "#10B981", bg: "rgba(16,185,129,0.1)",   icon: NotebookPen,  desc: "Searchable notes across every subject" },
  { label: "Leaderboard",    color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   icon: Trophy,       desc: "Global and sectional scholar rankings" },
  { label: "Lofi Music",     color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  icon: Music,        desc: "Ambient study soundscapes to keep you in flow" },
];

function ScreenCard({ s, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.65)", boxShadow: "0 2px 10px rgba(30,41,59,0.05)" }}>
      <div style={{ height: 130, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: `${s.color}20`, border: `2px solid ${s.color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <s.icon size={28} color={s.color} />
        </div>
        <div style={{ position: "absolute", top: 14, left: 16, display: "flex", gap: 5 }}>
          {["#EF4444", "#F59E0B", "#10B981"].map(c => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c, opacity: 0.55 }} />)}
        </div>
      </div>
      <div style={{ padding: "1.2rem" }}>
        <div style={{ fontSize: 11.5, color: s.color, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>{s.label}</div>
        <div className="syne" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{s.desc}</div>
      </div>
    </motion.div>
  );
}

function AppPreview() {
  return (
    <InViewSection style={{ padding: "6rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div variants={fadeUp} custom={0} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.4rem", background: "var(--cyan-soft)", border: "1px solid var(--cyan-tag)", borderRadius: 100, padding: "6px 18px" }}>
            <LayoutGrid size={13} color="var(--cyan-dark)" />
            <span style={{ fontSize: 13, color: "var(--cyan-dark)", fontWeight: 600 }}>The platform</span>
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", color: "var(--ink)", marginBottom: "0.8rem" }}>
            Every page. <span className="cyan-text">One purpose.</span>
          </h2>
          <p style={{ color: "var(--ink-light)", fontSize: "1.05rem" }}>
            A cohesive platform where every screen serves your academic performance.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1.1rem" }}>
          {SCREENS.map((s, i) => <ScreenCard key={s.label} s={s} i={i} />)}
        </div>
      </div>
    </InViewSection>
  );
}

/* ─── APP SHOWCASE (SCREENSHOTS) ─────────────────────────── */
const SCREENSHOTS = [
  screenshot1,
  screenshot2,
  screenshot3,
  screenshot4,
  screenshot5,
  screenshot6,
  screenshot7,
  screenshot8,
];

function AppShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % SCREENSHOTS.length);
    }, 7000); // Auto slide every 7s
    return () => clearInterval(timer);
  }, [paused]);

  const next = () => setIndex(prev => (prev + 1) % SCREENSHOTS.length);
  const prev = () => setIndex(prev => (prev - 1 + SCREENSHOTS.length) % SCREENSHOTS.length);

  return (
    <InViewSection id="showcase" style={{ padding: "5rem 2rem", background: "rgba(255,255,255,0.4)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.4rem", background: "var(--cyan-soft)", border: "1px solid var(--cyan-tag)", borderRadius: 100, padding: "6px 18px" }}>
          <BookOpen size={13} color="var(--cyan-dark)" />
          <span style={{ fontSize: 13, color: "var(--cyan-dark)", fontWeight: 600 }}>Product tour</span>
        </div>
        <h2 className="serif" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", color: "var(--ink)", marginBottom: "2rem" }}>
          See <span className="cyan-text">Intellecta</span> in Action
        </h2>
        
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
          style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(83,210,224,0.18)", border: "1px solid rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.6)" }}>
          <AnimatePresence mode="popLayout">
            <motion.img
              key={index}
              src={SCREENSHOTS[index]}
              alt={`Screenshot ${index + 1}`}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0 }}
            />
          </AnimatePresence>

          {/* Controls */}
          <button onClick={prev} aria-label="Previous screenshot" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 16px rgba(30,41,59,0.1)", zIndex: 10 }}>
            <ChevronLeft size={22} color="var(--hp-ink)" style={{ marginLeft: -2 }} />
          </button>
          <button onClick={next} aria-label="Next screenshot" style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 16px rgba(30,41,59,0.1)", zIndex: 10 }}>
            <ChevronRight size={22} color="var(--hp-ink)" style={{ marginRight: -2 }} />
          </button>

          {/* Dots */}
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 10 }}>
            {SCREENSHOTS.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} aria-label={`Go to screenshot ${i + 1}`} style={{ width: 10, height: 10, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.6)", cursor: "pointer", background: i === index ? "var(--hp-cyan)" : "rgba(255,255,255,0.5)", transition: "all 0.3s ease", padding: 0 }} />
            ))}
          </div>
        </div>
      </div>
    </InViewSection>
  );
}

/* ─── ABOUT ──────────────────────────────────────────────── */
/* FIX: extracted PillarCard as a named component */
const PILLARS = [
  { icon: BrainCog,          color: "#53D2E0", title: "Science-First Design",   desc: "Every feature is rooted in cognitive science — spaced repetition, Pomodoro neuroscience, and attention restoration theory." },
  { icon: Zap,               color: "#F97316", title: "Strategic Planning", desc: "Adapt your study plan based on actual progress. Stay flexible and focused on what matters most for your exams." },
  { icon: SlidersHorizontal, color: "#10B981", title: "Everything Integrated",  desc: "Notes, schedule, focus sessions, quiz engine, leaderboard — all connected. One sanctuary, zero app-switching." },
  { icon: ShieldOff,         color: "#EF4444", title: "Distraction Warfare",    desc: "Most apps help you plan. Intellecta helps you protect your focus. The distraction suite is unmatched." },
];

function PillarCard({ p, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.92 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.65)", borderRadius: 16, padding: "1.4rem", boxShadow: "0 2px 10px rgba(30,41,59,0.05)" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${p.color}14`, border: `1.5px solid ${p.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.9rem" }}>
        <p.icon size={20} color={p.color} />
      </div>
      <h4 className="syne" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: "0.4rem" }}>{p.title}</h4>
      <p style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.65 }}>{p.desc}</p>
    </motion.div>
  );
}

function About() {
  const navigate = useNavigate();
  return (
    <InViewSection id="about" style={{ padding: "7rem 2rem", background: "rgba(200,216,240,0.3)", backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="hp-about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
          <motion.div variants={fadeUp} custom={0}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.4rem", background: "var(--cyan-soft)", border: "1px solid var(--cyan-tag)", borderRadius: 100, padding: "6px 18px" }}>
              <Target size={13} color="var(--cyan-dark)" />
              <span style={{ fontSize: 13, color: "var(--cyan-dark)", fontWeight: 600 }}>Why Intellecta</span>
            </div>
            <h2 className="serif" style={{ fontSize: "clamp(2rem,4vw,3.2rem)", lineHeight: 1.15, marginBottom: "1.4rem", color: "var(--ink)" }}>
              Not a productivity app.<br />
              <span className="cyan-text">A cognitive system.</span>
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--ink-light)", lineHeight: 1.8, marginBottom: "1.2rem" }}>
              Other tools track tasks. Intellecta tracks <em>you</em> — your focus patterns, mastery gaps, distraction triggers, and peak performance windows.
            </p>
            <p style={{ fontSize: "1.05rem", color: "var(--ink-light)", lineHeight: 1.8, marginBottom: "2rem" }}>
              It's the only platform that treats your mind as the most important variable in academic success.
            </p>
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(83,210,224,0.4)" }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/login")}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,var(--hp-cyan-dark),var(--hp-cyan))", border: "none", color: "white", padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 4px 18px rgba(83,210,224,0.32)" }}>
              Start Your Journey <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          <div className="hp-pillars-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {PILLARS.map((p, i) => <PillarCard key={p.title} p={p} i={i} />)}
          </div>
        </div>
      </div>
    </InViewSection>
  );
}

/* ─── CTA ────────────────────────────────────────────────── */
function CtaSection() {
  const navigate = useNavigate();
  return (
    <InViewSection style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <motion.div variants={fadeUp} custom={0}
          style={{ background: "linear-gradient(145deg,#1DA8B8 0%,#53D2E0 55%,#7EEAF4 100%)", borderRadius: 28, padding: "5rem 3rem", boxShadow: "0 30px 90px rgba(29,168,184,0.42)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <motion.div variants={fadeUp} custom={1}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.8rem", background: "rgba(255,255,255,0.18)", borderRadius: 100, padding: "6px 18px" }}>
            <Flame size={13} color="#FEF3C7" />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Start for free — no credit card needed</span>
          </motion.div>

          <motion.h2 variants={fadeUp} custom={2} className="serif"
            style={{ fontSize: "clamp(2.4rem,5.5vw,4.2rem)", color: "white", marginBottom: "1.4rem", lineHeight: 1.1 }}>
            Your sanctuary<br /><span style={{ opacity: 0.85 }}>awaits.</span>
          </motion.h2>

          <motion.p variants={fadeUp} custom={3}
            style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.75)", maxWidth: 440, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            Join a global cohort of deep thinkers who've turned academic performance into a competitive advantage.
          </motion.p>

          <motion.button variants={fadeUp} custom={4}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(0,0,0,0.25)" }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/login")}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "white", border: "none", color: "var(--hp-cyan-dark)", padding: "17px 36px", borderRadius: 13, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
            <Zap size={18} style={{ color: "var(--hp-cyan-dark)" }} /> Enter the Sanctuary — It's Free
          </motion.button>

          <motion.p variants={fadeUp} custom={5}
            style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: "1.4rem" }}>
            Setup in under 3 minutes · Free forever plan available
          </motion.p>
        </motion.div>
      </div>
    </InViewSection>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────── */
function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Coverage Tracker", to: "/coverage" },
        { label: "Leaderboard", to: "/leaderboard" },
        { label: "Quizzes", to: "/quiz" },
        { label: "Notes", to: "/notes" },
        { label: "Study Schedule", to: "/schedule" },
        { label: "Focus Sessions", to: "/focus" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", anchor: "about" },
        { label: "How It Works", anchor: "how-it-works" },
        { label: "App Showcase", anchor: "showcase" },
      ],
    },
  ];
  return (
    <footer style={{ background: "rgba(168,232,244,0.25)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.5)", padding: "4rem 2rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "3rem", marginBottom: "3rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
              <img src={intellectaLogo} alt="Intellecta Logo" style={{
                width: 36, height: 36, borderRadius: 10,
                objectFit: "cover", flexShrink: 0,
                boxShadow: "0 4px 14px rgba(83,210,224,0.35)"
              }} />
              <span className="syne" style={{ fontSize: 19, fontWeight: 800, color: "var(--ink)" }}>Intellecta</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-light)", lineHeight: 1.75, maxWidth: 240 }}>
              The cognitive sanctuary for serious scholars. Focus deeper. Learn faster. Achieve more.
            </p>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <div className="syne" style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", marginBottom: "1rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {col.links.map(l => {
                  if (l.to) {
                    return (
                      <Link key={l.label} to={l.to}
                        style={{ fontSize: 13.5, color: "var(--ink-light)", textDecoration: "none", width: "fit-content" }}>
                        {l.label}
                      </Link>
                    );
                  }
                  return (
                    <a key={l.label} href={`#${l.anchor}`}
                      style={{ fontSize: 13.5, color: "var(--ink-light)", textDecoration: "none", width: "fit-content" }}>
                      {l.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.4)", paddingTop: "1.8rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>© 2026 Intellecta. All rights reserved.</span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Built for the relentlessly curious.</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── ROOT ───────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="hp-body">
      <Navbar />
      <Hero />
      <Ticker />
      <Features />
      <HowItWorks />
      <AppPreview />
      <AppShowcase />
      <About />
      <CtaSection />
      <Footer />
    </div>
  );
}
