import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-[#D0D5DD] dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-base text-[#101828] dark:text-zinc-100 placeholder:text-[#98A2B3] dark:placeholder:text-zinc-500 focus:border-[#0F766E] dark:focus:border-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-2xs",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
