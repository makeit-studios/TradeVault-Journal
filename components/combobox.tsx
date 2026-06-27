"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
  defaultValue?: string;
  allowCustom?: boolean;
}

export function Combobox({ name, label, options, placeholder, defaultValue, allowCustom = true }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(defaultValue || "");
  const [selected, setSelected] = useState(defaultValue || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const showAddNew = allowCustom && search && !options.some((o) => o.toLowerCase() === search.toLowerCase());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
      <div className="relative">
        <input type="hidden" name={name} value={selected} />
        <button
          type="button"
          onClick={() => { setOpen(!open); setSearch(""); }}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <span className={selected ? "" : "text-muted-foreground"}>{selected || placeholder || "Select..."}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        {open ? (
          <div className="absolute left-0 top-11 z-20 w-full rounded-md border border-border bg-card shadow-lg">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or type new..."
              className="w-full border-b border-border bg-transparent px-3 py-2.5 text-sm outline-none"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setSelected(option); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-secondary",
                    selected === option && "bg-secondary"
                  )}
                >
                  <Check className={cn("h-4 w-4", selected === option ? "text-foreground" : "text-transparent")} />
                  {option}
                </button>
              ))}
              {showAddNew ? (
                <button
                  type="button"
                  onClick={() => { setSelected(search); setOpen(false); }}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-primary transition hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                  Add &quot;{search}&quot;
                </button>
              ) : null}
              {filtered.length === 0 && !showAddNew && !allowCustom ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No options found</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
