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
            className="flex h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm font-sans text-white placeholder:text-soft-gray/50 focus-visible:outline-none focus-visible:border-brand-gold focus-visible:shadow-[inset_0_-2px_0_#F9CC6F]"
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
            className="flex h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm font-sans text-white placeholder:text-soft-gray/50 focus-visible:outline-none focus-visible:border-brand-gold focus-visible:shadow-[inset_0_-2px_0_#F9CC6F]"
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
          className="flex h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm font-sans text-white placeholder:text-soft-gray/50 focus-visible:outline-none focus-visible:border-brand-gold focus-visible:shadow-[inset_0_-2px_0_#F9CC6F]"
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
          className="flex h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm font-sans text-white placeholder:text-soft-gray/50 focus-visible:outline-none focus-visible:border-brand-gold focus-visible:shadow-[inset_0_-2px_0_#F9CC6F]"
          readOnly={pnl !== ""}
        />
        {pnl !== "" ? (
          <p className="text-xs text-soft-gray">Auto-calculated. Edit manually if needed.</p>
        ) : null}
      </div>

      <div className="rounded-lg bg-dark-surface p-3 text-sm">
        <p className="text-soft-gray">R-Multiple</p>
        <p className="font-medium text-white">Auto-calculated from entry, stop loss, and P/L</p>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex h-10 items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer">
              <input type="radio" name="rating" value={star} className="peer sr-only" onChange={() => setRating(star)} />
              <span className={`text-xl ${rating >= star ? "text-brand-gold" : "text-soft-gray/30"}`}>★</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
