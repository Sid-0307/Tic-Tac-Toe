// ─── Shared TypeScript types for the Tic-Tac-Toe frontend ───

export type Phase = "nickname" | "matchmaking" | "playing" | "result";
export type PlayerSymbol = "X" | "O";

// Matches server GameState wire format (presences stripped)
export interface PlayerWireInfo {
  symbol: PlayerSymbol;
  username: string;
  score: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  wins: number;
  losses: number;
  draws: number;
  numScore?: number; // raw numScore from Nakama record
}

// Opcodes — must match tictactoe.ts server values exactly
export const OPCODES = {
  GAME_START: 1,
  MOVE: 2,
  GAME_STATE_UPDATE: 3,
  GAME_OVER: 4,
  TIMER_UPDATE: 5,
  PLAYER_DISCONNECTED: 6,
} as const;

// Payload shapes for each opcode received from server
export interface GameStartPayload {
  board: Array<string | null>;
  currentTurn: string;
  players: { [userId: string]: PlayerWireInfo };
  playerOrder: string[];
  turnTimeRemaining: number;
  started: boolean;
}

export interface GameStatePayload {
  board: Array<string | null>;
  currentTurn: string;
  players: { [userId: string]: PlayerWireInfo };
  playerOrder: string[];
  turnTimeRemaining: number;
  started: boolean;
}

export interface GameOverPayload {
  winner: string | null; // userId or "draw"
  winnerName: string;
  points: number;
  board: Array<string | null>;
  isDraw: boolean;
  players: { [userId: string]: PlayerWireInfo };
}

export interface TimerUpdatePayload {
  remaining: number;
  currentTurn: string;
}

export interface PlayerDisconnectedPayload {
  disconnectedUserId: string;
  disconnectedUsername: string;
  winner: string;
  winnerName: string;
}

// Nakama leaderboard record metadata stored per write
export interface LeaderboardMetadata {
  wins: number;
  losses: number;
  draws: number;
}
