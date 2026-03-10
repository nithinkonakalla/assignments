import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function PortfolioPanel() {
  const { openTrades, closedTrades, accountBalance, currentPnl, loadPortfolio } = useAppStore();

  useEffect(() => {
    loadPortfolio().catch(() => {});
  }, [loadPortfolio]);

  return (
    <div className="space-y-3 rounded-lg bg-slate-900 p-3 text-xs text-slate-200">
      <h2 className="text-sm font-semibold">Portfolio</h2>
      <div>Balance: ₹{Number(accountBalance).toLocaleString()}</div>
      <div className={currentPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>Current PnL: ₹{Number(currentPnl).toFixed(2)}</div>

      <div>
        <h3 className="mb-1 font-semibold">Open Trades</h3>
        <div className="max-h-28 space-y-1 overflow-auto">
          {openTrades.map((t) => (
            <div key={t.id} className="rounded bg-slate-800 p-2">{t.symbol} {t.order_type} x{t.quantity}</div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">Closed Trades</h3>
        <div className="max-h-28 space-y-1 overflow-auto">
          {closedTrades.map((t) => (
            <div key={t.id} className="rounded bg-slate-800 p-2">
              {t.symbol} ₹{Number(t.realized_pnl).toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
