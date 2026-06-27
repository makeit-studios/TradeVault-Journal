import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStatus, calcRR, calcRMultiple } from "@/lib/trade-calc";

const COLUMN_ALIASES: Record<string, string> = {
  date: "date", tradeDate: "date", "trade date": "date",
  symbol: "symbol", pair: "symbol",
  direction: "direction", side: "direction",
  entry: "entry", entryPrice: "entry", "entry price": "entry",
  exit: "exit", exitPrice: "exit", "exit price": "exit",
  stopLoss: "stopLoss", sl: "stopLoss", "stop loss": "stopLoss",
  takeProfit: "takeProfit", tp: "takeProfit", "take profit": "takeProfit",
  lotSize: "lotSize", lots: "lotSize", size: "lotSize",
  profitLoss: "profitLoss", pnl: "profitLoss", "p&l": "profitLoss", "p/l": "profitLoss",
  status: "status",
  session: "session",
  strategy: "strategy", strategyTag: "strategy", "strategy tag": "strategy",
  emotions: "emotions", emotion: "emotions",
  mistakes: "mistakes", mistake: "mistakes",
  accountName: "accountName", account: "accountName", "account name": "accountName",
  notes: "notes", note: "notes",
  rating: "rating",
  riskPercent: "riskPercent", "risk %": "riskPercent", riskPct: "riskPercent"
};

const REQUIRED_COLUMNS = ["date", "symbol", "direction", "entry", "lotSize", "profitLoss"];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const headers = rawHeaders.map((h) => COLUMN_ALIASES[h.toLowerCase()] || h);

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    let valid = false;
    for (let j = 0; j < headers.length && j < values.length; j++) {
      if (values[j]) { row[headers[j]] = values[j]; valid = true; }
    }
    if (valid) rows.push(row);
  }
  return rows;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let rawTrades: Record<string, string>[];

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ message: "Upload a valid CSV file." }, { status: 400 });
      }
      const text = await (file as Blob).text();
      rawTrades = parseCSV(text);
    } else {
      const body = await request.json();
      const arr = Array.isArray(body) ? body : body.trades;
      if (!Array.isArray(arr)) {
        return NextResponse.json({ message: "Provide an array of trades or upload a CSV file." }, { status: 400 });
      }
      rawTrades = arr;
    }

    if (rawTrades.length === 0) {
      return NextResponse.json({ message: "No trades found in the file." }, { status: 400 });
    }

    const accounts = await prisma.tradingAccount.findMany({ where: { userId: session.user.id } });
    const defaultAccountId = accounts[0]?.id;
    if (!defaultAccountId) {
      return NextResponse.json({ message: "Create a trading account first." }, { status: 400 });
    }

    let imported = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rawTrades.length; i++) {
      const row = rawTrades[i];
      const missing = REQUIRED_COLUMNS.filter((c) => !row[c]);
      if (missing.length) {
        errors.push({ row: i + 1, message: `Missing required columns: ${missing.join(", ")}` });
        continue;
      }

      const side = row.direction.toUpperCase();
      if (side !== "BUY" && side !== "SELL") {
        errors.push({ row: i + 1, message: `Invalid direction "${row.direction}". Use BUY or SELL.` });
        continue;
      }

      const entry = Number(row.entry);
      const exit = row.exit ? Number(row.exit) : undefined;
      const sl = row.stopLoss ? Number(row.stopLoss) : null;
      const tp = row.takeProfit ? Number(row.takeProfit) : null;
      const lotSize = Number(row.lotSize);
      const pnl = Number(row.profitLoss);

      if (!Number.isFinite(entry)) { errors.push({ row: i + 1, message: "Invalid entry price." }); continue; }
      if (!Number.isFinite(lotSize) || lotSize <= 0) { errors.push({ row: i + 1, message: "Invalid lot size." }); continue; }
      if (!Number.isFinite(pnl)) { errors.push({ row: i + 1, message: "Invalid profit/loss." }); continue; }

      const accountName = row.accountName ?? "";
      const matchedAccount = accountName ? accounts.find((a) => a.name.toLowerCase() === accountName.toLowerCase()) : undefined;
      const accountId = matchedAccount?.id ?? defaultAccountId;

      await prisma.trade.create({
        data: {
          userId: session.user.id,
          accountId,
          symbol: row.symbol.toUpperCase(),
          side,
          entryPrice: entry,
          exitPrice: exit ?? null,
          stopLoss: sl,
          takeProfit: tp,
          lotSize,
          riskPercent: row.riskPercent ? Number(row.riskPercent) : 0,
          profitLoss: pnl,
          status: row.status || calcStatus(pnl),
          rrRatio: calcRR(entry, sl, tp),
          rMultiple: calcRMultiple(entry, sl, pnl, lotSize),
          rating: row.rating ? Number(row.rating) : null,
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
