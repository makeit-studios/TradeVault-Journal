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
      <label className="text-sm font-normal text-soft-gray">{label}</label>
      <div className="relative">
        <input type="hidden" name={name} value={selected} />
        <button
          type="button"
          onClick={() => { setOpen(!open); setSearch(""); }}
          className="flex h-14 w-full items-center justify-between rounded-lg border border-dark-surface bg-dark-charcoal px-3 text-sm text-white"
        >
          <span className={selected ? "text-white" : "text-soft-gray/50"}>{selected || placeholder || "Select..."}</span>
          <ChevronDown className="h-4 w-4 text-soft-gray" />
        </button>
        {open ? (
          <div className="absolute left-0 top-15 z-20 w-full rounded-lg border border-dark-surface bg-dark-charcoal shadow-l2">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or type new..."
              className="w-full border-b border-dark-surface bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-soft-gray/50"
              autoFocus
            />
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setSelected(option); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition hover:bg-white/5",
                    selected === option && "bg-brand-gold/10"
                  )}
                >
                  <Check className={cn("h-4 w-4", selected === option ? "text-brand-gold" : "text-transparent")} />
                  {option}
                </button>
              ))}
              {showAddNew ? (
                <button
                  type="button"
                  onClick={() => { setSelected(search); setOpen(false); }}
                  className="flex w-full items-center gap-2 border-t border-dark-surface px-3 py-2 text-left text-sm text-brand-gold transition hover:bg-white/5"
                >
                  <Plus className="h-4 w-4" />
                  Add &quot;{search}&quot;
                </button>
              ) : null}
              {filtered.length === 0 && !showAddNew && !allowCustom ? (
                <p className="px-3 py-2 text-sm text-soft-gray/50">No options found</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
