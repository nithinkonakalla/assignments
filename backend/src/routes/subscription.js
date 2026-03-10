import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret'
});

router.get('/plans', (_, res) => {
  res.json({
    free: { name: 'Free', price: 0, features: ['Limited replay', 'Limited trades'] },
    pro: { name: 'Pro', price: 199, interval: 'month', features: ['Unlimited paper trading', 'Full replay access', 'Advanced analytics'] }
  });
});

router.post('/create-order', async (req, res) => {
  const order = await razorpay.orders.create({
    amount: 19900,
    currency: 'INR',
    receipt: `charttrader_${req.user.userId}_${Date.now()}`
  });
  res.json(order);
});

router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret').update(body).digest('hex');

  if (expected !== razorpay_signature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  await pool.query('UPDATE users SET plan=$1, subscription_status=$2 WHERE id=$3', ['PRO', 'ACTIVE', req.user.userId]);
  return res.json({ message: 'Subscription activated' });
});

export default router;
