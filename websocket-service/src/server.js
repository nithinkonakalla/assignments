import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: process.env.WS_PORT || 8080 });

const symbols = {
  NIFTY: 22500,
  BANKNIFTY: 48500,
  RELIANCE: 2900,
  TCS: 4050,
  HAL: 4900
};

const state = Object.fromEntries(Object.entries(symbols).map(([symbol, price]) => [symbol, { lastPrice: price }]));

function nextCandle(symbol) {
  const prev = state[symbol].lastPrice;
  const drift = (Math.random() - 0.5) * (prev * 0.003);
  const open = prev;
  const close = Math.max(1, open + drift);
  const high = Math.max(open, close) + Math.random() * (open * 0.0015);
  const low = Math.min(open, close) - Math.random() * (open * 0.0015);
  const volume = Math.floor(100 + Math.random() * 5000);

  state[symbol].lastPrice = close;
  return {
    symbol,
    time: Math.floor(Date.now() / 1000),
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2)),
    volume
  };
}

function makeReplayCandle(base, cursor) {
  const step = Math.sin(cursor / 8) * 8 + (Math.random() - 0.5) * 4;
  const open = base;
  const close = Math.max(1, base + step);
  const high = Math.max(open, close) + Math.random() * 3;
  const low = Math.min(open, close) - Math.random() * 3;
  return { open, high, low, close, volume: Math.floor(300 + Math.random() * 3000) };
}

wss.on('connection', (ws) => {
  let replayInterval;

  ws.on('message', (raw) => {
    const message = JSON.parse(raw.toString());
    if (message.type === 'START_REPLAY') {
      const { symbol = 'NIFTY', speed = 1, date } = message.payload || {};
      clearInterval(replayInterval);

      let cursor = 0;
      let price = symbols[symbol] || 100;
      const startTime = new Date(`${date || '2024-05-20'}T09:15:00+05:30`).getTime() / 1000;

      replayInterval = setInterval(() => {
        const candle = makeReplayCandle(price, cursor);
        price = candle.close;
        ws.send(JSON.stringify({
          type: 'REPLAY_CANDLE',
          data: {
            symbol,
            time: Math.floor(startTime + cursor * 60),
            ...Object.fromEntries(Object.entries(candle).map(([k, v]) => [k, Number(v.toFixed ? v.toFixed(2) : v)]))
          }
        }));
        cursor += 1;
      }, 1000 / speed);
    }

    if (message.type === 'STOP_REPLAY') clearInterval(replayInterval);
  });

  const liveTicker = setInterval(() => {
    Object.keys(symbols).forEach((symbol) => {
      ws.send(JSON.stringify({ type: 'CANDLE', data: nextCandle(symbol) }));
    });
  }, 1000);

  ws.on('close', () => {
    clearInterval(liveTicker);
    clearInterval(replayInterval);
  });
});

console.log(`WebSocket service running on ${process.env.WS_PORT || 8080}`);
