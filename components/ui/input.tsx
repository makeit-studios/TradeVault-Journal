import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-14 w-full rounded-xl border-0 border-b border-medium-gray bg-transparent px-0 pb-1.5 pt-5 text-sm font-sans text-white placeholder:text-soft-gray/50 focus-visible:outline-none focus-visible:border-brand-gold focus-visible:shadow-[inset_0_-2px_0_#F9CC6F] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";
