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
    <div className="fixed inset-0 bg-navy-900 flex flex-col overflow-y-auto">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10
            ${isDraw ? 'bg-gray-400' : iWon ? 'bg-teal-400' : 'bg-red-500'}`}
        />
      </div>

      <div className="relative flex flex-col items-center px-4 pt-10 pb-8 min-h-full max-w-md mx-auto w-full">

        {/* Big symbol + result */}
        <div className="flex flex-col items-center mb-6">
          {isDraw ? (
            <div className="text-7xl font-black text-white/20 mb-4 animate-bounce-in">
              ½
            </div>
          ) : (
            <div
              className={`
                text-8xl font-black mb-4 animate-bounce-in
                ${iWon ? 'text-teal-400 drop-shadow-[0_0_30px_rgba(0,206,201,0.5)]' : 'text-white/30'}
              `}
            >
              {winnerSymbol === 'X' ? '✕' : '○'}
            </div>
          )}

          <h1
            className={`text-4xl font-black tracking-tight mb-2 ${
              isDraw
                ? 'text-white/60'
                : iWon
                  ? 'text-teal-400'
                  : 'text-white/60'
            }`}
          >
            {isDraw ? 'DRAW!' : iWon ? 'WINNER!' : 'DEFEAT'}
          </h1>

          {!isDraw && winnerName && (
            <p className="text-white/50 text-sm mb-4">
              {iWon ? 'Congratulations!' : `${winnerName} wins`}
            </p>
          )}
          {isDraw && (
            <p className="text-white/50 text-sm mb-4">Well played, both of you!</p>
          )}

          {/* Points badge */}
          <div
            className={`
              inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-lg
              ${pointsEarned > 0
                ? 'bg-teal-500/20 border border-teal-500/40 text-teal-400'
                : 'bg-white/5 border border-white/10 text-white/40'}
            `}
          >
            <span className="text-lg">★</span>
            <span>
              {pointsEarned > 0 ? `+${pointsEarned} pts` : '+0 pts'}
            </span>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="w-full bg-navy-800 border border-white/10 rounded-2xl overflow-hidden mb-6">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
            <span className="text-teal-400 text-lg">🏆</span>
            <h2 className="font-bold text-white text-lg">Leaderboard</h2>
            <span className="ml-auto text-white/30 text-xs">Top 10</span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_3rem_3rem_3rem_4rem] gap-1 px-4 py-2 text-white/30 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
            <span>#</span>
            <span>Player</span>
            <span className="text-center">W</span>
            <span className="text-center">L</span>
            <span className="text-center">D</span>
            <span className="text-right">Score</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-sm">
              Loading leaderboard...
            </div>
          ) : (
            leaderboard.map((entry, i) => {
              const isMe = entry.userId === myUserId;
              return (
                <div
                  key={entry.userId || i}
                  className={`
                    grid grid-cols-[2rem_1fr_3rem_3rem_3rem_4rem] gap-1 px-4 py-2.5
                    text-sm transition-colors
                    ${isMe
                      ? 'bg-teal-500/10 border-l-2 border-teal-500 text-white'
                      : 'border-b border-white/5 text-white/70 hover:bg-white/3'}
                    ${i === 0 ? 'text-yellow-400' : ''}
                  `}
                >
                  <span className={`font-bold ${i === 0 ? 'text-yellow-400' : 'text-white/40'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.rank}
                  </span>
                  <span className={`font-medium truncate ${isMe ? 'text-teal-300 font-bold' : ''}`}>
                    {isMe ? `${myNickname} (you)` : entry.username}
                  </span>
                  <span className="text-center text-green-400 font-semibold">{entry.wins}</span>
                  <span className="text-center text-red-400/80 font-semibold">{entry.losses}</span>
                  <span className="text-center text-yellow-400/80 font-semibold">{entry.draws}</span>
                  <span className="text-right font-bold text-teal-400">{entry.score}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Play Again */}
        <button
          id="play-again-btn"
          onClick={onPlayAgain}
          className="
            w-full py-4 rounded-xl font-bold text-base
            border-2 border-teal-500/50 text-teal-400
            hover:bg-teal-500/10 hover:border-teal-400
            transition-all duration-200
            hover:scale-[1.01] active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-teal-500/30
          "
        >
          ↺ Play Again
        </button>
      </div>
    </div>
  );
};
