import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function OrderPanel() {
  const symbol = useAppStore((s) => s.activeSymbol);
  const placeOrder = useAppStore((s) => s.placeOrder);
  const [form, setForm] = useState({ orderType: 'BUY', entryPrice: '', quantity: 1, stopLoss: '', target: '' });

  const submit = async (e) => {
    e.preventDefault();
    await placeOrder({ symbol, ...form, entryPrice: Number(form.entryPrice), quantity: Number(form.quantity), stopLoss: form.stopLoss ? Number(form.stopLoss) : null, target: form.target ? Number(form.target) : null });
    setForm((f) => ({ ...f, entryPrice: '', stopLoss: '', target: '' }));
  };

  return (
    <form className="space-y-2 rounded-lg bg-slate-900 p-3" onSubmit={submit}>
      <h2 className="text-sm font-semibold text-slate-200">Order Entry ({symbol})</h2>
      <select className="w-full rounded bg-slate-800 p-2 text-slate-100" value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })}>
        <option>BUY</option>
        <option>SELL</option>
      </select>
      <input className="w-full rounded bg-slate-800 p-2 text-slate-100" placeholder="Entry Price" value={form.entryPrice} onChange={(e) => setForm({ ...form, entryPrice: e.target.value })} />
      <input className="w-full rounded bg-slate-800 p-2 text-slate-100" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
      <input className="w-full rounded bg-slate-800 p-2 text-slate-100" placeholder="Stop Loss" value={form.stopLoss} onChange={(e) => setForm({ ...form, stopLoss: e.target.value })} />
      <input className="w-full rounded bg-slate-800 p-2 text-slate-100" placeholder="Target" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
      <button className="w-full rounded bg-emerald-600 p-2 font-medium text-white">Place Order</button>
    </form>
  );
}
