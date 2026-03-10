export function calculateLivePnl(position, currentPrice) {
  return (Number(currentPrice) - Number(position.entry_price)) * Number(position.quantity) * (position.order_type === 'BUY' ? 1 : -1);
}

export function riskRewardRatio(entryPrice, stopLoss, target) {
  if (!stopLoss || !target) return null;
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(target - entryPrice);
  if (risk === 0) return null;
  return Number((reward / risk).toFixed(2));
}

export function shouldAutoClose(position, currentPrice) {
  const price = Number(currentPrice);
  const stopLoss = Number(position.stop_loss);
  const target = Number(position.target);

  if (position.order_type === 'BUY') {
    if (position.stop_loss && price <= stopLoss) return true;
    if (position.target && price >= target) return true;
  }

  if (position.order_type === 'SELL') {
    if (position.stop_loss && price >= stopLoss) return true;
    if (position.target && price <= target) return true;
  }

  return false;
}
