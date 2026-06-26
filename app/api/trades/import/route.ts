import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const csvTradeSchema = z.object({
  date: z.string(),
  symbol: z.string().min(1),
  marketType: z.string().optional(),
  direction: z.enum(["BUY", "SELL"]),
  entry: z.coerce.number().finite(),
  exit: z.coerce.number().finite().optional(),
  stopLoss: z.coerce.number().finite().optional(),
  takeProfit: z.coerce.number().finite().optional(),
  lotSize: z.coerce.number().positive(),
  profitLoss: z.coerce.number().finite(),
  status: z.string().optional(),
  session: z.string().optional(),
  strategy: z.string().optional(),
  timeframe: z.string().optional(),
  emotions: z.string().optional(),
  mistakes: z.string().optional(),
  accountName: z.string().optional(),
  notes: z.string().optional()
});

function calcStatus(pnl: number): string {
  if (pnl > 0) return "WIN";
  if (pnl < 0) return "LOSS";
  return "BREAKEVEN";
}

function calcRR(entry: number, sl: number | null, tp: number | null): number | null {
  if (!sl || !tp) return null;
  const risk = Math.abs(entry - sl);
  if (risk === 0) return null;
  return Math.round((Math.abs(tp - entry) / risk) * 100) / 100;
}

function calcRMultiple(entry: number, sl: number | null, pnl: number, lotSize: number): number | null {
  if (!sl) return null;
  const risk = Math.abs(entry - sl) * lotSize;
  if (risk === 0) return null;
  return Math.round((pnl / risk) * 100) / 100;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawTrades = Array.isArray(body) ? body : body.trades;

    if (!Array.isArray(rawTrades) || rawTrades.length === 0) {
      return NextResponse.json({ message: "Provide an array of trades." }, { status: 400 });
    }

    const accounts = await prisma.tradingAccount.findMany({ where: { userId: session.user.id } });
    const defaultAccountId = accounts[0]?.id;
    if (!defaultAccountId) {
      return NextResponse.json({ message: "Create a trading account first." }, { status: 400 });
    }

    let imported = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rawTrades.length; i++) {
      const parsed = csvTradeSchema.safeParse(rawTrades[i]);
      if (!parsed.success) {
        errors.push({ row: i + 1, message: parsed.error.flatten().formErrors.join(", ") });
        continue;
      }

      const row = parsed.data;
      const accountName = row.accountName ?? "";
      const matchedAccount = accountName ? accounts.find((a) => a.name.toLowerCase() === accountName.toLowerCase()) : undefined;
      const accountId = matchedAccount?.id ?? defaultAccountId;
      const sl = row.stopLoss ?? null;
      const tp = row.takeProfit ?? null;
      const entry = row.entry;
      const pnl = row.profitLoss;
      const lotSize = row.lotSize;

      await prisma.trade.create({
        data: {
          userId: session.user.id,
          accountId,
          symbol: row.symbol.toUpperCase(),
          marketType: row.marketType || null,
          side: row.direction,
          entryPrice: entry,
          exitPrice: row.exit ?? null,
          stopLoss: sl,
          takeProfit: tp,
          lotSize,
          riskPercent: 0,
          profitLoss: pnl,
          status: row.status || calcStatus(pnl),
          rrRatio: calcRR(entry, sl, tp),
          rMultiple: calcRMultiple(entry, sl, pnl, lotSize),
          timeframe: row.timeframe || null,
          tradeDate: new Date(row.date),
          session: row.session || "",
          strategyTag: row.strategy || "",
          emotions: row.emotions || null,
          mistakes: row.mistakes || null,
          notes: row.notes || null
        }
      });

      await prisma.tradingAccount.update({
        where: { id: accountId },
        data: { currentBalance: { increment: pnl } }
      });

      imported++;
    }

    return NextResponse.json({ imported, errors, total: rawTrades.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
