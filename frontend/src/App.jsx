import { useEffect, useRef, useState } from 'react';
import ChartPanel from './components/ChartPanel';
import OrderPanel from './components/OrderPanel';
import PortfolioPanel from './components/PortfolioPanel';
import ReplayControls from './components/ReplayControls';
import Watchlist from './components/Watchlist';
import { useAppStore } from './store/useAppStore';
import { api } from './services/api';

function AuthCard() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const login = useAppStore((s) => s.login);
  const signup = useAppStore((s) => s.signup);

  const submit = async (e) => {
    e.preventDefault();
    if (isLogin) await login({ email: form.email, password: form.password });
    else await signup(form);
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-md rounded-xl bg-slate-900 p-6 text-slate-100">
      <h1 className="mb-4 text-xl font-bold">ChartTrader</h1>
      <form className="space-y-3" onSubmit={submit}>
        {!isLogin && <input className="w-full rounded bg-slate-800 p-2" placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input className="w-full rounded bg-slate-800 p-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded bg-slate-800 p-2" type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full rounded bg-emerald-600 p-2 font-semibold">{isLogin ? 'Login' : 'Signup'}</button>
      </form>
      <button className="mt-3 text-xs text-slate-400" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'New user? Sign up' : 'Already have account? Login'}</button>
    </div>
  );
}

export default function App() {
  const ws = useRef(null);
  const token = useAppStore((s) => s.token);
  const symbol = useAppStore((s) => s.activeSymbol);
  const upsertCandle = useAppStore((s) => s.upsertCandle);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (!token) return;
    ws.current = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8080');
    ws.current.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'CANDLE' || msg.type === 'REPLAY_CANDLE') {
        const candle = msg.data;
        upsertCandle(candle.symbol, candle);
        if (candle.symbol === symbol) {
          await api.post('/trading/mark-to-market', { symbol: candle.symbol, currentPrice: candle.close });
        }
      }
    };

    return () => ws.current?.close();
  }, [token, symbol, upsertCandle]);

  if (!token) return <AuthCard />;

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">ChartTrader Terminal</h1>
        <button className="rounded bg-slate-800 px-3 py-1 text-xs" onClick={logout}>Logout</button>
      </div>
      <ReplayControls ws={ws} />
      <div className="mt-3 grid grid-cols-12 gap-3">
        <div className="col-span-2"><Watchlist /></div>
        <div className="col-span-7 rounded-lg bg-slate-900 p-2"><ChartPanel /></div>
        <div className="col-span-3 space-y-3"><OrderPanel /><PortfolioPanel /></div>
      </div>
    </div>
  );
}
