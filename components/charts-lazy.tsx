import dynamic from "next/dynamic";

export const EquityChart = dynamic(() => import("@/components/charts").then((m) => ({ default: m.EquityChart })), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse rounded-lg bg-secondary/40" />
});

export const PnlBarChart = dynamic(() => import("@/components/charts").then((m) => ({ default: m.PnlBarChart })), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-lg bg-secondary/40" />
});

export const WinLossPie = dynamic(() => import("@/components/charts").then((m) => ({ default: m.WinLossPie })), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-lg bg-secondary/40" />
});

export const WinRateChart = dynamic(() => import("@/components/charts").then((m) => ({ default: m.WinRateChart })), {
  ssr: false,
  loading: () => <div className="h-[260px] animate-pulse rounded-lg bg-secondary/40" />
});
