import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CardVariant = "default" | "elevated" | "interactive" | "bordered";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-white shadow-card rounded-2xl",
  elevated: "bg-white shadow-elevated rounded-2xl",
  interactive:
    "bg-white shadow-card rounded-2xl card-hover cursor-pointer",
  bordered: "bg-white border border-surface-200 rounded-2xl",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6 md:p-8",
};

export default function Card({
  children,
  variant = "default",
  className,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
