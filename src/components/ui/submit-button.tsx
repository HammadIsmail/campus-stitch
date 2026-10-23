"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingText?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable SubmitButton leveraging React 19 / React-DOM's `useFormStatus` hook.
 * Automatically displays a loading spinner and disables the button when the enclosing <form> action is pending.
 * (Official doc: https://react.dev/reference/react-dom/hooks/useFormStatus)
 */
export function SubmitButton({
  pendingText = "Submitting...",
  children,
  className,
  icon,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin shrink-0" />
          <span>{pendingText}</span>
        </>
      ) : (
        <>
          {children}
          {icon && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
