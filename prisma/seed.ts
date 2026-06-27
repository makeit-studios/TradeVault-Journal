import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calcStatus, calcRR, calcRMultiple } from "../lib/trade-calc";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@tradevault.app" },
    update: {},
    create: {
      name: "Demo Trader",
      email: "demo@tradevault.app",
      password
    }
  });

  await prisma.tag.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.dailyJournal.deleteMany({ where: { userId: user.id } });
  await prisma.psychologyEntry.deleteMany({ where: { userId: user.id } });
  await prisma.payout.deleteMany({ where: { userId: user.id } });
  await prisma.tradeImage.deleteMany({ where: { trade: { userId: user.id } } });
  await prisma.trade.deleteMany({ where: { userId: user.id } });
  await prisma.tradingAccount.deleteMany({ where: { userId: user.id } });

  const ftmo = await prisma.tradingAccount.create({
    data: {
      userId: user.id,
      name: "FTMO Challenge 100K",
      broker: "FTMO",
      accountType: "Prop firm challenge",
      startingBalance: 100000,
      currentBalance: 101592,
      profitTarget: 10000,
      dailyDrawdown: 5000,
      maxDrawdown: 10000,
      minTradingDays: 10,
      status: "ACTIVE",
      currency: "USD"
    }
  });

  const personal = await prisma.tradingAccount.create({
    data: {
      userId: user.id,
      name: "Personal Swing",
      broker: "IC Markets",
      accountType: "Personal account",
      startingBalance: 25000,
      currentBalance: 26045,
      profitTarget: 5000,
      dailyDrawdown: 1250,
      maxDrawdown: 2500,
      minTradingDays: 0,
      status: "FUNDED",
      currency: "USD"
    }
  });

  const trades = [
    ["EURUSD", "Forex", "BUY", 1.0732, 1.0789, 1.0708, 1.081, 1.2, 0.8, 684, -24, "London", "Liquidity sweep", "Waited for displacement after stop run.", "Calm, focused", "", "Yes"],
    ["NAS100", "Indices", "SELL", 18420, 18312, 18468, 18260, 0.6, 0.7, 648, -22, "New York", "Opening range", "Clean rejection from premarket high.", "Confident", "", ""],
    ["XAUUSD", "Commodities", "BUY", 2328.4, 2319.2, 2322, 2342, 0.8, 0.6, -736, -18, "New York", "Breakout retest", "Entered before candle close.", "Anxious", "Early entry", ""],
    ["GBPUSD", "Forex", "SELL", 1.2675, 1.2621, 1.2702, 1.259, 1, 0.75, 540, -16, "London", "Trend continuation", "Good management after partial close.", "Disciplined", "", "Yes"],
    ["USDJPY", "Forex", "BUY", 155.18, 155.72, 154.94, 156.05, 1.4, 0.9, 756, -12, "Asian", "Mean reversion", "Followed checklist, clean risk.", "Calm", "", ""],
    ["US30", "Indices", "SELL", 38980, 39040, 39035, 38820, 0.5, 0.5, -300, -9, "New York", "Supply zone", "Moved stop too late.", "FOMO", "Moved SL", ""],
    ["AUDUSD", "Forex", "BUY", 0.6621, 0.6662, 0.6604, 0.668, 1.1, 0.7, 451, -6, "London", "Order block", "Patient entry at discount.", "Calm", "", ""],
    ["EURJPY", "Forex", "SELL", 166.85, 166.19, 167.12, 165.74, 0.9, 0.65, 594, -3, "London", "Session reversal", "Strong execution.", "Confident", "", "Yes"]
  ] as const;

  for (const [symbol, marketType, side, entryPrice, exitPrice, stopLoss, takeProfit, lotSize, riskPercent, profitLoss, dayOffset, session, strategyTag, notes, emotions, mistakes, isGood] of trades) {
    const tradeDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
    const accountId = symbol === "AUDUSD" || symbol === "EURJPY" ? personal.id : ftmo.id;
    await prisma.trade.create({
      data: {
        userId: user.id,
        accountId,
        symbol,
        marketType,
        side,
        entryPrice,
        exitPrice,
        stopLoss,
        takeProfit,
        lotSize,
        riskPercent,
        profitLoss,
        status: calcStatus(profitLoss),
        rrRatio: calcRR(entryPrice, stopLoss, takeProfit),
        rMultiple: calcRMultiple(entryPrice, stopLoss, profitLoss, lotSize),
        rating: profitLoss > 0 ? 4 : 2,
        timeframe: "H1",
        tradeDate,
        session,
        strategyTag,
        emotions,
        mistakes: mistakes || null,
        preTradePlan: isGood ? `Planned ${side} on ${symbol} based on ${session.toLowerCase()} session analysis.` : null,
        postTradeReflection: isGood ? "Followed the plan. Entries matched criteria." : "Deviated from plan. Need stricter filter.",
        notes
      }
    });
  }

  await prisma.payout.createMany({
    data: [
      {
        userId: user.id,
        accountId: personal.id,
        amount: 1250,
        date: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
        status: "APPROVED",
        paymentMethod: "Bank transfer",
        notes: "First partial withdrawal."
      },
      {
        userId: user.id,
        accountId: personal.id,
        amount: 900,
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: "PENDING",
        paymentMethod: "Wise",
        notes: "Awaiting broker approval."
      }
    ]
  });

  await prisma.psychologyEntry.createMany({
    data: [
      {
        userId: user.id,
        accountId: ftmo.id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        emotionsBefore: "Calm, focused",
        emotionsAfter: "Satisfied",
        confidenceRating: 8,
        mistakesMade: "Could have journaled screenshots sooner.",
        dailyReflection: "Best trades came after waiting for confirmation."
      },
      {
        userId: user.id,
        accountId: personal.id,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        emotionsBefore: "A little impatient",
        emotionsAfter: "Neutral",
        confidenceRating: 6,
        mistakesMade: "Entered one candle early.",
        dailyReflection: "Need to keep the pre-session routine tighter."
      }
    ]
  });

  const tagData = [
    { category: "SETUP", label: "Liquidity sweep", color: "#3859F9" },
    { category: "SETUP", label: "Opening range", color: "#3BD3FD" },
    { category: "SETUP", label: "Breakout retest", color: "#CC089E" },
    { category: "SETUP", label: "Trend continuation", color: "#9170E6" },
    { category: "SETUP", label: "Mean reversion", color: "#038FF7" },
    { category: "SETUP", label: "Supply zone", color: "#EEF673" },
    { category: "SETUP", label: "Order block", color: "#3859F9" },
    { category: "SETUP", label: "Session reversal", color: "#3BD3FD" },
    { category: "EMOTION", label: "Calm", color: "#10b981" },
    { category: "EMOTION", label: "Confident", color: "#3859F9" },
    { category: "EMOTION", label: "Anxious", color: "#f59e0b" },
    { category: "EMOTION", label: "Disciplined", color: "#10b981" },
    { category: "EMOTION", label: "FOMO", color: "#f43f5e" },
    { category: "EMOTION", label: "Revenge", color: "#f43f5e" },
    { category: "EMOTION", label: "Bored", color: "#79756D" },
    { category: "MISTAKE", label: "Early entry", color: "#f59e0b" },
    { category: "MISTAKE", label: "Moved SL", color: "#f43f5e" },
    { category: "MISTAKE", label: "Overtraded", color: "#f43f5e" },
    { category: "MISTAKE", label: "Ignored plan", color: "#f43f5e" },
    { category: "MISTAKE", label: "Late entry", color: "#f59e0b" },
    { category: "MISTAKE", label: "Early exit", color: "#f59e0b" }
  ];

  for (const tag of tagData) {
    await prisma.tag.create({ data: { userId: user.id, ...tag } });
  }

  await prisma.goal.createMany({
    data: [
      { userId: user.id, type: "MONTHLY_PNL", targetValue: 2000, currentValue: 1637, period: "MONTHLY", active: true },
      { userId: user.id, type: "WIN_RATE", targetValue: 65, currentValue: 75, period: "MONTHLY", active: true },
      { userId: user.id, type: "MAX_DAILY_LOSS", targetValue: 500, currentValue: 0, period: "DAILY", active: true },
      { userId: user.id, type: "MIN_RR", targetValue: 1.5, currentValue: 1.82, period: "MONTHLY", active: true },
      { userId: user.id, type: "MAX_TRADES", targetValue: 3, currentValue: 0, period: "DAILY", active: true }
    ]
  });

  await prisma.dailyJournal.create({
    data: {
      userId: user.id,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      preMarketPlan: "Watch EURUSD for continuation above 1.0750. NAS100 if we get a weekly low retest.",
      marketNotes: "London session was the main driver. Good moves on FX pairs, NAS100 had a clean rejection.",
      eodReflection: "Solid day. Followed the plan for the most part. The loss on XAUUSD was a mental slip — entered too early before confirmation.",
      mood: "Positive"
    }
  });

  console.log("Seed complete. Demo login: demo@tradevault.app / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
