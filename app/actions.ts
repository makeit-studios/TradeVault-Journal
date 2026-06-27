"use server";

import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { calcStatus, calcRR, calcRMultiple } from "@/lib/trade-calc";

const MAX_UPLOAD_SIZE = 4 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

function numberFrom(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

async function saveUpload(file: File | null, prefix: string) {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Upload must be 4MB or smaller.");
  }
  const extension = ALLOWED_UPLOAD_TYPES.get(file.type);
  if (!extension) {
    throw new Error("Only JPG, PNG, WebP, or GIF images are supported.");
  }
  const fileName = `${prefix}-${randomUUID()}.${extension}`;
  const blob = await put(fileName, file, { access: "public" });
  return blob.url;
}

const tradeSchema = z.object({
  accountId: z.string().min(1),
  symbol: z.string().min(1),
  marketType: z.string().default(""),
  side: z.enum(["BUY", "SELL"]),
  entryPrice: z.coerce.number().finite(),
  exitPrice: z.coerce.number().finite().optional(),
  stopLoss: z.coerce.number().finite().optional(),
  takeProfit: z.coerce.number().finite().optional(),
  lotSize: z.coerce.number().positive(),
  riskPercent: z.coerce.number().min(0).default(0),
  profitLoss: z.coerce.number().finite(),
  status: z.string().default(""),
  timeframe: z.string().default(""),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  tradeDate: z.string().min(1),
  session: z.string().default(""),
  strategyTag: z.string().default(""),
  emotions: z.string().default(""),
  mistakes: z.string().default(""),
  preTradePlan: z.string().default(""),
  postTradeReflection: z.string().default(""),
  notes: z.string().default("")
});

export async function createAccount(formData: FormData) {
  const user = await requireUser();
  await prisma.tradingAccount.create({
    data: {
      userId: user.id,
      name: String(formData.get("name")),
      broker: String(formData.get("broker")),
      accountType: String(formData.get("accountType")),
      startingBalance: numberFrom(formData, "startingBalance"),
      currentBalance: numberFrom(formData, "currentBalance"),
      profitTarget: numberFrom(formData, "profitTarget"),
      dailyDrawdown: numberFrom(formData, "dailyDrawdown"),
      maxDrawdown: numberFrom(formData, "maxDrawdown"),
      minTradingDays: numberFrom(formData, "minTradingDays", 0),
      status: String(formData.get("status")),
      currency: String(formData.get("currency") || "USD")
    }
  });
  revalidatePath("/accounts");
}

export async function deleteAccount(formData: FormData) {
  const user = await requireUser();
  await prisma.tradingAccount.deleteMany({
    where: { id: String(formData.get("id")), userId: user.id }
  });
  revalidatePath("/accounts");
}

export async function createTrade(formData: FormData) {
  const user = await requireUser();

  const raw = {
    accountId: String(formData.get("accountId")),
    symbol: String(formData.get("symbol") || "").toUpperCase(),
    marketType: String(formData.get("marketType") || ""),
    side: String(formData.get("side")),
    entryPrice: formData.get("entryPrice"),
    exitPrice: formData.get("exitPrice") || undefined,
    stopLoss: formData.get("stopLoss") || undefined,
    takeProfit: formData.get("takeProfit") || undefined,
    lotSize: formData.get("lotSize"),
    riskPercent: formData.get("riskPercent") || undefined,
    profitLoss: formData.get("profitLoss"),
    timeframe: String(formData.get("timeframe") || ""),
    rating: formData.get("rating") || undefined,
    tradeDate: String(formData.get("tradeDate")),
    session: String(formData.get("session") || ""),
    strategyTag: String(formData.get("strategyTag") || ""),
    emotions: String(formData.get("emotions") || ""),
    mistakes: String(formData.get("mistakes") || ""),
    preTradePlan: String(formData.get("preTradePlan") || ""),
    postTradeReflection: String(formData.get("postTradeReflection") || ""),
    notes: String(formData.get("notes") || "")
  };

  const parsed = tradeSchema.parse(raw);

  const account = await prisma.tradingAccount.findFirst({ where: { id: parsed.accountId, userId: user.id } });
  if (!account) throw new Error("Trading account not found.");

  const beforeScreenshot = await saveUpload(formData.get("beforeScreenshot") as File | null, "before");
  const afterScreenshot = await saveUpload(formData.get("afterScreenshot") as File | null, "after");
  const annotatedScreenshot = await saveUpload(formData.get("annotatedScreenshot") as File | null, "annotated");

  const entry = parsed.entryPrice;
  const sl = parsed.stopLoss ?? null;
  const tp = parsed.takeProfit ?? null;
  const pnl = parsed.profitLoss;
  const lotSize = parsed.lotSize;

  await prisma.$transaction([
    prisma.trade.create({
      data: {
        userId: user.id,
        accountId: parsed.accountId,
        symbol: parsed.symbol,
        marketType: parsed.marketType || null,
        side: parsed.side,
        entryPrice: entry,
        exitPrice: parsed.exitPrice ?? null,
        stopLoss: sl,
        takeProfit: tp,
        lotSize,
        riskPercent: numberFrom(formData, "riskPercent"),
        profitLoss: pnl,
        status: parsed.status || calcStatus(pnl),
        rrRatio: calcRR(entry, sl, tp),
        rMultiple: calcRMultiple(entry, sl, pnl, lotSize),
        rating: parsed.rating ?? null,
        timeframe: parsed.timeframe || null,
        tradeDate: new Date(parsed.tradeDate),
        session: parsed.session,
        strategyTag: parsed.strategyTag,
        emotions: parsed.emotions || null,
        mistakes: parsed.mistakes || null,
        preTradePlan: parsed.preTradePlan || null,
        postTradeReflection: parsed.postTradeReflection || null,
        notes: parsed.notes || null,
        beforeScreenshot,
        afterScreenshot,
        annotatedScreenshot
      }
    }),
    prisma.tradingAccount.update({
      where: { id: parsed.accountId },
      data: { currentBalance: { increment: pnl } }
    })
  ]);

  revalidatePath("/journal");
  revalidatePath("/dashboard");
}

export async function deleteTrade(formData: FormData) {
  const user = await requireUser();
  const trade = await prisma.trade.findFirst({
    where: { id: String(formData.get("id")), userId: user.id }
  });
  if (!trade) return;
  await prisma.$transaction([
    prisma.trade.delete({ where: { id: trade.id } }),
    prisma.tradingAccount.update({
      where: { id: trade.accountId },
      data: { currentBalance: { decrement: trade.profitLoss } }
    })
  ]);
  revalidatePath("/journal");
  revalidatePath("/dashboard");
}

export async function updateTrade(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));

  const raw = {
    accountId: String(formData.get("accountId")),
    symbol: String(formData.get("symbol") || "").toUpperCase(),
    marketType: String(formData.get("marketType") || ""),
    side: String(formData.get("side")),
    entryPrice: formData.get("entryPrice"),
    exitPrice: formData.get("exitPrice") || undefined,
    stopLoss: formData.get("stopLoss") || undefined,
    takeProfit: formData.get("takeProfit") || undefined,
    lotSize: formData.get("lotSize"),
    riskPercent: formData.get("riskPercent") || undefined,
    profitLoss: formData.get("profitLoss"),
    timeframe: String(formData.get("timeframe") || ""),
    rating: formData.get("rating") || undefined,
    tradeDate: String(formData.get("tradeDate")),
    session: String(formData.get("session") || ""),
    strategyTag: String(formData.get("strategyTag") || ""),
    emotions: String(formData.get("emotions") || ""),
    mistakes: String(formData.get("mistakes") || ""),
    preTradePlan: String(formData.get("preTradePlan") || ""),
    postTradeReflection: String(formData.get("postTradeReflection") || ""),
    notes: String(formData.get("notes") || "")
  };

  const parsed = tradeSchema.parse(raw);

  const existingTrade = await prisma.trade.findFirst({ where: { id, userId: user.id } });
  if (!existingTrade) throw new Error("Trade not found.");

  const account = await prisma.tradingAccount.findFirst({ where: { id: parsed.accountId, userId: user.id } });
  if (!account) throw new Error("Trading account not found.");

  const beforeScreenshot = await saveUpload(formData.get("beforeScreenshot") as File | null, "before");
  const afterScreenshot = await saveUpload(formData.get("afterScreenshot") as File | null, "after");
  const annotatedScreenshot = await saveUpload(formData.get("annotatedScreenshot") as File | null, "annotated");

  const entry = parsed.entryPrice;
  const sl = parsed.stopLoss ?? null;
  const tp = parsed.takeProfit ?? null;
  const pnl = parsed.profitLoss;
  const lotSize = parsed.lotSize;
  const balanceDelta = pnl - existingTrade.profitLoss;

  const updateData: Prisma.TradeUncheckedUpdateInput = {
    accountId: parsed.accountId,
    symbol: parsed.symbol,
    marketType: parsed.marketType || null,
    side: parsed.side,
    entryPrice: entry,
    exitPrice: parsed.exitPrice ?? null,
    stopLoss: sl,
    takeProfit: tp,
    lotSize,
    riskPercent: numberFrom(formData, "riskPercent"),
    profitLoss: pnl,
    status: parsed.status || calcStatus(pnl),
    rrRatio: calcRR(entry, sl, tp),
    rMultiple: calcRMultiple(entry, sl, pnl, lotSize),
    rating: parsed.rating ?? null,
    timeframe: parsed.timeframe || null,
    tradeDate: new Date(parsed.tradeDate),
    session: parsed.session,
    strategyTag: parsed.strategyTag,
    emotions: parsed.emotions || null,
    mistakes: parsed.mistakes || null,
    preTradePlan: parsed.preTradePlan || null,
    postTradeReflection: parsed.postTradeReflection || null,
    notes: parsed.notes || null,
    beforeScreenshot: beforeScreenshot ?? undefined,
    afterScreenshot: afterScreenshot ?? undefined,
    annotatedScreenshot: annotatedScreenshot ?? undefined
  };

  const balanceUpdates =
    parsed.accountId === existingTrade.accountId
      ? [
          prisma.tradingAccount.update({
            where: { id: parsed.accountId },
            data: { currentBalance: { increment: balanceDelta } }
          })
        ]
      : [
          prisma.tradingAccount.update({
            where: { id: existingTrade.accountId },
            data: { currentBalance: { decrement: existingTrade.profitLoss } }
          }),
          prisma.tradingAccount.update({
            where: { id: parsed.accountId },
            data: { currentBalance: { increment: pnl } }
          })
        ];

  await prisma.$transaction([
    prisma.trade.update({ where: { id }, data: updateData }),
    ...balanceUpdates
  ]);

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  redirect("/journal");
}

export async function createPayout(formData: FormData) {
  const user = await requireUser();
  const accountId = String(formData.get("accountId"));
  const account = await prisma.tradingAccount.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) throw new Error("Trading account not found.");

  await prisma.payout.create({
    data: {
      userId: user.id,
      accountId,
      amount: numberFrom(formData, "amount"),
      date: new Date(String(formData.get("date"))),
      status: String(formData.get("status")),
      paymentMethod: String(formData.get("paymentMethod")),
      notes: String(formData.get("notes") || "")
    }
  });
  revalidatePath("/payouts");
}

export async function createPsychologyEntry(formData: FormData) {
  const user = await requireUser();
  const accountId = String(formData.get("accountId") || "") || null;
  if (accountId) {
    const account = await prisma.tradingAccount.findFirst({ where: { id: accountId, userId: user.id } });
    if (!account) throw new Error("Trading account not found.");
  }

  await prisma.psychologyEntry.create({
    data: {
      userId: user.id,
      accountId,
      date: new Date(String(formData.get("date"))),
      emotionsBefore: String(formData.get("emotionsBefore")),
      emotionsAfter: String(formData.get("emotionsAfter")),
      confidenceRating: numberFrom(formData, "confidenceRating", 5),
      mistakesMade: String(formData.get("mistakesMade") || ""),
      dailyReflection: String(formData.get("dailyReflection"))
    }
  });
  revalidatePath("/psychology");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { name: String(formData.get("name")) }
  });
  revalidatePath("/settings");
  redirect("/settings");
}

export async function createGoal(formData: FormData) {
  const user = await requireUser();
  await prisma.goal.create({
    data: {
      userId: user.id,
      type: String(formData.get("type")),
      targetValue: numberFrom(formData, "targetValue"),
      currentValue: numberFrom(formData, "currentValue", 0),
      period: String(formData.get("period") || "MONTHLY"),
      active: formData.get("active") !== "false"
    }
  });
  revalidatePath("/dashboard");
}

export async function deleteGoal(formData: FormData) {
  const user = await requireUser();
  await prisma.goal.deleteMany({
    where: { id: String(formData.get("id")), userId: user.id }
  });
  revalidatePath("/dashboard");
}

export async function createDailyJournal(formData: FormData) {
  const user = await requireUser();
  await prisma.dailyJournal.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: new Date(String(formData.get("date")))
      }
    },
    update: {
      preMarketPlan: String(formData.get("preMarketPlan") || ""),
      marketNotes: String(formData.get("marketNotes") || ""),
      eodReflection: String(formData.get("eodReflection") || ""),
      mood: String(formData.get("mood") || "")
    },
    create: {
      userId: user.id,
      date: new Date(String(formData.get("date"))),
      preMarketPlan: String(formData.get("preMarketPlan") || ""),
      marketNotes: String(formData.get("marketNotes") || ""),
      eodReflection: String(formData.get("eodReflection") || ""),
      mood: String(formData.get("mood") || "")
    }
  });
  revalidatePath("/journal");
}
