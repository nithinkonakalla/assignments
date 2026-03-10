# ChartTrader

ChartTrader is a TradingView-style SaaS paper trading platform for Indian market traders. It includes a dark professional trading terminal UI, chart-based order simulation, market replay, portfolio analytics, trade journaling, JWT auth, PostgreSQL persistence, and Razorpay subscription hooks.

## Tech Stack
- **Frontend**: React + TailwindCSS + TradingView Lightweight Charts + Zustand
- **Backend**: Node.js + Express + JWT + PostgreSQL
- **Realtime**: WebSocket simulated market feed (random walk)
- **Payments**: Razorpay order + signature verification flow

## Project Structure

```txt
frontend/
backend/
database/
websocket-service/
```

## Core Capabilities Implemented
- Signup/login/logout with hashed passwords and initial ₹100,000 virtual balance
- Trading dashboard (watchlist + chart + order panel + portfolio)
- Candlestick + volume chart with SL/TGT/entry lines
- Paper trading engine with open/closed trades and mark-to-market PnL
- Auto-close on stop loss / target touch
- WebSocket candle simulation every second
- Replay mode by date with 1x/2x/5x speed
- Trade journal endpoint
- Free/Pro plans and Razorpay integration endpoints
- Admin stats endpoint (total users, active subs, trade activity)

## Local Setup

### Quick Start in VS Code (Recommended)
1. Open VS Code.
2. Go to **File → Open Folder...** and select the `charttrader` project root.
3. Open a terminal in VS Code (**Terminal → New Terminal**).
4. Create three terminals so you can run backend, websocket-service, and frontend side-by-side.

Use these commands in each terminal:

**Terminal 1 (backend):**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Terminal 2 (websocket-service):**
```bash
cd websocket-service
npm install
npm run dev
```

**Terminal 3 (frontend):**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Then open `http://localhost:5173` in your browser.

> Note: Make sure PostgreSQL is running first, and `database/schema.sql` has been applied.

### 1) Database
```bash
createdb charttrader
psql charttrader < database/schema.sql
```

### 2) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

`backend/.env.example`:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/charttrader
JWT_SECRET=super-secret
RAZORPAY_KEY_ID=rzp_test_key
RAZORPAY_KEY_SECRET=rzp_test_secret
```

### 3) WebSocket service
```bash
cd websocket-service
npm install
npm run dev
```

### 4) Frontend
```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.example`:
```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:8080
```

## Docker Setup
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- WS feed: `ws://localhost:8080`

## Deployment (Railway / Render / Vercel)
- **Railway**: Deploy `backend` + `websocket-service` as services, attach Postgres plugin, deploy `frontend` as static/web service.
- **Render**: Create 3 services (frontend web, backend web, websocket web) + PostgreSQL instance; configure env vars.
- **Vercel**: Deploy frontend on Vercel; deploy backend/ws on Railway/Render and point `VITE_API_URL` / `VITE_WS_URL` to those domains.

## API Summary
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/trading/portfolio`
- `POST /api/trading/orders`
- `POST /api/trading/mark-to-market`
- `GET /api/trading/journal`
- `GET /api/subscription/plans`
- `POST /api/subscription/create-order`
- `POST /api/subscription/verify`
- `GET /api/admin/stats`
