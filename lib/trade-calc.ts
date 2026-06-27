export function calcStatus(pnl: number): string {
  if (pnl > 0) return "WIN";
  if (pnl < 0) return "LOSS";
  return "BREAKEVEN";
}

export function calcRR(entry: number, stopLoss: number | null, takeProfit: number | null): number | null {
  if (!stopLoss || !takeProfit) return null;
  const risk = Math.abs(entry - stopLoss);
  if (risk === 0) return null;
  return Math.round((Math.abs(takeProfit - entry) / risk) * 100) / 100;
}

export function calcRMultiple(entry: number, stopLoss: number | null, pnl: number, lotSize: number): number | null {
  if (!stopLoss) return null;
  const risk = Math.abs(entry - stopLoss) * lotSize;
  if (risk === 0) return null;
  return Math.round((pnl / risk) * 100) / 100;
}
