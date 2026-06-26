"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const axis = { stroke: "hsl(var(--muted-foreground))", fontSize: 12 };
const grid = "hsl(var(--border))";
const colors = ["#10b981", "#38bdf8", "#f59e0b", "#f43f5e", "#a78bfa"];

export function EquityChart({ data }: { data: { date: string; equity: number; pnl?: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="date" {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #253044", borderRadius: 8 }} />
        <Area type="monotone" dataKey="equity" stroke="#10b981" fill="url(#equity)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PnlBarChart<T extends { pnl: number }>({ data, nameKey = "name" }: { data: T[]; nameKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey={nameKey} {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #253044", borderRadius: 8 }} />
        <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
          {data.map((item, index) => (
            <Cell key={index} fill={Number(item.pnl) >= 0 ? "#10b981" : "#f43f5e"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WinLossPie({ wins, losses }: { wins: number; losses: number }) {
  const data = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses }
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie dataKey="value" data={data} innerRadius={62} outerRadius={92} paddingAngle={3}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #253044", borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function WinRateChart({ data }: { data: { date: string; winRate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis dataKey="date" {...axis} />
        <YAxis {...axis} />
        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #253044", borderRadius: 8 }} />
        <Line type="monotone" dataKey="winRate" stroke="#38bdf8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
