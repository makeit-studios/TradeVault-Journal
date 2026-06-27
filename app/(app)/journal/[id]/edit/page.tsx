import type { InputHTMLAttributes } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { updateTrade } from "@/app/actions";
import { Combobox } from "@/components/combobox";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/page-header";
import { StarRating } from "@/components/star-rating";
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
  const [trade, accounts, existingSymbols, existingStrategies] = await Promise.all([
    prisma.trade.findFirstOrThrow({ where: { id: params.id, userId: user.id } }),
    prisma.tradingAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.trade.findMany({ where: { userId: user.id, symbol: { not: "" } }, distinct: ["symbol"], select: { symbol: true } }),
    prisma.trade.findMany({ where: { userId: user.id, strategyTag: { not: "" } }, distinct: ["strategyTag"], select: { strategyTag: true } })
  ]);
  const symbols = existingSymbols.map((s) => s.symbol).filter(Boolean).sort();
  const strategies = existingStrategies.map((s) => s.strategyTag).filter(Boolean).sort();

  return (
    <>
      <PageHeader title="Edit Trade" description="Adjust execution details and keep account balance reconciled." />
      <Card className="max-w-3xl">
        <CardHeader><CardTitle>{trade.symbol} trade details</CardTitle></CardHeader>
        <CardContent>
          <form action={updateTrade} className="grid gap-4">
            <input type="hidden" name="id" value={trade.id} />

            <details className="rounded-lg border border-dark-surface bg-dark-charcoal p-3">
              <summary className="cursor-pointer text-sm font-medium text-soft-gray hover:text-brand-gold">Account & Advanced</summary>
              <div className="mt-3 space-y-2">
                <Label>Account</Label>
                <select name="accountId" defaultValue={trade.accountId} className="h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm text-white focus-visible:outline-none focus-visible:border-brand-gold">
                  {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field name="lotSize" label="Lot size" type="number" step="any" defaultValue={trade.lotSize} />
                <Field name="riskPercent" label="Risk %" type="number" step="any" defaultValue={trade.riskPercent} />
              </div>
            </details>

            <p className="text-xs font-semibold text-soft-gray">Trade Info</p>
            <div className="grid grid-cols-2 gap-3">
              <Field name="tradeDate" label="Date" type="date" defaultValue={format(trade.tradeDate, "yyyy-MM-dd")} />
              <Combobox name="session" label="Session" options={["Asian", "London", "New York"]} placeholder="Select session" defaultValue={trade.session || ""} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Combobox name="symbol" label="Instrument" options={symbols} defaultValue={trade.symbol} />
              <div className="space-y-2">
                <Label>Direction</Label>
                <select name="side" defaultValue={trade.side} className="h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm text-white focus-visible:outline-none focus-visible:border-brand-gold">
                  <option>BUY</option><option>SELL</option>
                </select>
              </div>
            </div>
            <Combobox name="strategyTag" label="Strategy / Setup" options={strategies} defaultValue={trade.strategyTag || ""} />

            <p className="text-xs font-semibold text-soft-gray">Entry / Exit</p>
            <div className="grid grid-cols-2 gap-3">
              <Field name="entryPrice" label="Entry price" type="number" step="any" defaultValue={trade.entryPrice} />
              <Field name="exitPrice" label="Exit price" type="number" step="any" defaultValue={trade.exitPrice ?? ""} />
            </div>

            <p className="text-xs font-semibold text-soft-gray">Risk</p>
            <div className="grid grid-cols-2 gap-3">
              <Field name="stopLoss" label="Stop loss" type="number" step="any" defaultValue={trade.stopLoss ?? ""} required={false} />
              <Field name="takeProfit" label="Take profit" type="number" step="any" defaultValue={trade.takeProfit ?? ""} required={false} />
            </div>

            <p className="text-xs font-semibold text-soft-gray">Result</p>
            <Field name="profitLoss" label="Profit / loss" type="number" step="any" defaultValue={trade.profitLoss} />
            <div className="rounded-lg bg-dark-surface p-3 text-sm">
              <p className="text-soft-gray">R-Multiple</p>
              <p className="font-medium text-white">{trade.rMultiple ? `${trade.rMultiple.toFixed(2)}R` : "Auto-calculated from entry, stop loss, and P/L"}</p>
            </div>

            <details className="rounded-lg border border-dark-surface bg-dark-charcoal p-3">
              <summary className="cursor-pointer text-sm font-medium text-soft-gray hover:text-brand-gold">Notes & Psychology</summary>
              <div className="mt-3 space-y-2">
                <Label>Status</Label>
                <select name="status" defaultValue={trade.status ?? ""} className="h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm text-white focus-visible:outline-none focus-visible:border-brand-gold">
                  <option value="">Auto (from P/L)</option>
                  <option>WIN</option>
                  <option>LOSS</option>
                  <option>BREAKEVEN</option>
                  <option>PENDING</option>
                </select>
              </div>
              <div className="mt-3 space-y-2">
                <Label>Rating</Label>
                <StarRating />
              </div>
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
              <div className="mt-3 space-y-2">
                <Label>Emotions before / during</Label>
                <TagSelector name="emotions" options={["Calm", "Anxious", "Confident", "Greedy", "Fearful", "Frustrated", "Neutral", "Excited", "Revenge", "Overtrading"]} defaultValue={trade.emotions ?? ""} />
              </div>
              <div className="mt-3 space-y-2">
                <Label>Mistakes made</Label>
                <TagSelector name="mistakes" options={["FOMO", "Sizing too big", "No stop loss", "Moving SL", "Revenge trading", "Overtrading", "Early exit", "Late entry", "Ignoring HTF", "Not following plan"]} defaultValue={trade.mistakes ?? ""} />
              </div>
            </details>

            <details className="rounded-lg border border-dark-surface bg-dark-charcoal p-3">
              <summary className="cursor-pointer text-sm font-medium text-soft-gray hover:text-brand-gold">Screenshots</summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ImageUpload name="beforeScreenshot" label="Before entry" />
                <ImageUpload name="afterScreenshot" label="After exit" />
              </div>
              <div className="mt-3">
                <ImageUpload name="annotatedScreenshot" label="Annotated chart" />
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
