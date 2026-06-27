import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold font-sans transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[#F6BF4A] rounded-pill",
        secondary: "bg-transparent text-soft-gray hover:text-brand-gold hover:bg-white/5 rounded-sm",
        ghost: "hover:bg-white/5 hover:text-brand-gold rounded-sm",
        outline: "border border-dark-surface bg-dark-charcoal text-soft-gray hover:text-brand-gold hover:border-medium-gray rounded-sm",
        destructive: "bg-error-red text-white hover:bg-error-red/90 rounded-sm"
      },
      size: {
        default: "h-[52px] px-3",
        sm: "h-9 px-3 rounded-sm",
        lg: "h-11 px-6",
        icon: "h-[28px] w-[28px] rounded-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
