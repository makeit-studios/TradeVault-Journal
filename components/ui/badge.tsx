import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-sm px-2 py-1 text-xs font-semibold font-sans border", {
  variants: {
    variant: {
      default: "bg-brand-gold/10 text-brand-gold border-brand-gold",
      positive: "bg-success-green/10 text-success-green border-success-green",
      negative: "bg-error-red/10 text-error-red border-error-red",
      warning: "bg-warning-amber/10 text-warning-amber border-warning-amber",
      muted: "bg-dark-surface text-soft-gray border-dark-surface"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};
