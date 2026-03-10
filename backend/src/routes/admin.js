import express from 'express';
import pool from '../config/db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get('/stats', async (_, res) => {
  const [users, subscriptions, trades] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total_users FROM users'),
    pool.query("SELECT COUNT(*)::int AS active_subscriptions FROM users WHERE subscription_status='ACTIVE'"),
    pool.query("SELECT COUNT(*)::int AS total_trades, COUNT(*) FILTER (WHERE status='OPEN')::int AS open_trades FROM trades")
  ]);

  res.json({
    totalUsers: users.rows[0].total_users,
    activeSubscriptions: subscriptions.rows[0].active_subscriptions,
    tradeActivity: trades.rows[0],
    systemStatus: 'healthy'
  });
});

export default router;
