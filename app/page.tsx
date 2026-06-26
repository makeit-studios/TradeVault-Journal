import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  { icon: BarChart3, label: "Performance analytics", text: "Equity curve, win rate, monthly PnL, and strategy breakdowns." },
  { icon: ShieldCheck, label: "Prop firm rules", text: "Track drawdown, targets, trading days, and rule health in one view." },
  { icon: WalletCards, label: "Payout tracking", text: "Monitor pending, approved, and requested payouts across accounts." }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="container grid min-h-screen gap-10 py-8 lg:grid-cols-[1fr_520px] lg:items-center">
        <div className="max-w-3xl animate-fade-up">
          <div className="mb-5 inline-flex rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
            TradeVault Journal
          </div>
          <h1 className="text-5xl font-semibold tracking-normal text-white md:text-7xl">
            A premium control room for serious traders.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Manage accounts, log trades, analyze execution, protect prop firm rules, and keep your trading psychology visible without bolting together spreadsheets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                Start journaling <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">View demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Demo seed login: demo@tradevault.app / password123</p>
        </div>

        <div className="glass-panel rounded-lg p-4 shadow-2xl">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P/L</p>
                <p className="text-4xl font-semibold text-emerald-300">$2,637</p>
              </div>
              <div className="rounded-md bg-primary/15 px-3 py-2 text-sm text-primary">+8.4%</div>
            </div>
            <div className="mt-8 h-48 rounded-md border border-border bg-[linear-gradient(135deg,rgba(16,185,129,.22),rgba(14,165,233,.08))] p-4">
              <div className="h-full rounded border border-white/10 bg-background/45" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-secondary p-3">
                <p className="text-muted-foreground">Win rate</p>
                <p className="mt-1 text-xl font-semibold">75%</p>
              </div>
              <div className="rounded-md bg-secondary p-3">
                <p className="text-muted-foreground">Avg RR</p>
                <p className="mt-1 text-xl font-semibold">1.82</p>
              </div>
              <div className="rounded-md bg-secondary p-3">
                <p className="text-muted-foreground">Trades</p>
                <p className="mt-1 text-xl font-semibold">128</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-4 pb-16 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5">
              <item.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-semibold">{item.label}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
