import express from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { calculateLivePnl, riskRewardRatio, shouldAutoClose } from '../services/tradingService.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/portfolio', async (req, res) => {
  const [open, closed, user] = await Promise.all([
    pool.query('SELECT * FROM trades WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC', [req.user.userId, 'OPEN']),
    pool.query('SELECT * FROM trades WHERE user_id = $1 AND status = $2 ORDER BY updated_at DESC LIMIT 100', [req.user.userId, 'CLOSED']),
    pool.query('SELECT virtual_balance FROM users WHERE id = $1', [req.user.userId])
  ]);

  const currentPnl = open.rows.reduce((acc, t) => acc + Number(t.realized_pnl || 0), 0);
  res.json({ openTrades: open.rows, closedTrades: closed.rows, currentPnl, accountBalance: Number(user.rows[0]?.virtual_balance || 0) });
});

router.post('/orders', async (req, res) => {
  const { symbol, orderType, entryPrice, quantity, stopLoss, target } = req.body;
  if (!symbol || !orderType || !entryPrice || !quantity) return res.status(400).json({ message: 'Missing required order fields' });

  const orderValue = Number(entryPrice) * Number(quantity);
  if (orderType === 'BUY') {
    const balanceResult = await pool.query('SELECT virtual_balance FROM users WHERE id=$1', [req.user.userId]);
    if (Number(balanceResult.rows[0].virtual_balance) < orderValue) return res.status(400).json({ message: 'Insufficient virtual balance' });
    await pool.query('UPDATE users SET virtual_balance = virtual_balance - $1 WHERE id=$2', [orderValue, req.user.userId]);
  }

  const inserted = await pool.query(
    `INSERT INTO trades (user_id, symbol, order_type, entry_price, quantity, stop_loss, target, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'OPEN') RETURNING *`,
    [req.user.userId, symbol, orderType, entryPrice, quantity, stopLoss || null, target || null]
  );

  res.status(201).json(inserted.rows[0]);
});

router.post('/mark-to-market', async (req, res) => {
  const { symbol, currentPrice } = req.body;
  if (!symbol || !currentPrice) return res.status(400).json({ message: 'symbol and currentPrice required' });

  const positions = await pool.query('SELECT * FROM trades WHERE user_id=$1 AND symbol=$2 AND status=$3', [req.user.userId, symbol, 'OPEN']);

  const updates = positions.rows.map(async (position) => {
    const pnl = calculateLivePnl(position, currentPrice);
    await pool.query('UPDATE trades SET realized_pnl = $1 WHERE id = $2', [pnl, position.id]);

    if (shouldAutoClose(position, currentPrice)) {
      const rr = riskRewardRatio(Number(position.entry_price), Number(position.stop_loss), Number(position.target));
      await pool.query(
        `UPDATE trades SET status='CLOSED', exit_price=$1, realized_pnl=$2, risk_reward_ratio=$3, updated_at=NOW() WHERE id=$4`,
        [currentPrice, pnl, rr, position.id]
      );

      if (position.order_type === 'BUY') {
        const credit = Number(currentPrice) * Number(position.quantity);
        await pool.query('UPDATE users SET virtual_balance = virtual_balance + $1 WHERE id=$2', [credit, req.user.userId]);
      } else {
        const credit = Number(position.entry_price) * Number(position.quantity) + pnl;
        await pool.query('UPDATE users SET virtual_balance = virtual_balance + $1 WHERE id=$2', [credit, req.user.userId]);
      }
    }
  });

  await Promise.all(updates);
  return res.json({ message: 'Marked to market' });
});

router.get('/journal', async (req, res) => {
  const result = await pool.query(
    `SELECT symbol, entry_price, exit_price, realized_pnl, risk_reward_ratio, updated_at AS timestamp
      FROM trades WHERE user_id=$1 AND status='CLOSED' ORDER BY updated_at DESC LIMIT 200`,
    [req.user.userId]
  );
  res.json(result.rows);
});

export default router;
