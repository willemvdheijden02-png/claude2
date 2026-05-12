import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center h-[22px] px-2 rounded text-[11px] font-medium uppercase tracking-[0.04em]",
  {
    variants: {
      tone: {
        neutral: "bg-[var(--bg-surface-2)] text-[var(--text-secondary)]",
        success: "bg-[rgb(16_185_129/0.12)] text-[var(--status-success)]",
        warning: "bg-[rgb(245_158_11/0.12)] text-[var(--status-warning)]",
        danger: "bg-[rgb(239_68_68/0.12)] text-[var(--status-danger)]",
        info: "bg-[rgb(59_130_246/0.12)] text-[var(--status-info)]",
        accent: "bg-[var(--accent-glow)] text-[var(--accent-500)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
