PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "TradingAccount" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "broker" TEXT NOT NULL,
  "accountType" TEXT NOT NULL,
  "startingBalance" REAL NOT NULL,
  "currentBalance" REAL NOT NULL,
  "profitTarget" REAL NOT NULL,
  "dailyDrawdown" REAL NOT NULL,
  "maxDrawdown" REAL NOT NULL,
  "minTradingDays" INTEGER NOT NULL DEFAULT 5,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Trade" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "side" TEXT NOT NULL,
  "entryPrice" REAL NOT NULL,
  "exitPrice" REAL,
  "stopLoss" REAL,
  "takeProfit" REAL,
  "lotSize" REAL NOT NULL,
  "riskPercent" REAL NOT NULL,
  "profitLoss" REAL NOT NULL,
  "tradeDate" DATETIME NOT NULL,
  "session" TEXT NOT NULL,
  "strategyTag" TEXT NOT NULL,
  "notes" TEXT,
  "beforeScreenshot" TEXT,
  "afterScreenshot" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Payout" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "date" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "paymentMethod" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Payout_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "PsychologyEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT,
  "tradeId" TEXT,
  "date" DATETIME NOT NULL,
  "emotionsBefore" TEXT NOT NULL,
  "emotionsAfter" TEXT NOT NULL,
  "confidenceRating" INTEGER NOT NULL,
  "mistakesMade" TEXT,
  "dailyReflection" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PsychologyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PsychologyEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "PsychologyEntry_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "TradingAccount_userId_idx" ON "TradingAccount"("userId");
CREATE INDEX IF NOT EXISTS "Trade_userId_idx" ON "Trade"("userId");
CREATE INDEX IF NOT EXISTS "Trade_accountId_idx" ON "Trade"("accountId");
CREATE INDEX IF NOT EXISTS "Trade_tradeDate_idx" ON "Trade"("tradeDate");
CREATE INDEX IF NOT EXISTS "Payout_userId_idx" ON "Payout"("userId");
CREATE INDEX IF NOT EXISTS "Payout_accountId_idx" ON "Payout"("accountId");
CREATE INDEX IF NOT EXISTS "PsychologyEntry_userId_idx" ON "PsychologyEntry"("userId");
CREATE INDEX IF NOT EXISTS "PsychologyEntry_accountId_idx" ON "PsychologyEntry"("accountId");

PRAGMA foreign_keys=ON;
