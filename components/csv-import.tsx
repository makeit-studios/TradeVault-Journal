"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImportResult {
  imported: number;
  errors: Array<{ row: number; message: string }>;
  total: number;
}

export function CsvImport() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/trades/import", { method: "POST", body: formData });
    const data = await res.json();

    if (data.imported !== undefined) {
      setResult(data);
    } else {
      setResult({ imported: 0, errors: [{ row: 0, message: data.message }], total: 0 });
    }

    setLoading(false);
    formRef.current?.reset();
  }

  return (
    <details className="relative" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
        CSV import
      </summary>
      <div className="absolute right-0 top-6 z-10 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
        <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Upload a CSV with columns: symbol,side,entryPrice,lotSize,profitLoss,tradeDate
          </p>
          <Input name="file" type="file" accept=".csv" required disabled={loading} />
          <Button type="submit" size="sm" className="w-full" disabled={loading}>
            {loading ? "Importing..." : "Upload CSV"}
          </Button>
        </form>
        {result ? (
          <div className="mt-3 space-y-1 text-xs">
            <p className={result.imported > 0 ? "text-emerald-300" : "text-rose-300"}>
              {result.imported} / {result.total} trades imported
            </p>
            {result.errors.length > 0 ? (
              <div className="mt-1 max-h-32 overflow-y-auto space-y-0.5">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-rose-400">
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
}
