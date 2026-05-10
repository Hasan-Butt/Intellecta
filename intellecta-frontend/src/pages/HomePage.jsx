import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Brain,
  CalendarDays,
  NotebookPen,
  Timer,
  Trophy,
  BarChart3,
  ShieldOff,
  FolderOpen,
  Flame,
  Star,
  ArrowRight,
  ChevronDown,
  Zap,
  Target,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle2,
  Play,
  Sparkles,
  Clock,
  Award,
  LineChart,
  Menu,
  X,
} from "lucide-react";

/* ─── GLOBAL STYLES ────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --void: #05040f;
      --cosmos: #0d0b1e;
      --nebula: #130f2a;
      --deep: #1a1535;
      --mid: #241e47;
      --violet: #5b3ff8;
      --violet-bright: #7c5cff;
      --violet-glow: #9b7dff;
      --violet-soft: #c4b5fd;
      --accent: #f97316;
      --accent-soft: #fed7aa;
      --mint: #34d399;
      --white: #fafafa;
      --muted: #a8a3c1;
      --border: rgba(91,63,248,0.18);
      --glass: rgba(91,63,248,0.06);
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--void);
      color: var(--white);
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
      line-height: 1.6;
    }

    ::selection { background: var(--violet); color: white; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: var(--violet); border-radius: 2px; }

    .serif { font-family: 'Instrument Serif', serif; }
    .syne { font-family: 'Syne', sans-serif; }

    .glow-text {
      background: linear-gradient(135deg, #fff 0%, var(--violet-glow) 50%, var(--violet-soft) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .noise-bg::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
      opacity: 0.4;
    }

    .grid-bg {
      background-image:
        linear-gradient(rgba(91,63,248,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(91,63,248,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-20px) rotate(2deg); }
      66% { transform: translateY(-10px) rotate(-1deg); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(91,63,248,0.3); }
      50% { box-shadow: 0 0 60px rgba(91,63,248,0.7), 0 0 100px rgba(91,63,248,0.3); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
      to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
    }
    @keyframes ticker {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
  `}</style>
);

/* ─── HELPERS ───────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.08 },
  }),
};

function Section({ children, className = "", id = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      style={{ position: "relative" }}
    >
      {children}
    </motion.section>
  );
}

/* ─── NAVBAR ────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Features", "How It Works", "Testimonials", "Pricing"];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "0 2rem",
        background: scrolled ? "rgba(5,4,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, var(--violet), var(--violet-bright))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(91,63,248,0.5)",
            }}
          >
            <Brain size={18} color="white" />
          </div>
          <span
            className="syne"
            style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            Intellecta
          </span>
        </div>

        {/* Desktop Links */}
        <div
          style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}
          className="desktop-nav"
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                color: "var(--muted)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => (e.target.style.color = "white")}
              onMouseLeave={(e) => (e.target.style.color = "var(--muted)")}
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 16px",
            }}
          >
            Sign In
          </button>
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 30px rgba(91,63,248,0.6)",
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              background:
                "linear-gradient(135deg, var(--violet), var(--violet-bright))",
              border: "none",
              color: "white",
              padding: "10px 22px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Get Started Free
          </motion.button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "none",
            }}
            className="menu-btn"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "var(--cosmos)",
              borderTop: "1px solid var(--border)",
              padding: "1rem 2rem",
            }}
          >
            {links.map((l) => (
              <div
                key={l}
                style={{
                  padding: "0.75rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <a
                  href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{
                    color: "var(--muted)",
                    textDecoration: "none",
                    fontSize: 15,
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {l}
                </a>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  );
}

/* ─── HERO ──────────────────────────────────────────────────── */
function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div
      className="grid-bg noise-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        paddingTop: 80,
      }}
    >
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <motion.div style={{ y: y1 }}>
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "55%",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(91,63,248,0.25) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "20%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              right: "10%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </motion.div>
      </div>

      {/* Floating orbital element */}
      <div
        style={{
          position: "absolute",
          right: "8%",
          top: "50%",
          transform: "translateY(-50%)",
          display: "none",
        }}
        className="orbital-container"
      >
        <div style={{ position: "relative", width: 280, height: 280 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(91,63,248,0.2)",
            }}
          />
          {[0, 120, 240].map((deg, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background:
                  i === 0
                    ? "var(--violet)"
                    : i === 1
                      ? "var(--accent)"
                      : "var(--mint)",
                animation: `orbit ${4 + i}s linear infinite`,
                animationDelay: `${i * -1.3}s`,
                marginLeft: -6,
                marginTop: -6,
                transform: `rotate(${deg}deg) translateX(120px) rotate(-${deg}deg)`,
                boxShadow: `0 0 15px ${i === 0 ? "var(--violet)" : i === 1 ? "var(--accent)" : "var(--mint)"}`,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--violet), var(--violet-bright))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(91,63,248,0.6)",
              animation: "pulse-glow 3s ease-in-out infinite",
            }}
          >
            <Brain size={36} color="white" />
          </div>
        </div>
      </div>

      <motion.div
        style={{
          opacity,
          position: "relative",
          zIndex: 10,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "5rem 2rem 4rem",
          width: "100%",
        }}
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(91,63,248,0.12)",
            border: "1px solid rgba(91,63,248,0.3)",
            borderRadius: 100,
            padding: "6px 16px 6px 8px",
            marginBottom: "2rem",
          }}
        >
          <span
            style={{
              background:
                "linear-gradient(135deg, var(--violet), var(--violet-bright))",
              borderRadius: 100,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "white",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            New
          </span>
          <span style={{ fontSize: 13, color: "var(--violet-soft)" }}>
            AI-powered Kinetic Recalibration is live
          </span>
          <ArrowRight size={13} color="var(--violet-glow)" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          style={{
            fontSize: "clamp(3rem, 7vw, 6.5rem)",
            lineHeight: 1.05,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
            maxWidth: 900,
          }}
        >
          <span
            className="serif"
            style={{ display: "block", color: "var(--white)" }}
          >
            Your Cognitive
          </span>
          <span
            className="serif glow-text"
            style={{ display: "block", fontStyle: "italic" }}
          >
            Sanctuary
          </span>
          <span
            className="syne"
            style={{
              display: "block",
              fontSize: "clamp(1.6rem, 3.5vw, 3rem)",
              fontWeight: 700,
              color: "var(--muted)",
              marginTop: "0.2em",
            }}
          >
            Focus. Learn. Achieve.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          custom={2}
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "var(--muted)",
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            fontWeight: 300,
          }}
        >
          Intellecta is the all-in-one academic performance platform built for
          deep thinkers — merging AI scheduling, distraction science, smart
          notes, and competitive learning into one sanctuary.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          custom={3}
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "3.5rem",
          }}
        >
          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 50px rgba(91,63,248,0.7)",
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background:
                "linear-gradient(135deg, var(--violet) 0%, var(--violet-bright) 100%)",
              border: "none",
              color: "white",
              padding: "16px 32px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 0 30px rgba(91,63,248,0.4)",
            }}
          >
            <Zap size={18} />
            Enter the Sanctuary
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, background: "rgba(91,63,248,0.1)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--white)",
              padding: "16px 28px",
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
          >
            <Play size={16} style={{ fill: "white" }} />
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp}
          custom={4}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex" }}>
            {["A", "B", "C", "D", "E"].map((l, i) => (
              <div
                key={l}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "2px solid var(--void)",
                  background: `hsl(${250 + i * 20}, 60%, ${45 + i * 5}%)`,
                  marginLeft: i > 0 ? -10 : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {l}
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={12}
                  style={{ fill: "#f59e0b", color: "#f59e0b" }}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>
              Trusted by <strong style={{ color: "white" }}>12,000+</strong>{" "}
              focused learners globally
            </span>
          </div>
          <div style={{ width: 1, height: 32, background: "var(--border)" }} />
          <div style={{ display: "flex", gap: 24 }}>
            {[
              ["#42", "Global Rank"],
              ["Top 5%", "Cohort"],
              ["14d", "Avg Streak"],
            ].map(([val, label]) => (
              <div key={label}>
                <div
                  className="syne"
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--violet-soft)",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          color: "var(--muted)",
          opacity: 0.6,
        }}
      >
        <ChevronDown size={24} />
      </motion.div>
    </div>
  );
}

/* ─── TICKER ────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    "Deep Work Sessions",
    "AI-Powered Scheduling",
    "Smart Notes",
    "Distraction Analytics",
    "Coverage Tracker",
    "Quiz Engine",
    "Global Leaderboard",
    "Focus Intensity Graphs",
    "Peer Comparison",
    "Exam Prep Mode",
    "Kinetic Recalibration",
    "Cognitive Streaks",
  ];
  const doubled = [...items, ...items];
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, var(--violet) 0%, var(--violet-bright) 100%)",
        padding: "14px 0",
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          animation: "ticker 30s linear infinite",
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="syne"
            style={{
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              padding: "0 2rem",
              opacity: 0.9,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {item} <span style={{ opacity: 0.5, marginLeft: "2rem" }}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURES ──────────────────────────────────────────────── */
const featureData = [
  {
    icon: Timer,
    color: "#5b3ff8",
    label: "Focus Sessions",
    title: "Deep Work, Engineered",
    desc: "Enter timed Sanctuary sessions with real-time focus intensity tracking. Biometric-style cognitive load monitoring helps you identify your peak performance windows.",
    stats: [
      { v: "8.2h", l: "Avg daily focus" },
      { v: "94%", l: "Session completion" },
    ],
  },
  {
    icon: CalendarDays,
    color: "#7c5cff",
    label: "Study Schedule",
    title: "AI Academic Trajectory",
    desc: "Enroll courses with exam dates and deadlines. The Kinetic Algorithm dynamically recalibrates your weekly curriculum based on mastery gaps and upcoming pressure points.",
    stats: [
      { v: "3x", l: "Faster exam prep" },
      { v: "64%", l: "Avg mastery gain" },
    ],
  },
  {
    icon: NotebookPen,
    color: "#9b7dff",
    label: "All Notes",
    title: "Smart Note Sanctuary",
    desc: "Tag, pin, and organize notes across subjects. The slide-in editor panel lets you capture insights from any session without leaving your flow state.",
    stats: [
      { v: "1,200+", l: "Notes created" },
      { v: "100%", l: "Searchable" },
    ],
  },
  {
    icon: FolderOpen,
    color: "#f97316",
    label: "Subject Folders",
    title: "Curriculum Architecture",
    desc: "Structure your academic universe into subject folders. Each folder tracks coverage, upcoming exams, and review queues — giving you a bird's-eye view of your intellectual territory.",
    stats: [
      { v: "12", l: "Active subjects" },
      { v: "62%", l: "Avg coverage" },
    ],
  },
  {
    icon: ShieldOff,
    color: "#34d399",
    label: "Distraction Log",
    title: "Neutralize Cognitive Leaks",
    desc: "Log and analyze every distraction — social media, notifications, hunger. Trigger distribution charts and weekly trend graphs show exactly where your focus bleeds out.",
    stats: [
      { v: "-42%", l: "Distractions/week" },
      { v: "18.5m", l: "Recovery time saved" },
    ],
  },
  {
    icon: Trophy,
    color: "#fbbf24",
    label: "Leaderboard",
    title: "Compete at a Global Scale",
    desc: "Rise through the Global Standings and Sectional Leaderboards. Peer comparison tools pit your focus momentum against top scholars worldwide.",
    stats: [
      { v: "1.2k+", l: "Active scholars" },
      { v: "#42", l: "Your rank" },
    ],
  },
  {
    icon: BarChart3,
    color: "#f43f5e",
    label: "Analytics",
    title: "Cognitive Performance Intel",
    desc: "Focus intensity curves, peak window heatmaps, mastery deficit tracking, and daily delta scores. Know your mind better than you know your syllabus.",
    stats: [
      { v: "+12%", l: "Weekly growth" },
      { v: "78", l: "Sanctuary score" },
    ],
  },
  {
    icon: BookOpen,
    color: "#06b6d4",
    label: "Coverage Tracker",
    title: "Mastery, Topic by Topic",
    desc: "Track granular curriculum coverage with per-topic status — Mastered, In Progress, Reviewed, Not Started. Paired with a Panic Meter and smart study target calculator.",
    stats: [
      { v: "62%", l: "Avg curriculum done" },
      { v: "12d", l: "To exam" },
    ],
  },
];

function FeatureCard({ feat, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        delay: (i % 4) * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(91,63,248,0.08)" : "rgba(13,11,30,0.6)",
        border: `1px solid ${hovered ? "rgba(91,63,248,0.4)" : "var(--border)"}`,
        borderRadius: 20,
        padding: "2rem",
        cursor: "default",
        transition: "all 0.3s ease",
        backdropFilter: "blur(10px)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${feat.color}20`,
          border: `1px solid ${feat.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.2rem",
          transition: "all 0.3s",
          boxShadow: hovered ? `0 0 20px ${feat.color}40` : "none",
        }}
      >
        <feat.icon size={22} color={feat.color} />
      </div>
      <div
        style={{
          fontSize: 11,
          color: feat.color,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {feat.label}
      </div>
      <h3
        className="syne"
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          lineHeight: 1.3,
        }}
      >
        {feat.title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--muted)",
          lineHeight: 1.7,
          marginBottom: "1.5rem",
        }}
      >
        {feat.desc}
      </p>
      <div style={{ display: "flex", gap: 20 }}>
        {feat.stats.map((s) => (
          <div key={s.l}>
            <div
              className="syne"
              style={{ fontSize: 18, fontWeight: 800, color: feat.color }}
            >
              {s.v}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Features() {
  return (
    <Section id="features" style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: "1.5rem",
              background: "rgba(91,63,248,0.1)",
              border: "1px solid var(--border)",
              borderRadius: 100,
              padding: "6px 18px",
            }}
          >
            <Sparkles size={14} color="var(--violet-glow)" />
            <span
              style={{
                fontSize: 13,
                color: "var(--violet-soft)",
                fontWeight: 500,
              }}
            >
              Everything you need to dominate
            </span>
          </div>
          <h2
            className="serif"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: "1rem",
              lineHeight: 1.15,
            }}
          >
            Built for the{" "}
            <span className="glow-text" style={{ fontStyle: "italic" }}>
              relentlessly curious
            </span>
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--muted)",
              maxWidth: 540,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Every feature of Intellecta is engineered around one idea:
            protecting and amplifying your cognitive performance.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {featureData.map((feat, i) => (
            <FeatureCard key={feat.label} feat={feat} i={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── HOW IT WORKS ──────────────────────────────────────────── */

// Extracted component for HowItWorks step
function HowItWorksStep({ step, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.12 }}
      style={{
        textAlign: "center",
        padding: "2.5rem 1.5rem",
        position: "relative",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          margin: "0 auto 1.5rem",
          background: `${step.color}15`,
          border: `2px solid ${step.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <step.icon size={28} color={step.color} />
        <div
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--void)",
            border: `2px solid ${step.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 800,
            color: step.color,
          }}
          className="syne"
        >
          {step.n}
        </div>
      </div>
      <h3
        className="syne"
        style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}
      >
        {step.title}
      </h3>
      <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7 }}>
        {step.desc}
      </p>
    </motion.div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: Target,
      title: "Set Your Academic Mission",
      desc: "Enroll your courses with exam dates, difficulty levels, and weekly commitment hours. Intellecta maps your entire semester into a strategic trajectory.",
      color: "#5b3ff8",
    },
    {
      n: "02",
      icon: Brain,
      title: "Enter the Sanctuary",
      desc: "Begin a deep work session. Your focus intensity is tracked in real-time. Every distraction is logged. Your cognitive score updates live.",
      color: "#7c5cff",
    },
    {
      n: "03",
      icon: TrendingUp,
      title: "Track Mastery Precisely",
      desc: "Coverage Tracker breaks every subject into individual topics. Mark progress, identify deficits, and let the Kinetic Algorithm reschedule your priorities.",
      color: "#f97316",
    },
    {
      n: "04",
      icon: Trophy,
      title: "Rise Through the Rankings",
      desc: "Your focus hours, quiz scores, and mastery gains translate into XP. Climb the Global Leaderboard. Compare yourself to peers. Earn Scholar badges.",
      color: "#fbbf24",
    },
  ];

  return (
    <Section
      id="how-it-works"
      style={{
        padding: "7rem 2rem",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(13,11,30,0.8) 50%, transparent 100%)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <h2
            className="serif"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: "1rem",
            }}
          >
            How{" "}
            <span className="glow-text" style={{ fontStyle: "italic" }}>
              Intellecta
            </span>{" "}
            works
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--muted)",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Four powerful stages that transform how you study, focus, and
            perform.
          </p>
        </motion.div>

        <div style={{ position: "relative" }}>
          {/* Connecting line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 60,
              bottom: 60,
              width: 1,
              background:
                "linear-gradient(180deg, var(--violet) 0%, rgba(91,63,248,0) 100%)",
              transform: "translateX(-50%)",
              display: "none",
            }}
            className="connector-line"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            {steps.map((step, i) => (
              <HowItWorksStep key={step.n} step={step} i={i} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── STATS BANNER ──────────────────────────────────────────── */
function StatsBanner() {
  const stats = [
    { value: "12,000+", label: "Active Scholars", icon: Users },
    { value: "8.2h", label: "Avg Daily Focus", icon: Clock },
    { value: "94%", label: "Session Completion", icon: CheckCircle2 },
    { value: "3.2x", label: "Faster Exam Prep", icon: LineChart },
    { value: "14 Days", label: "Avg Focus Streak", icon: Flame },
    { value: "Top 5%", label: "Cohort Performance", icon: Award },
  ];

  return (
    <Section style={{ padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(91,63,248,0.15) 0%, rgba(124,92,255,0.08) 100%)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: "3rem 2rem",
            backdropFilter: "blur(20px)",
          }}
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            <span
              className="syne"
              style={{
                fontSize: 12,
                color: "var(--violet-glow)",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              By the numbers
            </span>
          </motion.div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "2rem",
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                custom={i * 0.5}
                style={{ textAlign: "center" }}
              >
                <s.icon
                  size={24}
                  color="var(--violet-glow)"
                  style={{ marginBottom: 12 }}
                />
                <div
                  className="syne"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, white, var(--violet-soft))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}
                >
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── WHY INTELLECTA ────────────────────────────────────────── */

// Extracted component for WhyIntellecta pillar
function PillarCard({ p, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      style={{
        background: "rgba(13,11,30,0.8)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "1.5rem",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${p.color}20`,
          border: `1px solid ${p.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <p.icon size={20} color={p.color} />
      </div>
      <h4
        className="syne"
        style={{ fontSize: 15, fontWeight: 700, marginBottom: "0.5rem" }}
      >
        {p.title}
      </h4>
      <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
        {p.desc}
      </p>
    </motion.div>
  );
}

function WhyIntellecta() {
  const pillars = [
    {
      icon: Brain,
      title: "Science-First Design",
      desc: "Every feature is rooted in cognitive science — spaced repetition, Pomodoro neuroscience, peak performance windows, and attention restoration theory.",
      color: "#5b3ff8",
    },
    {
      icon: Zap,
      title: "Real-Time Intelligence",
      desc: "Intellecta doesn't just track — it responds. The Kinetic Algorithm adapts your schedule live, based on what you've actually done, not what you planned.",
      color: "#f97316",
    },
    {
      icon: Users,
      title: "Community-Powered",
      desc: "Study alone but compete together. Global and sectional leaderboards create healthy academic competition that doubles retention and motivation.",
      color: "#34d399",
    },
    {
      icon: ShieldOff,
      title: "Distraction Warfare",
      desc: "Most apps help you plan. Intellecta helps you protect your focus. The distraction analytics suite is unlike anything else in academic tools.",
      color: "#f43f5e",
    },
  ];

  return (
    <Section style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          <motion.div variants={fadeUp} custom={0}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: "1.5rem",
                background: "rgba(91,63,248,0.1)",
                border: "1px solid var(--border)",
                borderRadius: 100,
                padding: "6px 18px",
              }}
            >
              <Target size={14} color="var(--violet-glow)" />
              <span
                style={{
                  fontSize: 13,
                  color: "var(--violet-soft)",
                  fontWeight: 500,
                }}
              >
                Why Intellecta
              </span>
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                lineHeight: 1.15,
                marginBottom: "1.5rem",
              }}
            >
              Not a productivity app.
              <br />
              <span className="glow-text" style={{ fontStyle: "italic" }}>
                A cognitive system.
              </span>
            </h2>
            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--muted)",
                lineHeight: 1.8,
                marginBottom: "2rem",
              }}
            >
              Other tools track tasks. Intellecta tracks you — your focus
              patterns, mastery gaps, distraction triggers, and peak performance
              windows. It's the only platform that treats your mind as the most
              important variable in academic success.
            </p>
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 40px rgba(91,63,248,0.6)",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background:
                  "linear-gradient(135deg, var(--violet), var(--violet-bright))",
                border: "none",
                color: "white",
                padding: "14px 28px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Start Your Journey <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {pillars.map((p, i) => (
              <PillarCard key={p.title} p={p} i={i} />
            ))}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .why-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Section>
  );
}

/* ─── TESTIMONIALS ──────────────────────────────────────────── */

// Extracted component for testimonial card
function TestimonialCard({ t, i }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
      style={{
        background: "rgba(13,11,30,0.7)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "1.8rem",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", gap: 2, marginBottom: "1rem" }}>
        {Array(t.stars)
          .fill(0)
          .map((_, j) => (
            <Star
              key={j}
              size={13}
              style={{ fill: "#f59e0b", color: "#f59e0b" }}
            />
          ))}
      </div>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.85)",
          marginBottom: "1.5rem",
        }}
      >
        "{t.text}"
      </p>
      <div
        style={{
          display: "inline-block",
          background: "rgba(91,63,248,0.15)",
          border: "1px solid rgba(91,63,248,0.3)",
          borderRadius: 8,
          padding: "4px 12px",
          fontSize: 12,
          color: "var(--violet-soft)",
          fontWeight: 600,
          marginBottom: "1.2rem",
        }}
      >
        {t.highlight}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--violet), var(--violet-bright))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "white",
          }}
        >
          {t.avatar}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

function Testimonials() {
  const testimonials = [
    {
      name: "Zara Malik",
      role: "CS Senior, LUMS",
      avatar: "ZM",
      text: "Intellecta changed the way I study. The distraction log alone saved me 2 hours a day. My GPA jumped from 3.1 to 3.7 in one semester.",
      stars: 5,
      highlight: "3.7 GPA",
    },
    {
      name: "David Park",
      role: "Pre-Med, Stanford",
      avatar: "DP",
      text: "The Coverage Tracker and Panic Meter are genuinely terrifying — in a good way. I aced my MCAT because I could see exactly where my gaps were.",
      stars: 5,
      highlight: "MCAT 99th percentile",
    },
    {
      name: "Elena Rossi",
      role: "Economics, Bocconi",
      avatar: "ER",
      text: "The Global Leaderboard is addictive. Competing with peers across the world made me study 40% more than I ever did before. I'm now #3 globally.",
      stars: 5,
      highlight: "#3 Global Rank",
    },
    {
      name: "Marcus Chen",
      role: "ML Engineer, MIT",
      avatar: "MC",
      text: "No other tool tracks focus like Intellecta. The focus intensity curves and peak window analytics helped me schedule my hardest work in my optimal hours.",
      stars: 5,
      highlight: "84hrs focused/week",
    },
    {
      name: "Aisha Farooq",
      role: "Law Student, Oxford",
      avatar: "AF",
      text: "The AI scheduling is genuinely smart. When I added my bar exam, it automatically restructured my entire study plan around my weakest topics.",
      stars: 5,
      highlight: "Bar Exam Top 10%",
    },
    {
      name: "Omar Hassan",
      role: "PhD Candidate",
      avatar: "OH",
      text: "I've tried every Pomodoro and GTD tool out there. Intellecta is the first one that feels like it was built for serious academic work, not productivity theater.",
      stars: 5,
      highlight: "PhD Research",
    },
  ];

  return (
    <Section
      id="testimonials"
      style={{ padding: "7rem 2rem", overflow: "hidden" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <h2
            className="serif"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: "1rem",
            }}
          >
            Scholars who{" "}
            <span className="glow-text" style={{ fontStyle: "italic" }}>
              transformed
            </span>
          </h2>
          <p style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
            Real results from real learners inside the Sanctuary.
          </p>
        </motion.div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.2rem",
          }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── PRICING ───────────────────────────────────────────────── */
function Pricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Scholar",
      price: annual ? 0 : 0,
      label: "Free forever",
      features: [
        "5 Focus Sessions/week",
        "Basic Notes",
        "Study Schedule (2 courses)",
        "Quiz Engine (10 attempts)",
        "Community Leaderboard",
      ],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Deep Work",
      price: annual ? 12 : 16,
      label: annual ? "/mo, billed annually" : "/month",
      features: [
        "Unlimited Focus Sessions",
        "Smart Notes + Slide Editor",
        "Unlimited Courses",
        "Coverage Tracker + Panic Meter",
        "Distraction Analytics",
        "Global Leaderboard",
        "AI Kinetic Recalibration",
      ],
      cta: "Start 14-Day Trial",
      highlight: true,
    },
    {
      name: "Scholar Elite",
      price: annual ? 24 : 30,
      label: annual ? "/mo, billed annually" : "/month",
      features: [
        "Everything in Deep Work",
        "Peer Comparison Intelligence",
        "Cohort Analytics",
        "Priority AI Scheduling",
        "Export Performance Reports",
        "Dedicated Scholar Coach",
        "Early Feature Access",
      ],
      cta: "Go Elite",
      highlight: false,
    },
  ];

  return (
    <Section id="pricing" style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >
          <h2
            className="serif"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: "1rem",
            }}
          >
            Invest in your{" "}
            <span className="glow-text" style={{ fontStyle: "italic" }}>
              intellect
            </span>
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--muted)",
              marginBottom: "2rem",
            }}
          >
            Start free. Upgrade when you're ready to dominate.
          </p>
          <div
            style={{
              display: "inline-flex",
              background: "var(--deep)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 4,
            }}
          >
            {["Monthly", "Annual (Save 25%)"].map((l, i) => (
              <button
                key={l}
                onClick={() => setAnnual(i === 1)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 9,
                  border: "none",
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background:
                    (i === 1) === annual
                      ? "linear-gradient(135deg, var(--violet), var(--violet-bright))"
                      : "transparent",
                  color: (i === 1) === annual ? "white" : "var(--muted)",
                  fontWeight: 500,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.2rem",
            alignItems: "stretch",
          }}
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              custom={i * 0.5}
              style={{
                background: plan.highlight
                  ? "linear-gradient(160deg, rgba(91,63,248,0.2) 0%, rgba(124,92,255,0.08) 100%)"
                  : "rgba(13,11,30,0.7)",
                border: plan.highlight
                  ? "2px solid var(--violet)"
                  : "1px solid var(--border)",
                borderRadius: 20,
                padding: "2rem",
                position: "relative",
                backdropFilter: "blur(10px)",
                boxShadow: plan.highlight
                  ? "0 0 60px rgba(91,63,248,0.2)"
                  : "none",
              }}
            >
              {plan.highlight && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background:
                      "linear-gradient(135deg, var(--violet), var(--violet-bright))",
                    borderRadius: 100,
                    padding: "4px 16px",
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Most Popular
                </div>
              )}
              <div
                className="syne"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--violet-glow)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {plan.name}
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <span
                  className="syne"
                  style={{ fontSize: "2.8rem", fontWeight: 800 }}
                >
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                </span>
                <span
                  style={{ fontSize: 14, color: "var(--muted)", marginLeft: 6 }}
                >
                  {plan.label}
                </span>
              </div>
              <div
                style={{
                  marginBottom: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {plan.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      color={
                        plan.highlight ? "var(--violet-bright)" : "var(--mint)"
                      }
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                    <span
                      style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: plan.highlight
                    ? "linear-gradient(135deg, var(--violet), var(--violet-bright))"
                    : "transparent",
                  border: plan.highlight ? "none" : "1px solid var(--border)",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: plan.highlight
                    ? "0 0 30px rgba(91,63,248,0.4)"
                    : "none",
                }}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── CTA SECTION ───────────────────────────────────────────── */
function CtaSection() {
  return (
    <Section style={{ padding: "7rem 2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          variants={fadeUp}
          custom={0}
          style={{
            background:
              "linear-gradient(135deg, rgba(91,63,248,0.2) 0%, rgba(124,92,255,0.1) 50%, rgba(249,115,22,0.05) 100%)",
            border: "1px solid rgba(91,63,248,0.3)",
            borderRadius: 28,
            padding: "5rem 3rem",
            position: "relative",
            overflow: "hidden",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Decorative glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle, rgba(91,63,248,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <motion.div
            variants={fadeUp}
            custom={1}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: "2rem",
              background: "rgba(91,63,248,0.15)",
              border: "1px solid rgba(91,63,248,0.4)",
              borderRadius: 100,
              padding: "6px 18px",
            }}
          >
            <Flame size={14} color="var(--accent)" />
            <span
              style={{
                fontSize: 13,
                color: "var(--accent-soft)",
                fontWeight: 500,
              }}
            >
              12,000+ scholars already inside
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={2}
            className="serif"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              marginBottom: "1.5rem",
              lineHeight: 1.1,
            }}
          >
            Your sanctuary
            <br />
            <span className="glow-text" style={{ fontStyle: "italic" }}>
              awaits.
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={3}
            style={{
              fontSize: "1.1rem",
              color: "var(--muted)",
              maxWidth: 480,
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Join a global cohort of deep thinkers who've turned their academic
            performance into a competitive advantage.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={4}
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 60px rgba(91,63,248,0.8)",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background:
                  "linear-gradient(135deg, var(--violet), var(--violet-bright))",
                border: "none",
                color: "white",
                padding: "18px 36px",
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 0 40px rgba(91,63,248,0.5)",
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
            >
              <Zap size={20} />
              Enter the Sanctuary — It's Free
            </motion.button>
          </motion.div>

          <motion.p
            variants={fadeUp}
            custom={5}
            style={{ fontSize: 13, color: "var(--muted)", marginTop: "1.5rem" }}
          >
            No credit card required. Cancel anytime. Setup in under 3 minutes.
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ─── FOOTER ────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Features", "How It Works", "Pricing", "Changelog", "Roadmap"],
    },
    {
      title: "Resources",
      links: [
        "Documentation",
        "Blog",
        "Community",
        "Case Studies",
        "Scholar Stories",
      ],
    },
    {
      title: "Company",
      links: [
        "About",
        "Careers",
        "Privacy Policy",
        "Terms of Service",
        "Contact",
      ],
    },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        padding: "4rem 2rem 2rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "3rem",
            marginBottom: "3rem",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, var(--violet), var(--violet-bright))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={18} color="white" />
              </div>
              <span className="syne" style={{ fontSize: 20, fontWeight: 800 }}>
                Intellecta
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: "var(--muted)",
                lineHeight: 1.7,
                maxWidth: 260,
              }}
            >
              The cognitive sanctuary for serious scholars. Focus deeper. Learn
              faster. Achieve more.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: "1.5rem" }}>
              {["Twitter", "Discord", "LinkedIn"].map((s) => (
                <div
                  key={s}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--deep)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--muted)",
                  }}
                >
                  {s[0]}
                </div>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <div
                className="syne"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--white)",
                  marginBottom: "1rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {col.title}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      fontSize: 14,
                      color: "var(--muted)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--muted)")
                    }
                  >
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            © 2025 Intellecta. All rights reserved.
          </span>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            Built for the relentlessly curious.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─── APP ───────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ background: "var(--void)", minHeight: "100vh" }}>
      <GlobalStyles />
      <Navbar />
      <Hero />
      <Ticker />
      <Features />
      <HowItWorks />
      <StatsBanner />s
      <WhyIntellecta />
      <Testimonials />
      <Pricing />
      <CtaSection />
      <Footer />
    </div>
  );
}
