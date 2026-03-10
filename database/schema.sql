CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  virtual_balance NUMERIC(14,2) NOT NULL DEFAULT 100000,
  plan VARCHAR(20) NOT NULL DEFAULT 'FREE',
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  order_type VARCHAR(4) NOT NULL CHECK (order_type IN ('BUY','SELL')),
  entry_price NUMERIC(12,2) NOT NULL,
  exit_price NUMERIC(12,2),
  quantity INTEGER NOT NULL,
  stop_loss NUMERIC(12,2),
  target NUMERIC(12,2),
  status VARCHAR(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
  realized_pnl NUMERIC(12,2) DEFAULT 0,
  risk_reward_ratio NUMERIC(8,2),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_user_status ON trades(user_id, status);
