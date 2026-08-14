import { useEffect, useRef, useState } from "react";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";

// ── Added own YouTube video IDs here ──────────────────────────────────────
const LOFI_TRACKS = [
  { name: "Calming Lofi",        mood: "Chill & Calm",   videoId: "9kzE8isXlQY" },
  { name: "Nasheed",   mood: "Relaxed Focus",  videoId: "nWPnLX0deGw" },
  { name: "Late Night Study", mood: "Deep Work",      videoId: "DEWzT1geuPU" },
  { name: "Rainy Day",       mood: "chill",          videoId: "D4VpVRtbx7w"},
  
];
// ─────────────────────────────────────────────────────────────────────────────

export default function LofiPlayer({ isSessionActive }) {
  const playerRef    = useRef(null);
  const containerRef = useRef(null);
  const [isReady,   setIsReady]   = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume,    setVolume]    = useState(100);
  const [selected,  setSelected]  = useState(null);
  const [isMuted,   setIsMuted]   = useState(false);

  // ── Load YouTube IFrame API once ──────────────────────────────────────────
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }
    if (!document.getElementById("yt-iframe-api")) {
      const tag   = document.createElement("script");
      tag.id      = "yt-iframe-api";
      tag.src     = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => initPlayer();
    return () => { window.onYouTubeIframeAPIReady = null; };
  }, []);

  const initPlayer = () => {
    if (!containerRef.current || playerRef.current) return;
    playerRef.current = new window.YT.Player(containerRef.current, {
      height: "0",
      width:  "0",
      videoId: "",
      playerVars: {
        autoplay:    0,
        controls:    0,
        loop:        1,
        playsinline: 1,
        origin:      window.location.origin,   // ← fixes postMessage CORS error
      },
      events: {
        onReady: () => {
          setIsReady(true);
          playerRef.current.setVolume(100);
        },
        onStateChange: (e) => {
          setIsPlaying(e.data === 1);
          if (e.data === 0) { // YT.PlayerState.ENDED
            playerRef.current.playVideo();
          }
        },
      },
    });
  };

  // ── Auto play/pause with Pomodoro timer ──────────────────────────────────
  useEffect(() => {
    if (!isReady || !playerRef.current || selected === null) return;
    isSessionActive
      ? playerRef.current.playVideo()
      : playerRef.current.pauseVideo();
  }, [isSessionActive, isReady, selected]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const handleSelect = (index) => {
    if (!isReady || !playerRef.current) return;
    setSelected(index);
    playerRef.current.loadVideoById(LOFI_TRACKS[index].videoId);
    playerRef.current.setVolume(isMuted ? 0 : volume);
    playerRef.current.playVideo();
  };

  const togglePlay = () => {
    if (!isReady || selected === null) return;
    isPlaying
      ? playerRef.current.pauseVideo()
      : playerRef.current.playVideo();
  };

  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    playerRef.current?.setVolume(val);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.setVolume(volume || 100);
      setIsMuted(false);
    } else {
      playerRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="group relative inline-block">
      {/* Hidden YT iframe — required by YouTube ToS */}
      <div ref={containerRef} className="hidden" />

      {/* Hover Dropdown Menu */}
      <div className="absolute bottom-full left-0 pb-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
        <div className="flex flex-col gap-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-1">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <Music size={13} className={`text-white/80 ${isPlaying ? "animate-pulse" : ""}`} />
            </div>
            <p className="text-xs font-bold text-white/80 tracking-widest uppercase">Lofi Music</p>
            {isPlaying && (
              <div className="ml-auto flex items-end gap-[2px] h-4">
                {[1, 2, 3].map((b) => (
                  <div
                    key={b}
                    className="w-[3px] rounded-full bg-indigo-400"
                    style={{
                      height: `${40 + b * 20}%`,
                      animation: `barBounce ${0.6 + b * 0.15}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Track list */}
          <div className="flex flex-col gap-1 px-3">
            {LOFI_TRACKS.map((track, i) => (
              <button
                key={track.videoId}
                onClick={() => handleSelect(i)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 border ${
                  selected === i
                    ? "bg-white/20 border-white/40 text-white"
                    : "bg-transparent border-transparent text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold leading-none mb-0.5">{track.name}</p>
                  <p className="text-[10px] opacity-70 uppercase tracking-wider">{track.mood}</p>
                </div>
                {selected === i && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    {isPlaying
                      ? <Pause size={10} fill="currentColor" className="text-white" />
                      : <Play  size={10} fill="currentColor" className="text-white ml-[1px]" />
                    }
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Prompt when nothing is selected */}
          {selected === null && (
            <p className="text-[10px] text-white/40 text-center pb-3 tracking-wide">
              Pick a track to start
            </p>
          )}

          {/* Controls row — visible only after selection */}
          {selected !== null && (
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/20 bg-white/10">
              <button
                onClick={togglePlay}
                disabled={!isReady}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all disabled:opacity-30 shrink-0 shadow-sm"
              >
                {isPlaying
                  ? <Pause size={13} fill="currentColor" />
                  : <Play  size={13} fill="currentColor" className="ml-[1px]" />
                }
              </button>

              {/* Volume */}
              <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors shrink-0">
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="flex-1 h-1 accent-white/80 cursor-pointer bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Button Trigger */}
      <button className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.2)] border border-white/20 hover:border-white/40 font-bold text-sm tracking-widest uppercase hover:-translate-y-1">
        <Music size={18} className={`mr-2 animate-pulse ${isPlaying ? "text-indigo-300" : "text-white opacity-80"}`} />
        Lofi Music
      </button>

      {/* Equaliser bar animation */}
      <style>{`
        @keyframes barBounce {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1);   }
        }
      `}</style>
    </div>
  );
}
