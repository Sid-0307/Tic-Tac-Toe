import { useState, useCallback, useRef } from 'react';
import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { v4 as uuidv4 } from 'uuid';
import {
  Phase,
  PlayerSymbol,
  LeaderboardEntry,
  OPCODES,
  GameStartPayload,
  GameStatePayload,
  GameOverPayload,
  TimerUpdatePayload,
  PlayerDisconnectedPayload,
} from '../types/game';

// ─── Config ──────────────────────────────────────────────────
const NAKAMA_HOST = import.meta.env.VITE_NAKAMA_HOST || 'localhost';
const NAKAMA_PORT = import.meta.env.VITE_NAKAMA_PORT || '7350';
const USE_SSL = import.meta.env.VITE_NAKAMA_USE_SSL === 'true';
const SERVER_KEY = 'defaultkey';
const DEVICE_ID_KEY = 'ttt_device_id';
const MATCHMAKER_QUERY = '*';

// ─── Hook Interface ───────────────────────────────────────────
export interface NakamaState {
  phase: Phase;
  nickname: string;
  myUserId: string;
  mySymbol: PlayerSymbol | null;
  board: Array<string | null>;
  currentTurn: string;
  winner: string | null;
  winnerName: string | null;
  pointsEarned: number;
  timeRemaining: number;
  opponentName: string;
  opponentUserId: string;
  opponentSymbol: PlayerSymbol | null;
  players: { [userId: string]: { symbol: PlayerSymbol; username: string; score: number } };
  leaderboard: LeaderboardEntry[];
  statusMessage: string;
  error: string | null;
}

export interface NakamaActions {
  setNickname: (name: string) => void;
  startMatchmaking: (nickname?: string) => Promise<void>;
  cancelMatchmaking: () => Promise<void>;
  makeMove: (position: number) => void;
  playAgain: () => void;
  fetchLeaderboard: () => Promise<void>;
}

const INITIAL_STATE: NakamaState = {
  phase: 'nickname',
  nickname: '',
  myUserId: '',
  mySymbol: null,
  board: new Array(9).fill(null),
  currentTurn: '',
  winner: null,
  winnerName: null,
  pointsEarned: 0,
  timeRemaining: 30,
  opponentName: '',
  opponentUserId: '',
  opponentSymbol: null,
  players: {},
  leaderboard: [],
  statusMessage: '',
  error: null,
};

// ─── Hook ─────────────────────────────────────────────────────
export function useNakama(): NakamaState & NakamaActions {
  const [state, setState] = useState<NakamaState>(INITIAL_STATE);

  const clientRef = useRef<Client | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const matchIdRef = useRef<string | null>(null);
  const matchmakerTicketRef = useRef<string | null>(null);
  const nicknameRef = useRef<string>('');
  const myUserIdRef = useRef<string>('');

  // ── Helpers ───────────────────────────────────────────────────

  const getOrCreateDeviceId = (): string => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  };

  const getClient = (): Client => {
    if (!clientRef.current) {
      clientRef.current = new Client(SERVER_KEY, NAKAMA_HOST, NAKAMA_PORT, USE_SSL);
    }
    return clientRef.current;
  };

  const updateState = (updates: Partial<NakamaState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // ── Socket event setup ────────────────────────────────────────

  const setupSocketHandlers = useCallback((socket: Socket) => {
    socket.onmatchdata = (matchData) => {
      const myUserId = myUserIdRef.current;
      const currentNickname = nicknameRef.current;

      try {
        const rawData = matchData.data;
        let payloadStr: string;
        if (rawData instanceof Uint8Array) {
          payloadStr = new TextDecoder().decode(rawData);
        } else if (typeof rawData === 'string') {
          payloadStr = rawData;
        } else {
          payloadStr = JSON.stringify(rawData);
        }

        const payload = JSON.parse(payloadStr);
        const opcode = matchData.op_code;

        switch (opcode) {
          case OPCODES.GAME_START: {
            const data = payload as GameStartPayload;
            const myInfo = data.players[myUserId];
            const opponentId = data.playerOrder.find((id) => id !== myUserId) || '';
            const opponentInfo = opponentId ? data.players[opponentId] : null;
            updateState({
              phase: 'playing',
              board: data.board,
              currentTurn: data.currentTurn,
              mySymbol: myInfo?.symbol ?? null,
              opponentName: opponentInfo?.username ?? 'Opponent',
              opponentUserId: opponentId,
              opponentSymbol: opponentInfo?.symbol ?? null,
              players: data.players as NakamaState['players'],
              timeRemaining: data.turnTimeRemaining,
              statusMessage: '',
            });
            break;
          }
          case OPCODES.GAME_STATE_UPDATE: {
            const data = payload as GameStatePayload;
            updateState({
              board: data.board,
              currentTurn: data.currentTurn,
              players: data.players as NakamaState['players'],
              timeRemaining: data.turnTimeRemaining,
            });
            break;
          }
          case OPCODES.GAME_OVER: {
            const data = payload as GameOverPayload;
            const iWon = !data.isDraw && data.winner === myUserId;
            const points = iWon ? data.points : data.isDraw ? data.points : 0;
            updateState({
              phase: 'result',
              board: data.board,
              winner: data.winner,
              winnerName: data.isDraw ? null : data.winnerName,
              pointsEarned: points,
              players: data.players as NakamaState['players'],
            });
            break;
          }
          case OPCODES.TIMER_UPDATE: {
            const data = payload as TimerUpdatePayload;
            updateState({
              timeRemaining: data.remaining,
              currentTurn: data.currentTurn,
            });
            break;
          }
          case OPCODES.PLAYER_DISCONNECTED: {
            const data = payload as PlayerDisconnectedPayload;
            const iWon = data.winner === myUserId;
            updateState({
              phase: 'result',
              winner: data.winner,
              winnerName: iWon ? currentNickname : data.winnerName,
              pointsEarned: iWon ? 200 : 0,
              statusMessage: `${data.disconnectedUsername} disconnected`,
            });
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error('Error processing match data:', err);
      }
    };

    socket.onmatchmakermatched = async (matched) => {
      try {
        matchmakerTicketRef.current = null;
        updateState({ statusMessage: 'Match found! Joining...' });

        // Log to help diagnose which field is populated
        console.log('onmatchmakermatched:', JSON.stringify({
          token: matched.token,
          // @ts-ignore
          match_id: matched.match_id,
        }));

        // For authoritative matches (server returns a match ID), Nakama SDK
        // puts the match ID in matched.match_id. For relayed matches it uses
        // matched.token. Check both — use whichever is non-empty.
        // @ts-ignore
        const joinWith: string = matched.match_id || matched.token;

        if (!joinWith) {
          throw new Error('No match_id or token received from matchmaker');
        }

        const match = await socket.joinMatch(joinWith);
        matchIdRef.current = match.match_id;
        updateState({ statusMessage: '' });
      } catch (err) {
        console.error('Error joining matched game:', err);
        updateState({
          phase: 'matchmaking',
          statusMessage: 'Error joining match, retrying...',
          error: String(err),
        });
      }
    };

    socket.ondisconnect = () => {
      console.warn('Socket disconnected');
      setState((prev) => {
        if (prev.phase === 'matchmaking' || prev.phase === 'playing') {
          return { ...prev, statusMessage: 'Connection lost.', error: 'Disconnected from server' };
        }
        return prev;
      });
    };

    socket.onerror = (evt) => {
      console.error('Socket error', evt);
      updateState({ error: 'WebSocket error occurred' });
    };
  }, []);

  // ── Auth + Socket ─────────────────────────────────────────────

  const authenticateAndConnect = async (
    nicknameToSet: string
  ): Promise<{ session: Session; socket: Socket; userId: string }> => {
    const client = getClient();
    const deviceId = getOrCreateDeviceId();

    const session = await client.authenticateDevice(deviceId, true, nicknameToSet);
    sessionRef.current = session;

    // updateAccount can fail if the username is already taken by this or
    // another account — that is non-fatal, the session is still valid.
    try {
      await client.updateAccount(session, {
        display_name: nicknameToSet,
        username: nicknameToSet,
      });
    } catch (e) {
      console.warn('updateAccount failed (non-fatal):', e);
    }

    const socket = client.createSocket(USE_SSL, false);
    socketRef.current = socket;

    // Register handlers BEFORE connect() so no events can be missed
    setupSocketHandlers(socket);

    await socket.connect(session, true);

    return { session, socket, userId: session.user_id! };
  };

  // ── Public Actions ────────────────────────────────────────────

  const setNickname = useCallback((name: string) => {
    updateState({ nickname: name });
  }, []);

  const startMatchmaking = useCallback(async (nicknameOverride?: string) => {
    const nicknameVal = (nicknameOverride ?? state.nickname).trim();
    if (!nicknameVal) return;

    nicknameRef.current = nicknameVal;

    updateState({
      phase: 'matchmaking',
      board: new Array(9).fill(null),
      currentTurn: '',
      winner: null,
      winnerName: null,
      pointsEarned: 0,
      timeRemaining: 30,
      mySymbol: null,
      opponentName: '',
      opponentUserId: '',
      opponentSymbol: null,
      players: {},
      leaderboard: [],
      statusMessage: 'Connecting to server...',
      error: null,
    });

    try {
      const { userId } = await authenticateAndConnect(nicknameVal);
      myUserIdRef.current = userId;

      updateState({
        myUserId: userId,
        error: null,
        statusMessage: 'Finding a random player...',
      });

      const ticket = await socketRef.current!.addMatchmaker(MATCHMAKER_QUERY, 2, 2);
      matchmakerTicketRef.current = ticket.ticket;
    } catch (err) {
      console.error('startMatchmaking error:', err);
      updateState({
        phase: 'nickname',
        error: `Connection failed: ${String(err)}`,
        statusMessage: '',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.nickname, setupSocketHandlers]);

  const cancelMatchmaking = useCallback(async () => {
    try {
      if (socketRef.current && matchmakerTicketRef.current) {
        await socketRef.current.removeMatchmaker(matchmakerTicketRef.current);
        matchmakerTicketRef.current = null;
      }
    } catch (err) {
      console.error('cancelMatchmaking error:', err);
    }
    updateState({ phase: 'nickname', statusMessage: '', error: null });
  }, []);

  const makeMove = useCallback((position: number) => {
    if (!socketRef.current || !matchIdRef.current) return;
    try {
      const payload = JSON.stringify({ position });
      socketRef.current.sendMatchState(matchIdRef.current, OPCODES.MOVE, payload);
    } catch (err) {
      console.error('makeMove error:', err);
    }
  }, []);

  const playAgain = useCallback(() => {
    if (socketRef.current) {
      try { socketRef.current.disconnect(true); } catch (_) { /* ignore */ }
      socketRef.current = null;
    }
    sessionRef.current = null;
    matchIdRef.current = null;
    matchmakerTicketRef.current = null;
    setState({ ...INITIAL_STATE, nickname: nicknameRef.current });
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    if (!clientRef.current || !sessionRef.current) return;
    try {
      const result = await clientRef.current.listLeaderboardRecords(
        sessionRef.current,
        'tictactoe_global',
        [],
        10,
        undefined,
        '0'
      );
      const entries: LeaderboardEntry[] = (result.records ?? []).map((r) => {
        let wins = 0, losses = 0, draws = 0;
        try {
          const meta = JSON.parse(typeof r.metadata === 'string' ? r.metadata : '{}') as {
            wins?: number; losses?: number; draws?: number;
          };
          wins = meta.wins ?? 0;
          losses = meta.losses ?? 0;
          draws = meta.draws ?? 0;
        } catch (_) { /* ignore */ }
        return {
          rank: Number(r.rank),
          userId: r.owner_id ?? '',
          username: r.username ?? r.owner_id ?? '',
          score: Number(r.score ?? 0),
          wins, losses, draws,
          numScore: Number(r.num_score ?? 0),
        };
      });
      updateState({ leaderboard: entries });
    } catch (err) {
      console.error('fetchLeaderboard error:', err);
    }
  }, []);

  return {
    ...state,
    setNickname,
    startMatchmaking,
    cancelMatchmaking,
    makeMove,
    playAgain,
    fetchLeaderboard,
  };
}