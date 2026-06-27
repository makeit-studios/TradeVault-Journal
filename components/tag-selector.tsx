"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  name: string;
  options: string[];
  defaultValue?: string;
}

export const TagSelector = ({ name, options, defaultValue = "" }: TagSelectorProps) => {
  const [selected, setSelected] = useState(new Set(defaultValue ? defaultValue.split(",").map((s) => s.trim()).filter(Boolean) : []));

  const toggle = (tag: string) => {
    const next = new Set(selected);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelected(next);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      <input type="hidden" name={name} value={Array.from(selected).join(",")} />
      {options.map((option) => {
        const isSelected = selected.has(option);
        return (
          <button
            type="button"
            key={option}
            onClick={() => toggle(option)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isSelected ? "bg-brand-gold text-black" : "bg-dark-surface text-soft-gray hover:bg-dark-surface/80"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};
