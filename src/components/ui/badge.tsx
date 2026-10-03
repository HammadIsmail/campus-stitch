import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black",
  {
    variants: {
      variant: {
        default: "border border-black bg-black text-white shadow-2xs",
        secondary: "border border-zinc-200 bg-zinc-100 text-zinc-900",
        destructive:
          "border border-zinc-300 bg-zinc-100 text-zinc-900 font-bold",
        outline: "text-zinc-900 border border-zinc-300 bg-white",
        warning: "border border-zinc-300 bg-zinc-100 text-zinc-800",
        verified: "border border-black/20 bg-zinc-900 text-white font-medium",
        muted: "border border-zinc-200 bg-zinc-50 text-zinc-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
