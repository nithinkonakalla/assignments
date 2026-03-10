import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import tradingRoutes from './routes/trading.js';
import subscriptionRoutes from './routes/subscription.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
