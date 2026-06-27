"use client";

import { useEffect, useRef } from "react";

export function PnlCalculator() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const entryInput = document.querySelector<HTMLInputElement>("input[name='entryPrice']");
    const exitInput = document.querySelector<HTMLInputElement>("input[name='exitPrice']");
    const lotInput = document.querySelector<HTMLInputElement>("input[name='lotSize']");
    const sideSelect = document.querySelector<HTMLSelectElement>("select[name='side']");
    const pnlInput = document.querySelector<HTMLInputElement>("input[name='profitLoss']");

    function update() {
      if (!entryInput || !exitInput || !lotInput || !sideSelect || !pnlInput) return;
      const entry = parseFloat(entryInput.value);
      const exit = parseFloat(exitInput.value);
      const lot = parseFloat(lotInput.value);
      if (isNaN(entry) || isNaN(exit) || isNaN(lot) || lot <= 0) {
        pnlInput.readOnly = false;
        return;
      }
      const diff = sideSelect.value === "BUY" ? (exit - entry) : (entry - exit);
      const result = Math.round(diff * lot * 100000 * 100) / 100;
      if (isFinite(result)) {
        pnlInput.value = String(result);
        pnlInput.readOnly = true;
      } else {
        pnlInput.readOnly = false;
      }
    }

    [entryInput, exitInput, lotInput, sideSelect].forEach((el) => {
      el?.addEventListener("input", update);
      el?.addEventListener("change", update);
    });

    return () => {
      [entryInput, exitInput, lotInput, sideSelect].forEach((el) => {
        el?.removeEventListener("input", update);
        el?.removeEventListener("change", update);
      });
    };
  }, []);

  return null;
}
