import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/StudentSidebar";
import { getReviewQueue, flagForReview } from "../../services/notesService";

export default function LightReview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        // Use dedicated review-queue endpoint — returns full NoteResponse with content field
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

  const handleReviewLater = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleGotIt = async () => {
    const item = reviewQueue[currentIndex];
    if (!item) return;
    setRemovingId(item.id);
    try {
      // Unflag from review so it no longer appears in the queue
      await flagForReview(item.id);
    } catch (err) {
      console.error("Failed to mark item as reviewed:", err);
    } finally {
      setRemovingId(null);
    }
    // Remove from local list and advance
    setReviewQueue(prev => prev.filter(i => i.id !== item.id));
    setIsFlipped(false);
    // currentIndex stays the same — the next card slides into that position
  };

  const currentItem = reviewQueue[currentIndex];
  const isFinished = !loading && (reviewQueue.length === 0 || currentIndex >= reviewQueue.length);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar />
      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 px-12 py-10 flex flex-col gap-8 items-center">

          {/* Header */}
          <div className="w-full max-w-3xl flex items-center justify-between">
            <div>
              <h1 className="font-['Manrope',sans-serif] font-extrabold text-4xl tracking-[-1px] text-[#161c27]">
                Light Review
              </h1>
              <p className="text-[#484554] text-sm mt-1">
                Flip each card to recall — mark "Got It" to remove it from your queue.
              </p>
            </div>
            <button
              onClick={() => navigate('/studentDashboard')}
              className="text-[#451ebb] font-bold text-sm hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="w-full max-w-3xl h-64 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#e6deff] border-t-[#451ebb] animate-spin" />
                <p className="text-gray-400 font-medium">Loading flashcards...</p>
              </div>
            </div>

          ) : isFinished ? (
            /* All done */
            <div className="w-full max-w-3xl bg-white rounded-3xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-24 h-24 bg-[#e6deff] rounded-full flex items-center justify-center">
                <span className="text-4xl">🎉</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#161c27] mb-2">All caught up!</h2>
                <p className="text-[#484554]">You've reviewed all your flagged items.</p>
              </div>
              <button
                onClick={() => navigate('/studentDashboard')}
                className="mt-4 px-8 py-3 bg-[#451ebb] text-white font-bold rounded-2xl hover:bg-[#5d3fd3] transition-colors"
              >
                Return to Dashboard
              </button>
            </div>

          ) : (
            <div className="w-full max-w-3xl flex flex-col gap-6 mt-4">

              {/* Progress bar */}
              <div className="flex items-center justify-between px-2">
                <span className="text-[#484554] text-sm font-bold uppercase tracking-wider">
                  Card {currentIndex + 1} of {reviewQueue.length}
                </span>
                <div className="flex-1 max-w-[200px] h-2 bg-[#e6deff] rounded-full ml-4 overflow-hidden">
                  <div
                    className="h-full bg-[#451ebb] transition-all duration-500"
                    style={{ width: `${(currentIndex / reviewQueue.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Flashcard */}
              <div
                onClick={() => !isFlipped && setIsFlipped(true)}
                className={`w-full bg-white rounded-3xl p-10 shadow-lg border-2 transition-all duration-300 cursor-pointer flex flex-col justify-center items-center text-center gap-6 ${
                  isFlipped ? 'border-[#451ebb]' : 'border-transparent hover:border-[#e6deff]'
                }`}
                style={{ minHeight: '200px', maxHeight: '480px' }}
              >
                {/* Title always visible */}
                <h2 className="text-3xl font-bold text-[#161c27] leading-tight flex-shrink-0">
                  {currentItem.title}
                </h2>

                {isFlipped ? (
                  <div className="flex flex-col items-center gap-4 w-full overflow-hidden">
                    <div className="w-16 h-[2px] bg-[#e6deff] rounded-full flex-shrink-0" />
                    <div className="overflow-y-auto max-h-56 w-full px-2">
                      <p className="text-lg text-[#484554] leading-relaxed whitespace-pre-wrap text-center">
                        {currentItem.content && currentItem.content.trim()
                          ? currentItem.content
                          : "No notes written for this item."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#451ebb] font-medium mt-2 animate-pulse select-none flex-shrink-0">
                    Click to reveal notes
                  </p>
                )}
              </div>

              {/* Action buttons — only visible after flip */}
              <div
                className={`flex gap-4 w-full transition-all duration-300 ${
                  isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-2'
                }`}
              >
                <button
                  onClick={handleReviewLater}
                  className="flex-1 py-4 bg-white text-[#484554] font-bold rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  Review Later
                </button>
                <button
                  onClick={handleGotIt}
                  disabled={removingId === currentItem?.id}
                  className="flex-1 py-4 bg-[#451ebb] text-white font-bold rounded-2xl shadow-md hover:bg-[#5d3fd3] transition-colors disabled:opacity-60"
                >
                  {removingId === currentItem?.id ? "Saving..." : "Got It ✓"}
                </button>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
