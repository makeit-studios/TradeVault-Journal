import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("rounded-xl border border-dark-surface bg-dark-charcoal text-foreground shadow-l1", className)} {...props} />;
};

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} {...props} />;
};

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return <h3 className={cn("text-base font-semibold text-white", className)} {...props} />;
};

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn("text-sm text-soft-gray", className)} {...props} />;
};

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("p-6", className)} {...props} />;
};
