"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium select-none transition-colors " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 " +
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring-accent)]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-[var(--step-border)] bg-white hover:bg-[var(--step-superlight)] text-[var(--step-text)]",
        ghost: "hover:bg-[var(--step-superlight)]",
        link: "text-[var(--step-accent)] underline-offset-4 hover:underline",
        // Figma CTA on Topic Selection
        proceed: "bg-[#4B5563] text-white hover:bg-[#374151]",
        // Purple accent option if needed elsewhere
        accent: "bg-[var(--step-accent)] text-white hover:brightness-95",
      },
      size: {
        default: "h-9 px-4 rounded-md gap-2",
        sm: "h-8 px-3 rounded-md gap-1.5",
        lg: "h-10 px-6 rounded-md gap-2",
        icon: "size-9 rounded-full",
        // Figma CTA dimensions
        cta: "h-10 px-5 rounded-[10px] gap-2",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
