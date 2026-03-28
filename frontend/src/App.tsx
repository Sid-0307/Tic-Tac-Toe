import { useNakama } from './hooks/useNakama';
import { NicknameModal } from './components/NicknameModal';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { GameBoard } from './components/GameBoard';
import { ResultScreen } from './components/ResultScreen';

function App() {
  const nakama = useNakama();

  const handleNicknameSubmit = (name: string) => {
    nakama.setNickname(name);
    void nakama.startMatchmaking(name);
  };

  switch (nakama.phase) {
    case 'nickname':
      return (
        <NicknameModal onSubmit={handleNicknameSubmit} />
      );

    case 'matchmaking':
      return (
        <MatchmakingScreen
          onCancel={() => void nakama.cancelMatchmaking()}
          statusMessage={nakama.statusMessage}
        />
      );

    case 'playing':
      return (
        <GameBoard
          board={nakama.board}
          currentTurn={nakama.currentTurn}
          myUserId={nakama.myUserId}
          mySymbol={nakama.mySymbol}
          opponentName={nakama.opponentName}
          myNickname={nakama.nickname}
          timeRemaining={nakama.timeRemaining}
          onMove={nakama.makeMove}
          onLeave={nakama.playAgain}
        />
      );

    case 'result':
      return (
        <ResultScreen
          winner={nakama.winner}
          winnerName={nakama.winnerName}
          myUserId={nakama.myUserId}
          myNickname={nakama.nickname}
          pointsEarned={nakama.pointsEarned}
          leaderboard={nakama.leaderboard}
          onPlayAgain={nakama.playAgain}
          onFetchLeaderboard={() => void nakama.fetchLeaderboard()}
          players={nakama.players}
        />
      );

    default:
      return null;
  }
}

export default App;
