import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { useAppStore } from '../store/useAppStore';

export default function ChartPanel() {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeRef = useRef(null);
  const lineRefs = useRef([]);
  const symbol = useAppStore((s) => s.activeSymbol);
  const candles = useAppStore((s) => s.candles[symbol] || []);
  const openTrades = useAppStore((s) => s.openTrades.filter((t) => t.symbol === symbol));

  useEffect(() => {
    chartRef.current = createChart(containerRef.current, {
      layout: { background: { color: '#0f172a' }, textColor: '#cbd5e1' },
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
      rightPriceScale: { borderColor: '#334155' },
      timeScale: { borderColor: '#334155' },
      height: 500
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444'
    });

    volumeRef.current = chartRef.current.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      color: '#64748b'
    });
    volumeRef.current.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });

    return () => chartRef.current.remove();
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    seriesRef.current.setData(candles);
    volumeRef.current.setData(candles.map((c) => ({ time: c.time, value: c.volume, color: c.close >= c.open ? '#065f46' : '#7f1d1d' })));
  }, [candles]);

  useEffect(() => {
    lineRefs.current.forEach((line) => seriesRef.current.removePriceLine(line));
    lineRefs.current = [];

    openTrades.forEach((trade) => {
      const entry = seriesRef.current.createPriceLine({ price: Number(trade.entry_price), color: '#3b82f6', title: 'Entry' });
      lineRefs.current.push(entry);
      if (trade.stop_loss) lineRefs.current.push(seriesRef.current.createPriceLine({ price: Number(trade.stop_loss), color: '#ef4444', title: 'SL' }));
      if (trade.target) lineRefs.current.push(seriesRef.current.createPriceLine({ price: Number(trade.target), color: '#22c55e', title: 'TGT' }));
    });
  }, [openTrades]);

  return <div className="h-[520px] w-full" ref={containerRef} />;
}
