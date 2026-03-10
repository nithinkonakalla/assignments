import { useAppStore } from '../store/useAppStore';

const symbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'HAL'];

export default function Watchlist() {
  const activeSymbol = useAppStore((s) => s.activeSymbol);
  const setSymbol = useAppStore((s) => s.setSymbol);

  return (
    <div className="rounded-lg bg-slate-900 p-3">
      <h2 className="mb-2 text-sm font-semibold text-slate-200">Watchlist</h2>
      <div className="space-y-2">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            className={`w-full rounded px-3 py-2 text-left text-sm ${activeSymbol === symbol ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}
            onClick={() => setSymbol(symbol)}
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
