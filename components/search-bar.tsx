"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/journal?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/journal");
    }
    inputRef.current?.blur();
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden max-w-md flex-1 md:block">
      <Search className="absolute left-3 top-3 h-4 w-4 text-soft-gray" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search symbols, strategies, accounts..."
        className="h-11 w-full rounded-lg border border-dark-surface bg-dark-charcoal pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-soft-gray/50 focus:border-brand-gold"
      />
    </form>
  );
}
