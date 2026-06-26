import type { InputHTMLAttributes } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { updateTrade } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { TagSelector } from "@/components/tag-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function EditTradePage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const [trade, accounts] = await Promise.all([
    prisma.trade.findFirstOrThrow({ where: { id: params.id, userId: user.id } }),
    prisma.tradingAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
  ]);

  return (
    <>
      <PageHeader title="Edit Trade" description="Adjust execution details and keep account balance reconciled." />
      <Card className="max-w-3xl">
        <CardHeader><CardTitle>{trade.symbol} trade details</CardTitle></CardHeader>
        <CardContent>
          <form action={updateTrade} className="grid gap-4">
            <input type="hidden" name="id" value={trade.id} />
            <div className="space-y-2">
              <Label>Account</Label>
              <select name="accountId" defaultValue={trade.accountId} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field name="symbol" label="Symbol" defaultValue={trade.symbol} />
              <div className="space-y-2">
                <Label>Side</Label>
                <select name="side" defaultValue={trade.side} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>BUY</option><option>SELL</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Market type</Label>
                <select name="marketType" defaultValue={trade.marketType ?? ""} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Auto</option>
                  <option>FOREX</option>
                  <option>CRYPTO</option>
                  <option>STOCKS</option>
                  <option>FUTURES</option>
                  <option>OPTIONS</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <select name="timeframe" defaultValue={trade.timeframe ?? ""} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select</option>
                  <option>M1</option>
                  <option>M5</option>
                  <option>M15</option>
                  <option>M30</option>
                  <option>H1</option>
                  <option>H4</option>
                  <option>D1</option>
                  <option>W1</option>
                  <option>MN</option>
                </select>
              </div>
            </div>
            <details className="rounded-lg border border-border bg-secondary/20 p-3">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Entry / Exit</summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field name="entryPrice" label="Entry" type="number" step="any" defaultValue={trade.entryPrice} />
                <Field name="exitPrice" label="Exit" type="number" step="any" defaultValue={trade.exitPrice ?? 0} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field name="stopLoss" label="Stop loss" type="number" step="any" defaultValue={trade.stopLoss ?? 0} />
                <Field name="takeProfit" label="Take profit" type="number" step="any" defaultValue={trade.takeProfit ?? 0} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field name="lotSize" label="Lot size" type="number" step="any" defaultValue={trade.lotSize} />
                <Field name="riskPercent" label="Risk %" type="number" step="any" defaultValue={trade.riskPercent} />
              </div>
            </details>
            <div className="grid grid-cols-2 gap-3">
              <Field name="profitLoss" label="Profit / loss" type="number" step="any" defaultValue={trade.profitLoss} />
              <Field name="tradeDate" label="Trade date" type="date" defaultValue={format(trade.tradeDate, "yyyy-MM-dd")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <select name="status" defaultValue={trade.status ?? ""} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Auto (from P/L)</option>
                  <option>WIN</option>
                  <option>LOSS</option>
                  <option>BREAKEVEN</option>
                  <option>PENDING</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex h-10 items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="cursor-pointer">
                      <input type="radio" name="rating" value={star} defaultChecked={trade.rating === star} className="peer sr-only" />
                      <span className="text-xl text-muted-foreground peer-checked:text-amber-400">★</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <details className="rounded-lg border border-border bg-secondary/20 p-3">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Plan & Reflection</summary>
              <div className="mt-3 space-y-2">
                <Label>Pre-trade plan</Label>
                <Textarea name="preTradePlan" defaultValue={trade.preTradePlan ?? ""} placeholder="Confluence, bias, entry trigger, invalidation..." />
              </div>
              <div className="mt-3 space-y-2">
                <Label>Post-trade reflection</Label>
                <Textarea name="postTradeReflection" defaultValue={trade.postTradeReflection ?? ""} placeholder="What went well? What would you change?" />
              </div>
              <div className="mt-3 space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" defaultValue={trade.notes ?? ""} />
              </div>
            </details>
            <details className="rounded-lg border border-border bg-secondary/20 p-3">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Psychology</summary>
              <div className="mt-3 space-y-2">
                <Label>Emotions before / during</Label>
                <TagSelector name="emotions" options={["Calm", "Anxious", "Confident", "Greedy", "Fearful", "Frustrated", "Neutral", "Excited", "Revenge", "Overtrading"]} defaultValue={trade.emotions ?? ""} />
              </div>
              <div className="mt-3 space-y-2">
                <Label>Mistakes made</Label>
                <TagSelector name="mistakes" options={["FOMO", "Sizing too big", "No stop loss", "Moving SL", "Revenge trading", "Overtrading", "Early exit", "Late entry", "Ignoring HTF", "Not following plan"]} defaultValue={trade.mistakes ?? ""} />
              </div>
            </details>
            <div className="grid grid-cols-2 gap-3">
              <Field name="session" label="Session" defaultValue={trade.session} />
              <Field name="strategyTag" label="Strategy" defaultValue={trade.strategyTag} />
            </div>
            <details className="rounded-lg border border-border bg-secondary/20 p-3">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">Screenshots</summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field name="beforeScreenshot" label="Before entry" type="file" accept="image/*" required={false} />
                <Field name="afterScreenshot" label="After exit" type="file" accept="image/*" required={false} />
              </div>
              <div className="mt-3">
                <Field name="annotatedScreenshot" label="Annotated chart" type="file" accept="image/*" required={false} />
              </div>
            </details>
            <div className="flex gap-3">
              <Button>Save changes</Button>
              <Button asChild variant="outline"><Link href="/journal">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

const Field = ({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) => {
  return <div className="space-y-2"><Label>{label}</Label><Input required {...props} /></div>;
};
