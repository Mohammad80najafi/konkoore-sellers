import { cn, getConditionLabel, getConditionColor, getConditionBgColor } from "@/lib/utils";
import type { BookConditionId } from "@/lib/constants";

interface ConditionBadgeProps {
  condition: BookConditionId;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const conditionIcons: Record<BookConditionId, string> = {
  "like-new": "✨",
  excellent: "⭐",
  good: "👍",
  acceptable: "👌",
  "heavily-used": "📖",
};

export default function ConditionBadge({
  condition,
  size = "md",
  showIcon = true,
  className,
}: ConditionBadgeProps) {
  const label = getConditionLabel(condition);
  const colorClass = getConditionColor(condition);
  const bgColorClass = getConditionBgColor(condition);

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        bgColorClass,
        colorClass,
        sizeStyles[size],
        className
      )}
    >
      {showIcon && (
        <span className="shrink-0">{conditionIcons[condition]}</span>
      )}
      <span>{label}</span>
    </span>
  );
}
