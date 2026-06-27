"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";

export function TradeResultFields() {
  const [pnl, setPnl] = useState<number | "">("");
  const [entry, setEntry] = useState<string>("");
  const [exit, setExit] = useState<string>("");
  const [lotSize, setLotSize] = useState<string>("");
  const [side, setSide] = useState<string>("BUY");
  const [rating, setRating] = useState(0);

  function calcPnl(entryVal: string, exitVal: string, lotVal: string, sideVal: string) {
    const e = parseFloat(entryVal);
    const x = parseFloat(exitVal);
    const l = parseFloat(lotVal);
    if (isNaN(e) || isNaN(x) || isNaN(l) || l <= 0) {
      setPnl("");
      return;
    }
    const diff = sideVal === "BUY" ? (x - e) : (e - x);
    const result = Math.round(diff * l * 100000 * 100) / 100;
    setPnl(result);
  }

  function handleEntryChange(val: string) {
    setEntry(val);
    calcPnl(val, exit, lotSize, side);
  }

  function handleExitChange(val: string) {
    setExit(val);
    calcPnl(entry, val, lotSize, side);
  }

  function handleLotChange(val: string) {
    setLotSize(val);
    calcPnl(entry, exit, val, side);
  }

  function handleSideChange(val: string) {
    setSide(val);
    calcPnl(entry, exit, lotSize, val);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Entry price</Label>
          <input
            name="entryPrice"
            type="number"
            step="any"
            required
            value={entry}
            onChange={(e) => handleEntryChange(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Exit price</Label>
          <input
            name="exitPrice"
            type="number"
            step="any"
            required
            value={exit}
            onChange={(e) => handleExitChange(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lot size</Label>
        <input
          name="lotSize"
          type="number"
          step="any"
          required
          value={lotSize}
          onChange={(e) => handleLotChange(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>Profit / loss</Label>
        <input
          name="profitLoss"
          type="number"
          step="any"
          required
          value={pnl === "" ? "" : pnl}
          onChange={(e) => setPnl(e.target.value === "" ? "" : parseFloat(e.target.value))}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          readOnly={pnl !== ""}
        />
        {pnl !== "" ? (
          <p className="text-xs text-muted-foreground">Auto-calculated. Edit manually if needed.</p>
        ) : null}
      </div>

      <div className="rounded-md bg-secondary/40 p-3 text-sm">
        <p className="text-muted-foreground">R-Multiple</p>
        <p className="font-medium">Auto-calculated from entry, stop loss, and P/L</p>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex h-10 items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer">
              <input type="radio" name="rating" value={star} className="peer sr-only" onChange={() => setRating(star)} />
              <span className={`text-xl ${rating >= star ? "text-amber-400" : "text-muted-foreground"}`}>★</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
