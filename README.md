# Multiplayer TicTacToe (React + Nakama + Supabase)

## 🛠 Setup & Installation

### Backend (Nakama)

```bash
cd nakama
npm install
npm run build
```

* Compiles: `tictactoe.ts → tictactoe.js`
* Ensure `DB_URL` is set (Supabase connection)

---

### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

---

### Environment Variables

**Backend (Render):**

```env
DB_URL=postgres://USER:PASSWORD@HOST:PORT/postgres?sslmode=require
```

**Frontend (Vercel):**

```env
VITE_NAKAMA_HOST=tic-tac-toe-kf84.onrender.com
VITE_NAKAMA_PORT=443
VITE_NAKAMA_USE_SSL=true
```

---

## 🏗 Architecture & Design

```
Frontend (Vercel)
        ↓
Nakama Server (Render)
        ↓
Supabase PostgreSQL
```

### Key Decisions

* **Nakama** → authoritative multiplayer server (matchmaking + real-time sync)
* **Supabase Postgres** → managed DB (no local DB needed)
* **JS Runtime (Goja)** → flexible game logic (`tictactoe.js`)
* **Frontend isolated** → no direct DB access (security)

---

## 🚀 Deployment Process

### Backend (Render)

* Docker-based deployment
* Uses:

  ```bash
  /nakama/nakama migrate up && nakama --socket.port ${PORT}
  ```
* Uses Supabase instead of local DB

---

### Frontend (Vercel)

* Root: `frontend/`
* Auto build via Vite
* Uses env vars to connect to Render backend

---

## ⚙ API / Server Configuration

* **Base URL:**

  ```
  https://tic-tac-toe-kf84.onrender.com
  ```

* **Runtime Module:**

  ```
  tictactoe.js
  ```

* **Auth:**

  * Device-based (for testing)

---

### Important Flags

```bash
--socket.address 0.0.0.0
--socket.port ${PORT}
--runtime.js_entrypoint tictactoe.js
```

---

## 🧪 Testing Multiplayer

### 1. Run Frontend

```
https://tic-tac-toe-nine-weld-83.vercel.app
```

---

### 2. Test Flow

1. Open **2 browser tabs**
2. Enter different usernames
3. Join matchmaking
4. Play game

---

### 3. Validate

* Moves sync in real-time
* Turn-based locking works
* Match ends correctly
