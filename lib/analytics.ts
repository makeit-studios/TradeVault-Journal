import { addDays, format, startOfMonth, startOfWeek, isAfter, isSameDay, subDays, getDay, getHours } from "date-fns";
import type { Trade, TradingAccount } from "@prisma/client";

interface TradeSummary {
  totalPnl: number;
  totalTrades: number;
  winRate: number;
  averageRr: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  streak: { type: "win" | "loss" | "none"; count: number };
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
}

export function summarizeTrades(trades: Trade[]): TradeSummary {
  const totalPnl = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const wins = trades.filter((trade) => trade.profitLoss > 0);
  const losses = trades.filter((trade) => trade.profitLoss < 0);
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
  const averageWin = wins.length ? wins.reduce((sum, trade) => sum + trade.profitLoss, 0) / wins.length : 0;
  const averageLoss = losses.length ? Math.abs(losses.reduce((sum, trade) => sum + trade.profitLoss, 0) / losses.length) : 0;
  const averageRr = averageLoss ? averageWin / averageLoss : 0;
  const grossProfit = wins.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trade) => sum + trade.profitLoss, 0));
  const profitFactor = grossLoss ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const bestTrade = trades.length ? Math.max(...trades.map((t) => t.profitLoss)) : 0;
  const worstTrade = trades.length ? Math.min(...trades.map((t) => t.profitLoss)) : 0;

  const sorted = trades.slice().sort((a, b) => a.tradeDate.getTime() - b.tradeDate.getTime());
  let streak: TradeSummary["streak"] = { type: "none", count: 0 };
  if (sorted.length) {
    let count = 1;
    const last = sorted[sorted.length - 1].profitLoss;
    const type = last > 0 ? "win" : last < 0 ? "loss" : "none";
    for (let i = sorted.length - 2; i >= 0; i--) {
      if ((type === "win" && sorted[i].profitLoss > 0) || (type === "loss" && sorted[i].profitLoss < 0)) {
        count++;
      } else {
        break;
      }
    }
    streak = { type, count };
  }

  const today = new Date();
  const weekStart = startOfWeek(today);
  const monthStart = startOfMonth(today);

  return {
    totalPnl,
    totalTrades: trades.length,
    winRate,
    averageRr: Math.round(averageRr * 100) / 100,
    averageWin,
    averageLoss,
    profitFactor: profitFactor === Infinity ? 999 : Math.round(profitFactor * 100) / 100,
    bestTrade,
    worstTrade,
    streak,
    dailyPnl: trades.filter((trade) => isSameDay(trade.tradeDate, today)).reduce((sum, trade) => sum + trade.profitLoss, 0),
    weeklyPnl: trades.filter((trade) => isAfter(trade.tradeDate, weekStart)).reduce((sum, trade) => sum + trade.profitLoss, 0),
    monthlyPnl: trades.filter((trade) => isAfter(trade.tradeDate, monthStart)).reduce((sum, trade) => sum + trade.profitLoss, 0)
  };
}

interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
}

export function buildEquityCurve(trades: Trade[], startingBalance = 0): EquityPoint[] {
  let equity = startingBalance;
  return trades
    .slice()
    .sort((a, b) => a.tradeDate.getTime() - b.tradeDate.getTime())
    .map((trade) => {
      equity += trade.profitLoss;
      return {
        date: format(trade.tradeDate, "MMM d"),
        equity: Math.round(equity * 100) / 100,
        pnl: trade.profitLoss
      };
    });
}

interface DrawdownPoint {
  date: string;
  drawdown: number;
}

export function buildDrawdownCurve(trades: Trade[]): DrawdownPoint[] {
  let peak = 0;
  let current = 0;
  return trades
    .slice()
    .sort((a, b) => a.tradeDate.getTime() - b.tradeDate.getTime())
    .map((trade) => {
      current += trade.profitLoss;
      if (current > peak) peak = current;
      const dd = peak > 0 ? Math.round(((peak - current) / peak) * 100 * 100) / 100 : 0;
      return { date: format(trade.tradeDate, "MMM d"), drawdown: dd };
    });
}

interface GroupItem {
  name: string;
  pnl: number;
  trades: number;
  [key: string]: string | number;
}

export function groupPnlBy(trades: Trade[], key: keyof Pick<Trade, "symbol" | "strategyTag" | "session">): GroupItem[] {
  const groups = new Map<string, GroupItem>();
  for (const trade of trades) {
    const name = String(trade[key] || "Unknown");
    const current = groups.get(name) ?? { name, pnl: 0, trades: 0 };
    current.pnl += trade.profitLoss;
    current.trades += 1;
    groups.set(name, current);
  }
  return Array.from(groups.values()).sort((a, b) => b.pnl - a.pnl);
}

interface MonthlyPnl {
  month: string;
  pnl: number;
}

export function buildMonthlyPnl(trades: Trade[]): MonthlyPnl[] {
  const groups = new Map<string, number>();
  for (const trade of trades) {
    const label = format(trade.tradeDate, "MMM yyyy");
    groups.set(label, (groups.get(label) ?? 0) + trade.profitLoss);
  }
  return Array.from(groups.entries()).map(([month, pnl]) => ({ month, pnl }));
}

interface DayOfWeekPnl {
  day: string;
  pnl: number;
  trades: number;
  winRate: number;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function groupPnlByDayOfWeek(trades: Trade[]): DayOfWeekPnl[] {
  const groups = new Map<number, { pnl: number; trades: number; wins: number }>();
  for (const trade of trades) {
    const day = getDay(trade.tradeDate);
    const current = groups.get(day) ?? { pnl: 0, trades: 0, wins: 0 };
    current.pnl += trade.profitLoss;
    current.trades += 1;
    if (trade.profitLoss > 0) current.wins += 1;
    groups.set(day, current);
  }
  const result: DayOfWeekPnl[] = [];
  for (let i = 1; i <= 5; i++) {
    const data = groups.get(i) ?? { pnl: 0, trades: 0, wins: 0 };
    result.push({
      day: DAY_NAMES[i].slice(0, 3),
      pnl: Math.round(data.pnl * 100) / 100,
      trades: data.trades,
      winRate: data.trades ? Math.round((data.wins / data.trades) * 100) : 0
    });
  }
  return result;
}

interface HourlyPnl {
  hour: string;
  pnl: number;
  trades: number;
}

export function groupPnlByHour(trades: Trade[]): HourlyPnl[] {
  const groups = new Map<number, { pnl: number; trades: number }>();
  for (const trade of trades) {
    const hour = getHours(trade.tradeDate);
    const current = groups.get(hour) ?? { pnl: 0, trades: 0 };
    current.pnl += trade.profitLoss;
    current.trades += 1;
    groups.set(hour, current);
  }
  const result: HourlyPnl[] = [];
  for (let h = 0; h < 24; h++) {
    const data = groups.get(h) ?? { pnl: 0, trades: 0 };
    result.push({
      hour: `${h.toString().padStart(2, "0")}:00`,
      pnl: Math.round(data.pnl * 100) / 100,
      trades: data.trades
    });
  }
  return result;
}

export function buildRMultipleDistribution(trades: Trade[]) {
  const rMultiples = trades
    .map((t) => t.rMultiple)
    .filter((r): r is number => r !== null && Number.isFinite(r));

  const buckets = [
    { min: -Infinity, max: -3, label: "< -3R" },
    { min: -3, max: -2, label: "-3R" },
    { min: -2, max: -1, label: "-2R" },
    { min: -1, max: 0, label: "-1R" },
    { min: 0, max: 1, label: "+1R" },
    { min: 1, max: 2, label: "+2R" },
    { min: 2, max: 3, label: "+3R" },
    { min: 3, max: Infinity, label: "> +3R" }
  ];

  const distribution = buckets.map((bucket) => ({
    name: bucket.label,
    count: rMultiples.filter((r) => r > bucket.min && r <= bucket.max).length
  }));

  return distribution;
}

interface EmotionPnl {
  emotion: string;
  pnl: number;
  trades: number;
  wins: number;
}

export function groupPnlByEmotion(trades: Trade[]): EmotionPnl[] {
  const groups = new Map<string, { pnl: number; trades: number; wins: number }>();
  for (const trade of trades) {
    if (!trade.emotions) continue;
    for (const emotion of trade.emotions.split(",").map((e) => e.trim()).filter(Boolean)) {
      const current = groups.get(emotion) ?? { pnl: 0, trades: 0, wins: 0 };
      current.pnl += trade.profitLoss;
      current.trades += 1;
      if (trade.profitLoss > 0) current.wins += 1;
      groups.set(emotion, current);
    }
  }
  return Array.from(groups.entries()).map(([emotion, data]) => ({
    emotion,
    pnl: Math.round(data.pnl * 100) / 100,
    trades: data.trades,
    wins: data.wins
  })).sort((a, b) => b.pnl - a.pnl);
}

interface TimeframePnl {
  timeframe: string;
  pnl: number;
  trades: number;
  wins: number;
}

export function groupPnlByTimeframe(trades: Trade[]): TimeframePnl[] {
  const groups = new Map<string, { pnl: number; trades: number; wins: number }>();
  for (const trade of trades) {
    const tf = trade.timeframe || "Unknown";
    const current = groups.get(tf) ?? { pnl: 0, trades: 0, wins: 0 };
    current.pnl += trade.profitLoss;
    current.trades += 1;
    if (trade.profitLoss > 0) current.wins += 1;
    groups.set(tf, current);
  }
  return Array.from(groups.entries()).map(([timeframe, data]) => ({
    timeframe,
    pnl: Math.round(data.pnl * 100) / 100,
    trades: data.trades,
    wins: data.wins
  })).sort((a, b) => b.pnl - a.pnl);
}

interface ScatterPoint {
  tradeNumber: number;
  pnl: number;
  rMultiple: number | null;
}

export function buildScatterData(trades: Trade[]): ScatterPoint[] {
  return trades
    .slice()
    .sort((a, b) => a.tradeDate.getTime() - b.tradeDate.getTime())
    .map((trade, index) => ({
      tradeNumber: index + 1,
      pnl: trade.profitLoss,
      rMultiple: trade.rMultiple
    }));
}

interface CalendarDay {
  date: Date;
  label: string;
  weekday: string;
  pnl: number;
  trades: number;
  wins: number;
}

export function buildCalendarDays(trades: Trade[], monthOffset = 0): CalendarDay[] {
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthStart = startOfMonth(targetMonth);
  const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });

  const days: CalendarDay[] = [];
  const cursor = new Date(startDate);
  while (days.length < 35) {
    const dayTrades = trades.filter((trade) => isSameDay(trade.tradeDate, cursor));
    days.push({
      date: new Date(cursor),
      label: format(cursor, "d"),
      weekday: format(cursor, "EEE"),
      pnl: dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
      trades: dayTrades.length,
      wins: dayTrades.filter((t) => t.profitLoss > 0).length
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function getRuleHealth(account: TradingAccount, trades: Trade[]) {
  const totalPnl = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const todayPnl = trades
    .filter((trade) => isSameDay(trade.tradeDate, new Date()))
    .reduce((sum, trade) => sum + trade.profitLoss, 0);
  const remainingDailyDrawdown = account.dailyDrawdown + Math.min(todayPnl, 0);
  const remainingMaxDrawdown = account.maxDrawdown + Math.min(totalPnl, 0);
  const targetProgress = Math.max(0, Math.min(100, (totalPnl / account.profitTarget) * 100));
  const ruleHealth = Math.min(
    100,
    Math.max(0, Math.min(remainingDailyDrawdown / account.dailyDrawdown, remainingMaxDrawdown / account.maxDrawdown) * 100)
  );

  return {
    remainingDailyDrawdown,
    remainingMaxDrawdown,
    targetProgress,
    ruleHealth,
    warning: ruleHealth < 35 ? "Close to breach" : ruleHealth < 60 ? "Needs attention" : "Healthy"
  };
}
