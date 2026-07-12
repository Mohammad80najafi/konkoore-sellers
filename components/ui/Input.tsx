"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-surface-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800",
            "placeholder:text-surface-400 transition-all duration-200",
            "hover:border-surface-300 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none",
            error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
            !!icon && "pr-10",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-surface-500">{hint}</p>
      )}
    </div>
  );
}
