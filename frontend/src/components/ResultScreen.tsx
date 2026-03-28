import React, { useEffect } from 'react';
import { LeaderboardEntry } from '../types/game';

interface ResultScreenProps {
  winner: string | null;        // userId or "draw"
  winnerName: string | null;
  myUserId: string;
  myNickname: string;
  pointsEarned: number;
  leaderboard: LeaderboardEntry[];
  onPlayAgain: () => void;
  onFetchLeaderboard: () => void;
  players: { [userId: string]: { symbol: string; username: string; score: number } };
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  winner,
  winnerName,
  myUserId,
  myNickname,
  pointsEarned,
  leaderboard,
  onPlayAgain,
  onFetchLeaderboard,
  players,
}) => {
  const isDraw = winner === 'draw';
  const iWon = !isDraw && winner === myUserId;

  const myInfo = players[myUserId];
  const winnerSymbol = isDraw ? null : (myInfo?.symbol ?? 'X');

  useEffect(() => {
    onFetchLeaderboard();
  }, [onFetchLeaderboard]);

  return (
    <div className="fixed inset-0 bg-ebony-950 flex flex-col justify-center overflow-hidden">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[80px] opacity-[0.12]
            ${isDraw ? 'bg-neutral-500' : iWon ? 'bg-bumble-500' : 'bg-crimson-500'}`}
        />
      </div>

      <div className="relative flex flex-col items-center px-4 py-6 max-h-[100dvh] max-w-md mx-auto w-full h-full">


        <div className="flex flex-col items-center mb-4 flex-shrink-0">
          {isDraw ? (
            <div className="text-6xl font-black text-white/10 mb-3 animate-bounce-in drop-shadow-xl">
              ½
            </div>
          ) : (
            <div
              className={`
                text-7xl font-black mb-3 animate-bounce-in
                ${iWon ? 'text-bumble-500 drop-shadow-[0_0_30px_rgba(255,208,0,0.4)]' : 'text-crimson-500/80 drop-shadow-[0_0_20px_rgba(255,77,79,0.3)]'}
              `}
            >
              {winnerSymbol === 'X' ? '✕' : '○'}
            </div>
          )}

          <h1
            className={`text-4xl font-black tracking-tighter mb-1 ${
              isDraw
                ? 'text-white/60'
                : iWon
                  ? 'text-bumble-500'
                  : 'text-crimson-400'
            }`}
          >
            {isDraw ? 'DRAW!' : iWon ? 'VICTORY' : 'DEFEAT'}
          </h1>

          {!isDraw && winnerName && (
            <p className="text-white/50 text-sm font-medium tracking-wide mb-4">
              {iWon ? 'Outstanding performance!' : `${winnerName} takes the win`}
            </p>
          )}
          {isDraw && (
            <p className="text-white/50 text-sm font-medium tracking-wide mb-4">A perfectly matched game.</p>
          )}


          <div
            className={`
              inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-base shadow-inner border
              ${pointsEarned > 0
                ? 'bg-bumble-500/10 border-bumble-500/30 text-bumble-400 shadow-[0_0_15px_rgba(255,208,0,0.1)]'
                : 'bg-ebony-800/50 border-white/5 text-white/40'}
            `}
          >
            <span className="text-lg leading-none">★</span>
            <span className="leading-none">
              {pointsEarned > 0 ? `+${pointsEarned} pts` : '+0 pts'}
            </span>
          </div>
        </div>


        <div className="w-full bg-ebony-900 border border-white/5 rounded-3xl shadow-2xl overflow-hidden mb-auto backdrop-blur-xl flex flex-col max-h-[315px]">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 bg-ebony-950/50">
            <span className="text-bumble-500 text-xl drop-shadow-[0_0_5px_rgba(255,208,0,0.5)]">🏆</span>
            <h2 className="font-black tracking-wide text-white text-lg">LEADERBOARD</h2>
            <span className="ml-auto text-white/30 text-[10px] font-bold uppercase tracking-widest">Global Top 5</span>
          </div>


          <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_3.5rem] gap-2 px-5 py-3 text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5 bg-ebony-900/50">
            <span>#</span>
            <span>Player</span>
            <span className="text-center">W</span>
            <span className="text-center">L</span>
            <span className="text-center">D</span>
            <span className="text-right">Pts</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-5 h-5 border-2 border-bumble-500/20 border-t-bumble-500 rounded-full animate-spin mb-2"></div>
              <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Loading...</span>
            </div>
          ) : (
            <div className="py-1 flex flex-col justify-start">
              {leaderboard.map((entry, i) => {
                const isMe = entry.userId === myUserId;
                return (
                  <div
                    key={entry.userId || i}
                    className={`
                      grid grid-cols-[1.5rem_1fr_2.5rem_2.5rem_2.5rem_3.5rem] gap-2 px-4 py-2 text-sm transition-all duration-200 group h-10 items-center
                      ${isMe
                        ? 'bg-bumble-500/5 border-l-2 border-bumble-500 text-white'
                        : 'border-b border-white/[0.02] text-white/70 hover:bg-white-[0.02] last:border-0'}
                    `}
                  >
                    <span className="font-black text-white/20 flex items-center">
                      <span className="text-lg"> {entry.rank}</span>
                    </span>
                    <span className={`font-semibold truncate flex items-center ${isMe ? 'text-bumble-400' : 'text-white/80'}`}>
                      {isMe ? `${myNickname} (You)` : entry.username}
                    </span>
                    <span className="flex items-center justify-center text-green-400/80 font-bold text-xs">{entry.wins}</span>
                    <span className="flex items-center justify-center text-crimson-400/80 font-bold text-xs">{entry.losses}</span>
                    <span className="flex items-center justify-center text-neutral-400/80 font-bold text-xs">{entry.draws}</span>
                    <span className="flex items-center justify-end font-black text-bumble-400">{entry.score}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        <button
          id="play-again-btn"
          onClick={onPlayAgain}
          className="
            mt-auto w-full py-5 rounded-xl font-black text-lg tracking-wide shadow-2xl
            bg-bumble-500 text-ebony-950 flex-shrink-0
            hover:bg-bumble-400 hover:shadow-[0_0_30px_rgba(255,183,0,0.4)]
            transition-all duration-300
            hover:scale-[1.02] active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-bumble-500/50
          "
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};
