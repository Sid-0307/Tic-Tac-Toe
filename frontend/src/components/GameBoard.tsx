import React from 'react';
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
  const sizeClass = size === 'lg' ? 'text-6xl drop-shadow-[0_0_15px_rgba(255,208,0,0.5)]' : 'text-3xl';
  const sizeClassO = size === 'lg' ? 'text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-3xl';
  if (!symbol) return null;
  if (symbol === 'X') {
    return (
      <span className={`${sizeClass} font-black text-bumble-500 select-none`}>
        ✕
      </span>
    );
  }
  return (
    <span className={`${sizeClassO} font-black text-white select-none`}>
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
  const [optimisticMove, setOptimisticMove] = React.useState<number | null>(null);

  React.useEffect(() => {
    setOptimisticMove(null);
  }, [board, currentTurn]);

  const isMyTurn = currentTurn === myUserId && optimisticMove === null;
  const timerDanger = timeRemaining <= 10;
  const timerWarning = timeRemaining <= 20 && timeRemaining > 10;

  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] !== null) return;
    setOptimisticMove(index);
    onMove(index);
  };

  const formatTime = (s: number) => `0:${String(s).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-ebony-950 flex flex-col items-center">

      <div className="w-full max-w-md px-5 pt-safe-top pt-8 pb-4 flex flex-col gap-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3 bg-ebony-900 border border-white/5 rounded-2xl p-2.5 flex-1 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-ebony-950 shadow-inner flex items-center justify-center text-bumble-500 font-black text-lg">
              {mySymbol ?? '?'}
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold leading-none mb-1">You</p>
              <p className="text-white font-bold text-sm truncate leading-none">
                {myNickname}
              </p>
            </div>
          </div>


          <div className="flex flex-col items-center justify-center px-4 min-w-[5rem]">
            <div
              className={`
                text-3xl font-black tabular-nums tracking-tighter transition-colors duration-300
                ${timerDanger ? 'text-crimson-400 animate-pulse drop-shadow-[0_0_10px_rgba(255,77,79,0.5)]' : timerWarning ? 'text-bumble-400' : 'text-white'}
              `}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>


          <div className="flex items-center gap-3 bg-ebony-900 border border-white/5 rounded-2xl p-2.5 flex-1 shadow-lg flex-row-reverse">
            <div className={`w-10 h-10 rounded-xl bg-ebony-950 shadow-inner flex items-center justify-center font-black text-lg ${mySymbol === 'X' ? 'text-white' : 'text-bumble-500'}`}>
              {mySymbol === 'X' ? 'O' : 'X'}
            </div>
            <div className="min-w-0 pl-2 text-right">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold leading-none mb-1">Opponent</p>
              <p className="text-white font-bold text-sm truncate leading-none">
                {opponentName}
              </p>
            </div>
          </div>
        </div>


        <div className="flex justify-center">
          <div
            className={`
              inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide
              transition-all duration-300 border
              ${isMyTurn
                ? 'bg-bumble-500 border-bumble-400 text-ebony-950 shadow-[0_0_20px_rgba(255,183,0,0.3)]'
                : 'bg-ebony-900 border-white/5 text-white/50 shadow-lg'}
            `}
          >
            <span className="text-lg leading-none">{isMyTurn ? (mySymbol === 'X' ? '✕' : '○') : (mySymbol === 'X' ? '○' : '✕')}</span>
            <span>{isMyTurn ? 'Your turn to move' : `Waiting for ${opponentName}...`}</span>
          </div>
        </div>
      </div>


      <div className={`flex-1 flex flex-col items-center justify-center w-full max-w-md px-5 mt-2 mb-2 min-h-0 transition-all duration-300 ${!isMyTurn ? 'opacity-80 pointer-events-none' : 'opacity-100'}`}>
        <div className="w-full max-h-full aspect-square flex items-center justify-center">
          <div className={`grid grid-cols-3 gap-3 w-full h-full max-w-[400px] max-h-[400px] p-4 bg-ebony-900 border rounded-3xl transition-all duration-500 ${isMyTurn ? 'border-bumble-500/30 shadow-[0_0_40px_rgba(255,208,0,0.15)]' : 'border-white/5 shadow-2xl'}`}>
            {board.map((cell, index) => {
              const rawCell = cell;
              const cellIcon = optimisticMove === index ? mySymbol : rawCell;
              const clickable = isMyTurn && rawCell === null;
              const isMoving = optimisticMove === index;
              
              const borderClass = cellIcon === 'X' ? 'border-bumble-500/50 shadow-[0_0_10px_rgba(255,183,0,0.1)]' 
                               : cellIcon === 'O' ? 'border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                               : clickable ? 'border-white/5 hover:border-bumble-500/50 hover:shadow-[0_0_15px_rgba(255,183,0,0.15)] drop-shadow-md'
                               : 'border-transparent';

              return (
                <button
                  key={index}
                  id={`cell-${index}`}
                  onClick={() => handleCellClick(index)}
                  disabled={!clickable}
                  className={`
                    relative flex items-center justify-center
                    rounded-2xl aspect-square w-full h-full
                    transition-all duration-300 border-2
                    ${cellIcon
                      ? `bg-ebony-950/80 cursor-default ${borderClass}`
                      : clickable
                        ? `bg-ebony-800 hover:bg-ebony-700 hover:scale-[1.05] active:scale-[0.95] cursor-pointer ${borderClass}`
                        : 'bg-ebony-800 cursor-not-allowed border-transparent'
                    }
                    ${isMoving ? 'scale-90 brightness-150' : ''}
                  `}
                >
                  {cellIcon && <SymbolDisplay symbol={cellIcon} />}


                  {clickable && !cellIcon && (
                    <span className={`absolute inset-0 flex items-center justify-center text-6xl font-black opacity-0 hover:opacity-30 transition-opacity duration-200 ${mySymbol === 'X' ? 'text-bumble-500 drop-shadow-[0_0_15px_rgba(255,208,0,0.5)]' : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}>
                      {mySymbol === 'X' ? '✕' : '○'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>


      <div className="w-full max-w-md flex-shrink-0 flex items-center justify-center pb-[env(safe-area-inset-bottom,2rem)] pt-4 px-5">
        <button
          id="leave-match-btn"
          onClick={onLeave}
          className="
            mb-4 px-10 py-3.5 rounded-xl text-sm font-bold tracking-wide
            bg-transparent text-white/40 border border-white/10
            hover:bg-crimson-500/10 hover:border-crimson-500/40 hover:text-crimson-400
            transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(255,77,79,0.2)]
            focus:outline-none focus:ring-2 focus:ring-crimson-500/20 active:scale-[0.98]
          "
        >
          Leave Match
        </button>
      </div>
    </div>
  );
};
