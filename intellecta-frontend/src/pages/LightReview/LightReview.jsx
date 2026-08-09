import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import { getReviewQueue, flagForReview } from "../../services/notesService";

/* ─── Inline styles for 3-D flip ──────────────────────────────────── */
const styles = `
  .lr-scene {
    perspective: 1200px;
    width: 100%;
    max-width: 680px;
  }
  .lr-card {
    position: relative;
    width: 100%;
    min-height: 360px;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.4, 0.2, 0.2, 1);
    cursor: pointer;
  }
  .lr-card.flipped {
    transform: rotateY(180deg);
    cursor: default;
  }
  .lr-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 28px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .lr-back {
    transform: rotateY(180deg);
  }
  /* Rich HTML content inside card back */
  .lr-content img {
    max-width: 100%;
    border-radius: 12px;
    margin: 8px 0;
    display: block;
  }
  .lr-content b, .lr-content strong { font-weight: 700; }
  .lr-content i, .lr-content em { font-style: italic; }
  .lr-content br { display: block; margin: 2px 0; }

  @keyframes lr-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes lr-pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(69, 30, 187, 0.35); }
    70% { box-shadow: 0 0 0 14px rgba(69, 30, 187, 0); }
    100% { box-shadow: 0 0 0 0 rgba(69, 30, 187, 0); }
  }
  @keyframes lr-confetti {
    0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(80px) rotate(720deg); opacity: 0; }
  }
  .lr-confetti-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: lr-confetti 1.2s ease-out forwards;
  }
`;

/* ─── Card-number badge colours (cycles) ─────────────────────────── */
const ACCENT_COLORS = [
  { from: "#451ebb", to: "#7c5fe6" },
  { from: "#0ea5e9", to: "#38bdf8" },
  { from: "#10b981", to: "#34d399" },
  { from: "#f59e0b", to: "#fbbf24" },
  { from: "#ec4899", to: "#f472b6" },
];

/* ─── Confetti burst ────────────────────────────────────────────── */
function ConfettiBurst() {
  const dots = Array.from({ length: 14 }, (_, i) => ({
    color: ["#451ebb", "#7c5fe6", "#f59e0b", "#10b981", "#ec4899", "#0ea5e9"][i % 6],
    left: `${10 + i * 6}%`,
    delay: `${(i * 0.07).toFixed(2)}s`,
    size: `${8 + (i % 3) * 4}px`,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {dots.map((d, i) => (
        <div
          key={i}
          className="lr-confetti-dot"
          style={{
            background: d.color,
            left: d.left,
            top: "30%",
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function LightReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await getReviewQueue();
        setReviewQueue(res.data || []);
      } catch (err) {
        console.error("Failed to load review queue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleFlip = () => {
    if (!isFlipped) setIsFlipped(true);
  };

  const handleReviewLater = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
  };

  const handleGotIt = async () => {
    const item = reviewQueue[currentIndex];
    if (!item) return;
    setRemovingId(item.id);
    try {
      await flagForReview(item.id);
    } catch (err) {
      console.error("Failed to mark item as reviewed:", err);
    } finally {
      setRemovingId(null);
    }
    const newQueue = reviewQueue.filter(i => i.id !== item.id);
    setIsFlipped(false);
    setTimeout(() => {
      setReviewQueue(newQueue);
      if (newQueue.length === 0) setShowConfetti(true);
    }, 350);
  };

  const currentItem = reviewQueue[currentIndex];
  const isFinished = !loading && (reviewQueue.length === 0 || currentIndex >= reviewQueue.length);
  const accent = ACCENT_COLORS[currentIndex % ACCENT_COLORS.length];
  const progressPct = reviewQueue.length > 0 ? (currentIndex / reviewQueue.length) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <style>{styles}</style>
      <Navbar />
      <div
        className="bg-[#faf9ff]"
        style={{
          minHeight: "100vh",
          display: "flex",
          width: "100%",
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2.5rem 3rem",
            gap: "2rem",
          }}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div style={{ width: "100%", maxWidth: 680, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 800,
                  fontSize: "2rem",
                  letterSpacing: "-0.04em",
                  color: "#161c27",
                  lineHeight: 1.1,
                }}
              >
                Light Review
              </h1>
              <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                Flip each card · mark <strong>Got It</strong> to clear it from your queue
              </p>
            </div>
            <button
              onClick={() => navigate("/studentDashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#451ebb",
                fontWeight: 700,
                fontSize: 13,
                background: "rgba(69,30,187,0.08)",
                border: "none",
                borderRadius: 12,
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              ← Dashboard
            </button>
          </div>

          {/* ── Loading ─────────────────────────────────────────── */}
          {loading ? (
            <div
              className="neu"
              style={{
                width: "100%",
                maxWidth: 680,
                minHeight: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "4px solid #e6deff",
                  borderTopColor: "#451ebb",
                  animation: "spin 0.9s linear infinite",
                }}
              />
              <p style={{ color: "#9ca3af", fontWeight: 600 }}>Loading flashcards…</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>

          ) : isFinished ? (
            /* ── All done ────────────────────────────────────────── */
            <div
              className="neu"
              style={{
                width: "100%",
                maxWidth: 680,
                padding: "4rem 3rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 24,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {showConfetti && <ConfettiBurst />}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#451ebb,#7c5fe6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  boxShadow: "0 12px 36px rgba(69,30,187,0.3)",
                  animation: "lr-float 3s ease-in-out infinite",
                }}
              >
                🎉
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Manrope',sans-serif",
                    fontWeight: 800,
                    fontSize: "1.8rem",
                    color: "#161c27",
                    marginBottom: 8,
                  }}
                >
                  All caught up!
                </h2>
                <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.6 }}>
                  You've reviewed all your flagged items.<br />
                  Come back after your next study session.
                </p>
              </div>
              <button
                onClick={() => navigate("/studentDashboard")}
                className="btn-primary"
                style={{
                  marginTop: 8,
                  padding: "14px 36px",
                  fontWeight: 700,
                  fontSize: 15,
                  animation: "lr-pulse-ring 2.5s ease-in-out infinite",
                }}
              >
                Return to Dashboard
              </button>
            </div>

          ) : (
            <div
              style={{
                width: "100%",
                maxWidth: 680,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* ── Progress row ──────────────────────────────────── */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    background: `linear-gradient(135deg,${accent.from},${accent.to})`,
                    color: "white",
                    fontWeight: 800,
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 100,
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                    boxShadow: `0 4px 12px ${accent.from}44`,
                  }}
                >
                  {currentIndex + 1} / {reviewQueue.length}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: "rgba(69,30,187,0.12)",
                    borderRadius: 100,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      background: `linear-gradient(90deg,${accent.from},${accent.to})`,
                      borderRadius: 100,
                      transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {reviewQueue.length - currentIndex - 1} remaining
                </span>
              </div>

              {/* ── 3-D Flashcard ────────────────────────────────── */}
              <div className="lr-scene" style={{ alignSelf: "center" }}>
                <div
                  className={`lr-card ${isFlipped ? "flipped" : ""}`}
                  onClick={handleFlip}
                >
                  {/* FRONT */}
                  <div
                    className="lr-face"
                    style={{
                      background: `linear-gradient(145deg, ${accent.from}, ${accent.to})`,
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "3rem 2.5rem",
                      boxShadow: `0 24px 60px ${accent.from}44`,
                    }}
                  >
                    {/* Decorative orbs */}
                    <div
                      style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: -30,
                        left: -30,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.07)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Card number top-right */}
                    <span
                      style={{
                        position: "absolute",
                        top: 20,
                        right: 24,
                        fontSize: 11,
                        fontWeight: 800,
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.06em",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      #{currentIndex + 1}
                    </span>

                    {/* Flashcard icon top-left */}
                    <span
                      style={{
                        position: "absolute",
                        top: 20,
                        left: 24,
                        fontSize: 18,
                        opacity: 0.6,
                      }}
                    >
                      🗂️
                    </span>

                    {/* Title */}
                    <h2
                      style={{
                        color: "white",
                        fontFamily: "'Manrope',sans-serif",
                        fontWeight: 800,
                        fontSize: "clamp(1.4rem, 3vw, 2rem)",
                        textAlign: "center",
                        lineHeight: 1.25,
                        letterSpacing: "-0.02em",
                        marginBottom: 24,
                        textShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {currentItem?.title}
                    </h2>

                    {/* Click hint */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(8px)",
                        borderRadius: 100,
                        padding: "8px 20px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: 14, opacity: 0.9 }}>👆</span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                        }}
                      >
                        Tap to reveal
                      </span>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="lr-face lr-back"
                    style={{
                      background: "rgba(255,255,255,0.97)",
                      backdropFilter: "blur(20px)",
                      boxShadow: `0 24px 60px ${accent.from}30`,
                      border: `2px solid ${accent.from}22`,
                      flexDirection: "column",
                    }}
                  >
                    {/* Back header stripe */}
                    <div
                      style={{
                        background: `linear-gradient(90deg,${accent.from},${accent.to})`,
                        padding: "14px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>📖</span>
                      <span
                        style={{
                          color: "white",
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {currentItem?.title}
                      </span>
                    </div>

                    {/* Content area */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "1.5rem 2rem",
                      }}
                    >
                      {currentItem?.content && currentItem.content.trim() ? (
                        <div
                          className="lr-content"
                          style={{
                            color: "#374151",
                            fontSize: 15,
                            lineHeight: 1.75,
                            fontFamily: "'Inter',sans-serif",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: currentItem.content,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            gap: 12,
                            opacity: 0.5,
                          }}
                        >
                          <span style={{ fontSize: 36 }}>📝</span>
                          <p
                            style={{
                              color: "#9ca3af",
                              fontSize: 14,
                              fontStyle: "italic",
                              textAlign: "center",
                            }}
                          >
                            No notes written for this card yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Action buttons ────────────────────────────────── */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  width: "100%",
                  maxWidth: 680,
                  transition: "opacity 0.3s, transform 0.3s",
                  opacity: isFlipped ? 1 : 0,
                  transform: isFlipped ? "translateY(0)" : "translateY(10px)",
                  pointerEvents: isFlipped ? "auto" : "none",
                }}
              >
                {/* Review Later */}
                <button
                  onClick={handleReviewLater}
                  style={{
                    flex: 1,
                    padding: "16px 0",
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(12px)",
                    border: "2px solid rgba(69,30,187,0.15)",
                    borderRadius: 18,
                    color: "#451ebb",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(69,30,187,0.06)";
                    e.currentTarget.style.borderColor = "rgba(69,30,187,0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.85)";
                    e.currentTarget.style.borderColor = "rgba(69,30,187,0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ fontSize: 16 }}>↩</span> Review Later
                </button>

                {/* Got It */}
                <button
                  onClick={handleGotIt}
                  disabled={removingId === currentItem?.id}
                  style={{
                    flex: 1,
                    padding: "16px 0",
                    background: `linear-gradient(135deg,${accent.from},${accent.to})`,
                    border: "none",
                    borderRadius: 18,
                    color: "white",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: removingId === currentItem?.id ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                    boxShadow: `0 8px 24px ${accent.from}44`,
                    opacity: removingId === currentItem?.id ? 0.7 : 1,
                  }}
                  onMouseEnter={e => {
                    if (removingId !== currentItem?.id) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 12px 32px ${accent.from}55`;
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${accent.from}44`;
                  }}
                >
                  {removingId === currentItem?.id ? (
                    <>⏳ Saving…</>
                  ) : (
                    <><span style={{ fontSize: 16 }}>✓</span> Got It!</>
                  )}
                </button>
              </div>

              {/* ── Flip hint (only pre-flip) ─────────────────────── */}
              {!isFlipped && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    animation: "lr-float 2.5s ease-in-out infinite",
                  }}
                >
                  Click the card to reveal your notes
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
