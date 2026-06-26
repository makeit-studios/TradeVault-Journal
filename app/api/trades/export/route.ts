import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    where: { userId: session.user.id },
    include: { account: true },
    orderBy: { tradeDate: "desc" }
  });

  const headers = [
    "Date", "Symbol", "MarketType", "Direction", "Entry", "Exit",
    "StopLoss", "TakeProfit", "LotSize", "P&L", "Status", "R:R",
    "R-Multiple", "Rating", "Session", "Strategy", "Timeframe",
    "Emotions", "Mistakes", "Account", "Notes"
  ].join(",");

  const rows = trades.map((trade) =>
    [
      trade.tradeDate.toISOString().split("T")[0],
      trade.symbol,
      trade.marketType || "",
      trade.side,
      trade.entryPrice,
      trade.exitPrice ?? "",
      trade.stopLoss ?? "",
      trade.takeProfit ?? "",
      trade.lotSize,
      trade.profitLoss,
      trade.status || "",
      trade.rrRatio ?? "",
      trade.rMultiple ?? "",
      trade.rating ?? "",
      trade.session,
      trade.strategyTag,
      trade.timeframe || "",
      `"${trade.emotions || ""}"`,
      `"${trade.mistakes || ""}"`,
      trade.account.name,
      `"${(trade.notes || "").replace(/"/g, '""')}"`
    ].join(",")
  ).join("\n");

  const csv = `${headers}\n${rows}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tradevault-export-${new Date().toISOString().split("T")[0]}.csv"`
    }
  });
}
