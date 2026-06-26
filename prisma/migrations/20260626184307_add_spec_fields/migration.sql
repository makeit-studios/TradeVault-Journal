-- CreateTable
CREATE TABLE "TradeImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradeImage_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL DEFAULT 'MONTHLY',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyJournal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "preMarketPlan" TEXT,
    "marketNotes" TEXT,
    "eodReflection" TEXT,
    "mood" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3859F9',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payout_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payout" ("accountId", "amount", "createdAt", "date", "id", "notes", "paymentMethod", "status", "updatedAt", "userId") SELECT "accountId", "amount", "createdAt", "date", "id", "notes", "paymentMethod", "status", "updatedAt", "userId" FROM "Payout";
DROP TABLE "Payout";
ALTER TABLE "new_Payout" RENAME TO "Payout";
CREATE INDEX "Payout_userId_idx" ON "Payout"("userId");
CREATE INDEX "Payout_accountId_idx" ON "Payout"("accountId");
CREATE TABLE "new_PsychologyEntry" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PsychologyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PsychologyEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PsychologyEntry_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PsychologyEntry" ("accountId", "confidenceRating", "createdAt", "dailyReflection", "date", "emotionsAfter", "emotionsBefore", "id", "mistakesMade", "tradeId", "updatedAt", "userId") SELECT "accountId", "confidenceRating", "createdAt", "dailyReflection", "date", "emotionsAfter", "emotionsBefore", "id", "mistakesMade", "tradeId", "updatedAt", "userId" FROM "PsychologyEntry";
DROP TABLE "PsychologyEntry";
ALTER TABLE "new_PsychologyEntry" RENAME TO "PsychologyEntry";
CREATE INDEX "PsychologyEntry_userId_idx" ON "PsychologyEntry"("userId");
CREATE INDEX "PsychologyEntry_accountId_idx" ON "PsychologyEntry"("accountId");
CREATE TABLE "new_Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "marketType" TEXT,
    "side" TEXT NOT NULL,
    "entryPrice" REAL NOT NULL,
    "exitPrice" REAL,
    "stopLoss" REAL,
    "takeProfit" REAL,
    "lotSize" REAL NOT NULL,
    "riskPercent" REAL NOT NULL,
    "profitLoss" REAL NOT NULL,
    "status" TEXT DEFAULT 'UNKNOWN',
    "rrRatio" REAL,
    "rMultiple" REAL,
    "rating" INTEGER,
    "timeframe" TEXT,
    "tradeDate" DATETIME NOT NULL,
    "session" TEXT NOT NULL,
    "strategyTag" TEXT NOT NULL DEFAULT '',
    "emotions" TEXT,
    "mistakes" TEXT,
    "preTradePlan" TEXT,
    "postTradeReflection" TEXT,
    "notes" TEXT,
    "beforeScreenshot" TEXT,
    "afterScreenshot" TEXT,
    "annotatedScreenshot" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Trade_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TradingAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Trade" ("accountId", "afterScreenshot", "beforeScreenshot", "createdAt", "entryPrice", "exitPrice", "id", "lotSize", "notes", "profitLoss", "riskPercent", "session", "side", "stopLoss", "strategyTag", "symbol", "takeProfit", "tradeDate", "updatedAt", "userId") SELECT "accountId", "afterScreenshot", "beforeScreenshot", "createdAt", "entryPrice", "exitPrice", "id", "lotSize", "notes", "profitLoss", "riskPercent", "session", "side", "stopLoss", "strategyTag", "symbol", "takeProfit", "tradeDate", "updatedAt", "userId" FROM "Trade";
DROP TABLE "Trade";
ALTER TABLE "new_Trade" RENAME TO "Trade";
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");
CREATE INDEX "Trade_accountId_idx" ON "Trade"("accountId");
CREATE INDEX "Trade_tradeDate_idx" ON "Trade"("tradeDate");
CREATE TABLE "new_TradingAccount" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TradingAccount" ("accountType", "broker", "createdAt", "currency", "currentBalance", "dailyDrawdown", "id", "maxDrawdown", "minTradingDays", "name", "profitTarget", "startingBalance", "status", "updatedAt", "userId") SELECT "accountType", "broker", "createdAt", "currency", "currentBalance", "dailyDrawdown", "id", "maxDrawdown", "minTradingDays", "name", "profitTarget", "startingBalance", "status", "updatedAt", "userId" FROM "TradingAccount";
DROP TABLE "TradingAccount";
ALTER TABLE "new_TradingAccount" RENAME TO "TradingAccount";
CREATE INDEX "TradingAccount_userId_idx" ON "TradingAccount"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "image", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "image", "name", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TradeImage_tradeId_idx" ON "TradeImage"("tradeId");

-- CreateIndex
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");

-- CreateIndex
CREATE INDEX "DailyJournal_userId_idx" ON "DailyJournal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyJournal_userId_date_key" ON "DailyJournal"("userId", "date");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_category_label_key" ON "Tag"("userId", "category", "label");
