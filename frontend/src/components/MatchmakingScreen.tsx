import React, { useEffect, useState } from 'react';

interface MatchmakingScreenProps {
  onCancel: () => void;
  statusMessage?: string;
}

export const MatchmakingScreen: React.FC<MatchmakingScreenProps> = ({
  onCancel,
  statusMessage,
}) => {
  const [dotCount, setDotCount] = useState(1);
  const [elapsed, setElapsed] = useState(0);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dots = '.'.repeat(dotCount);

  return (
    <div className="fixed inset-0 bg-navy-900 flex flex-col items-center justify-center p-6">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500 rounded-full opacity-[0.04] blur-3xl animate-pulse-slow" />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,206,201,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,206,201,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative flex flex-col items-center gap-8 max-w-sm w-full text-center">
        {/* Animated spinner ring */}
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-400 animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-teal-500/60 animate-spin [animation-duration:1.5s]" />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-black text-teal-400">vs</span>
          </div>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            Finding a random player{dots}
          </h2>
          <p className="mt-2 text-white/40 text-sm">
            {statusMessage || `Searching for ${elapsed}s • Usually takes a few seconds`}
          </p>
        </div>

        {/* Pulsing orbs */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Info card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
              X
            </div>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 font-medium text-xs">VS</span>
            <div className="flex-1 h-px bg-white/10" />
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
              O
            </div>
          </div>
          <p>Server-authoritative • 30s turn timer • Live leaderboard</p>
        </div>

        {/* Cancel button */}
        <button
          id="cancel-matchmaking-btn"
          onClick={onCancel}
          className="
            px-8 py-2.5 rounded-xl font-semibold text-sm
            border border-white/20 text-white/70
            hover:bg-white/5 hover:border-white/30 hover:text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-white/20
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
