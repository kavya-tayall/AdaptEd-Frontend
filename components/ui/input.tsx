// components/ui/input.tsx
"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          // base
          "w-full min-w-0 bg-white border border-[var(--step-border)] px-4",
          "text-[var(--step-text)] placeholder:text-[var(--step-darkgrey)]",
          "outline-none transition-colors",
          // focus = change border only (no outer/inner ring)
          "focus-visible:border-[var(--step-accent)]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
