import React, { useState } from 'react';
import { PlayerSymbol } from '../types/game';

interface GameBoardProps {
  board: Array<string | null>;
  currentTurn: string;
  myUserId: string;
  mySymbol: PlayerSymbol | null;
  opponentName: string;
  myNickname: string;
  timeRemaining: number;
  onMove: (position: number) => void;
  onLeave: () => void;
}

const SymbolDisplay: React.FC<{ symbol: string | null; size?: 'sm' | 'lg' }> = ({
  symbol,
  size = 'lg',
}) => {
  const sizeClass = size === 'lg' ? 'text-5xl' : 'text-2xl';
  if (!symbol) return null;
  if (symbol === 'X') {
    return (
      <span
        className={`${sizeClass} font-black text-white drop-shadow-lg animate-bounce-in`}
      >
        ✕
      </span>
    );
  }
  return (
    <span
      className={`${sizeClass} font-black text-navy-900 drop-shadow-lg animate-bounce-in`}
    >
      ○
    </span>
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentTurn,
  myUserId,
  mySymbol,
  opponentName,
  myNickname,
  timeRemaining,
  onMove,
  onLeave,
}) => {
  const [movingCell, setMovingCell] = useState<number | null>(null);
  const isMyTurn = currentTurn === myUserId;
  const timerDanger = timeRemaining <= 10;
  const timerWarning = timeRemaining <= 20 && timeRemaining > 10;

  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] !== null || movingCell !== null) return;
    setMovingCell(index);
    onMove(index);
    setTimeout(() => setMovingCell(null), 500);
  };

  const formatTime = (s: number) => `0:${String(s).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-teal-400 to-teal-500 flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 px-4 pt-safe-top pt-6 pb-4">
        {/* Players row */}
        <div className="flex items-center justify-between mb-4">
          {/* Me */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex-1 max-w-[45%]">
            <div className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center text-navy-900 font-black text-sm">
              {mySymbol ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-white/60 text-xs font-medium leading-none">You</p>
              <p className="text-white font-bold text-sm truncate leading-tight mt-0.5">
                {myNickname}
              </p>
            </div>
          </div>

          {/* Center timer */}
          <div className="flex flex-col items-center px-3">
            <div
              className={`
                text-2xl font-black tabular-nums transition-colors duration-300
                ${timerDanger ? 'text-red-300 animate-pulse' : timerWarning ? 'text-yellow-200' : 'text-white'}
              `}
            >
              {formatTime(timeRemaining)}
            </div>
            <div className="text-white/50 text-xs font-medium">
              {isMyTurn ? '⬆ your turn' : '⬇ their turn'}
            </div>
          </div>

          {/* Opponent */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex-1 max-w-[45%] flex-row-reverse">
            <div className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center text-navy-900 font-black text-sm">
              {mySymbol === 'X' ? 'O' : 'X'}
            </div>
            <div className="min-w-0 text-right">
              <p className="text-white/60 text-xs font-medium leading-none">Opp</p>
              <p className="text-white font-bold text-sm truncate leading-tight mt-0.5">
                {opponentName}
              </p>
            </div>
          </div>
        </div>

        {/* Turn indicator pill */}
        <div className="flex justify-center">
          <div
            className={`
              inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
              transition-all duration-300
              ${isMyTurn
                ? 'bg-white text-navy-900 shadow-lg shadow-black/20'
                : 'bg-white/20 text-white/80'}
            `}
          >
            <span>{isMyTurn ? (mySymbol === 'X' ? '✕' : '○') : (mySymbol === 'X' ? '○' : '✕')}</span>
            <span>{isMyTurn ? 'Your turn' : `${opponentName}'s turn`}</span>
          </div>
        </div>
      </div>

      {/* Board — centered, with equal padding */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xs aspect-square">
          <div className="grid grid-cols-3 gap-2 h-full">
            {board.map((cell, index) => {
              const clickable = isMyTurn && cell === null;
              const isMoving = movingCell === index;

              return (
                <button
                  key={index}
                  id={`cell-${index}`}
                  onClick={() => handleCellClick(index)}
                  disabled={!clickable}
                  className={`
                    relative flex items-center justify-center
                    rounded-2xl aspect-square
                    transition-all duration-150
                    ${cell
                      ? 'bg-white/30 backdrop-blur-sm cursor-default'
                      : clickable
                        ? 'bg-white/20 hover:bg-white/35 hover:scale-[1.03] active:scale-[0.97] cursor-pointer'
                        : 'bg-white/10 cursor-not-allowed'
                    }
                    ${isMoving ? 'scale-95' : ''}
                    border-2 ${cell ? 'border-white/20' : clickable ? 'border-white/30 hover:border-white/50' : 'border-white/10'}
                    shadow-inner
                  `}
                >
                  {cell && <SymbolDisplay symbol={cell} />}

                  {/* Hover hint */}
                  {clickable && !cell && (
                    <span className="absolute inset-0 flex items-center justify-center text-white/20 text-3xl font-black opacity-0 hover:opacity-100 transition-opacity duration-150">
                      {mySymbol === 'X' ? '✕' : '○'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 flex justify-center pb-safe-bottom pb-6 pt-4 px-4">
        <button
          id="leave-match-btn"
          onClick={onLeave}
          className="
            px-6 py-2 rounded-xl text-sm font-medium
            bg-black/20 text-white/60 border border-white/10
            hover:bg-black/30 hover:text-white/80
            transition-all duration-200
            focus:outline-none
          "
        >
          Leave match ↩
        </button>
      </div>
    </div>
  );
};
