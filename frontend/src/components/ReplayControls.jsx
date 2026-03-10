import { useAppStore } from '../store/useAppStore';

export default function ReplayControls({ ws }) {
  const replay = useAppStore((s) => s.replay);
  const setReplay = useAppStore((s) => s.setReplay);

  const startReplay = () => {
    ws.current?.send(JSON.stringify({ type: 'START_REPLAY', payload: replay }));
    setReplay({ enabled: true });
  };

  const stopReplay = () => {
    ws.current?.send(JSON.stringify({ type: 'STOP_REPLAY' }));
    setReplay({ enabled: false });
  };

  return (
    <div className="flex items-center gap-2 rounded bg-slate-900 p-2 text-xs text-slate-200">
      <input type="date" className="rounded bg-slate-800 p-1" value={replay.date} onChange={(e) => setReplay({ date: e.target.value })} />
      <select className="rounded bg-slate-800 p-1" value={replay.speed} onChange={(e) => setReplay({ speed: Number(e.target.value) })}>
        <option value={1}>1x</option><option value={2}>2x</option><option value={5}>5x</option>
      </select>
      <button className="rounded bg-indigo-600 px-2 py-1" onClick={startReplay}>Start Replay</button>
      <button className="rounded bg-rose-600 px-2 py-1" onClick={stopReplay}>Stop</button>
    </div>
  );
}
