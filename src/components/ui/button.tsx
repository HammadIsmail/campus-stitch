import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white hover:bg-zinc-800 shadow-sm border border-black",
        destructive: "bg-zinc-900 text-white hover:bg-red-700 shadow-sm",
        outline:
          "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100 hover:border-zinc-400 shadow-xs",
        secondary:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200/80",
        ghost: "hover:bg-zinc-100 text-zinc-700 hover:text-black",
        dark: "bg-black text-white hover:bg-zinc-900 shadow-sm",
        link: "text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 text-sm",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-13 rounded-xl px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
