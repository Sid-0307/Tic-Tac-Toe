# Tic-Tac-Toe — Real-time Multiplayer

A production-ready real-time multiplayer Tic-Tac-Toe game built with a server-authoritative architecture using **Nakama** as the game backend.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Vite + TailwindCSS             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │   │
│  │  │ Nickname   │  │Matchmaking │  │  GameBoard     │  │   │
│  │  │ Modal      │→ │ Screen     │→ │  ResultScreen  │  │   │
│  │  └────────────┘  └────────────┘  └────────────────┘  │   │
│  │          ↕  useNakama hook  ↕                         │   │
│  │     @heroiclabs/nakama-js SDK                         │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ WebSocket (opcodes 1-6)
┌──────────────────────▼──────────────────────────────────────┐
│                   Nakama Server (Docker)                     │
│  ┌─────────────────┐   ┌──────────────────────────────────┐  │
│  │  Matchmaker     │   │  Authoritative Match Runtime     │  │
│  │  (queue pairs)  │→  │  tictactoe.ts (compiled to JS)   │  │
│  └─────────────────┘   │  ┌─────────────────────────────┐ │  │
│                        │  │  GameState (board, turn,     │ │  │
│                        │  │  timer, players, scores)     │ │  │
│                        │  └─────────────────────────────┘ │  │
│                        └──────────────────────────────────┘  │
│  ┌────────────────┐                                           │
│  │   Leaderboard  │  tictactoe_global                        │
│  │   (built-in)   │                                           │
│  └────────────────┘                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL
┌──────────────────────▼──────────────────────────────────────┐
│               PostgreSQL 14                                  │
└──────────────────────────────────────────────────────────────┘
```

## Opcode Flow

```
Client A          Nakama Server           Client B
   │                    │                    │
   │── addMatchmaker ──►│                    │
   │                    │◄── addMatchmaker ──│
   │                    │                    │
   │◄── onMatchmakerMatched (token) ────────►│
   │                    │                    │
   │── joinMatch(token)►│◄── joinMatch(token)│
   │                    │  (both joined)     │
   │◄──── OPCODE 1: GAME_START ─────────────►│
   │                    │                    │
   │── OPCODE 2: MOVE ─►│  (validate move)   │
   │                    │                    │
   │◄──── OPCODE 3: GAME_STATE_UPDATE ──────►│
   │                    │                    │
   │    (each second)   │                    │
   │◄──── OPCODE 5: TIMER_UPDATE ───────────►│
   │                    │                    │
   │◄──── OPCODE 4: GAME_OVER (win/draw) ───►│
```

## Local Development

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 18+](https://nodejs.org/)

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tictactoe
   ```

2. **Build the Nakama runtime module** (compile TS → JS)
   ```bash
   cd nakama
   npm install
   npm run build
   cd ..
   ```

3. **Start Nakama + PostgreSQL**
   ```bash
   docker-compose up
   ```
   Wait for Nakama to be healthy (check `http://localhost:7350/healthcheck`).

4. **Start the frontend dev server**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open** `http://localhost:5173` in your browser.

6. **Test multiplayer**: open a second browser tab (or use a private/incognito window) and navigate to the same URL. Enter different nicknames in each tab and click Continue — they will be matched automatically.

### Environment Variables (Frontend)

Copy `.env.example` to `.env.local`:
```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_NAKAMA_HOST` | `localhost` | Nakama server hostname |
| `VITE_NAKAMA_PORT` | `7350` | Nakama HTTP/WS port |
| `VITE_NAKAMA_USE_SSL` | `false` | Use WSS/HTTPS |

## How Server-Authoritative Logic Works

All game state lives **exclusively on the server** in `matchLoop`. The client is a pure view layer:

1. **Client sends OPCODE 2** (MOVE) with `{ position: 0-8 }`
2. **Server validates**: is it the sender's turn? Is the cell empty? Is the game still running?
3. **If invalid**: silently dropped (prevents cheating)
4. **If valid**: server places symbol, checks win/draw, updates `GameState`, broadcasts to all players
5. **Timer**: runs server-side every tick (1/sec). If it reaches 0, the current player forfeits their turn; the server switches turns and resets the timer.
6. **Leaderboard**: written server-side with `nk.leaderboardRecordWrite()` at game end.

## Deployment to Render.com

1. **Push to GitHub** (ensure `nakama/data/modules/tictactoe.js` is committed — build it locally first)

2. **Connect to Render**:
   - Go to [render.com](https://render.com) → New → Blueprint
   - Connect your GitHub repo
   - Render will detect `render.yaml` automatically

3. **Set environment variables** in the Render dashboard:
   - For the frontend service: set `VITE_NAKAMA_HOST` to your Nakama service URL (e.g., `tictactoe-nakama.onrender.com`)

4. **Deploy order**:
   - Deploy Nakama first
   - Once healthy, deploy the frontend with the Nakama URL

5. **Access**: your frontend URL will be something like `https://tictactoe-frontend.onrender.com`

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Nakama** as backend | Ships with built-in matchmaking, leaderboards, authoritative server matches, and WebSocket support — eliminates writing a custom game server |
| **Server-authoritative matches** | Prevents cheating; server validates every move; state never trusted from clients |
| **Tick-rate 1 (1/sec) for timer** | Reliable server-side countdown without polling from clients; timer state is part of the authoritative game state |
| **localStorage device ID** | Provides persistent anonymous auth; players keep their account across sessions without a registration flow |
| **opcodes as integers** | Efficient binary-compatible wire format; integers are smaller than string event names |
| **Full board in every broadcast** | Keeps clients in sync even if a message is missed; simpler than diffing |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Nakama SDK | `@heroiclabs/nakama-js` |
| Backend | Nakama 3.21.1 (open-source game server by Heroic Labs) |
| Runtime logic | TypeScript → compiled JS (via esbuild) |
| Database | PostgreSQL 14 |
| Local dev | Docker Compose |
| Cloud deploy | Render.com |
