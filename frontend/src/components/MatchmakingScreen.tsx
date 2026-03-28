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


  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dots = '.'.repeat(dotCount);

  return (
    <div className="fixed inset-0 bg-ebony-950 flex flex-col items-center justify-center p-6">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bumble-500 rounded-full opacity-[0.03] blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative flex flex-col items-center gap-10 max-w-sm w-full text-center">

        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-bumble-500/20" />
          <div className="absolute inset-0 rounded-full border border-bumble-500/60 animate-pulseRing" />
          <div className="absolute inset-2 rounded-full border border-bumble-500/40 animate-pulseRing" style={{ animationDelay: '0.5s' }} />

          <div className="relative z-10 w-16 h-16 rounded-full bg-ebony-900 border border-white/5 shadow-2xl flex items-center justify-center backdrop-blur-md">
            <span className="text-xl font-black text-bumble-500 tracking-wider">VS</span>
          </div>
        </div>


        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Finding opponent<span className="text-bumble-500">{dots}</span>
          </h2>
          <p className="mt-3 font-medium text-white/40 text-sm">
            {statusMessage || `Searching for ${elapsed}s`}
          </p>
        </div>


        <div className="w-full bg-ebony-900/50 border border-white/5 rounded-2xl px-6 py-5 text-sm text-white/50 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-ebony-950 border border-white/5 shadow-inner flex items-center justify-center text-bumble-500 font-black text-lg">
              X
            </div>
            <span className="text-white/20 font-bold text-xs uppercase tracking-widest">VS</span>
            <div className="w-10 h-10 rounded-xl bg-ebony-950 border border-white/5 shadow-inner flex items-center justify-center text-white font-black text-lg">
              O
            </div>
          </div>
          <p className="text-xs font-medium tracking-wide">Server-authoritative • 30s turn timer</p>
        </div>


        <button
          id="cancel-matchmaking-btn"
          onClick={onCancel}
          className="
            px-8 py-3 rounded-xl font-bold text-sm tracking-wide
            bg-ebony-800 border border-white/5 text-white/60
            hover:bg-ebony-700 hover:text-white
            transition-all duration-300 shadow-lg
            focus:outline-none focus:ring-2 focus:ring-white/10
          "
        >
          Cancel Search
        </button>
      </div>
    </div>
  );
};
