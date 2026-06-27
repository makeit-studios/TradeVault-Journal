"use client";

import { useState } from "react";

export function StarRating() {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex h-10 items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star} className="cursor-pointer">
          <input type="radio" name="rating" value={star} className="peer sr-only" onChange={() => setRating(star)} />
          <span className={`text-xl ${rating >= star ? "text-amber-400" : "text-muted-foreground"}`}>★</span>
        </label>
      ))}
    </div>
  );
}
