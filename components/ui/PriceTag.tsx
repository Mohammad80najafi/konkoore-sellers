import { cn, formatPrice, calculateDiscount, toPersianDigits } from "@/lib/utils";

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
  className?: string;
}

export default function PriceTag({
  price,
  originalPrice,
  size = "md",
  showDiscount = true,
  className,
}: PriceTagProps) {
  const discount =
    originalPrice && showDiscount
      ? calculateDiscount(originalPrice, price)
      : 0;

  const sizeStyles = {
    sm: { price: "text-sm", original: "text-xs", badge: "text-xs px-1.5 py-0.5" },
    md: { price: "text-lg", original: "text-sm", badge: "text-xs px-2 py-0.5" },
    lg: { price: "text-2xl", original: "text-base", badge: "text-sm px-2.5 py-1" },
  };

  const styles = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn("font-bold text-navy-800", styles.price)}>
        {formatPrice(price)}
      </span>

      {originalPrice && originalPrice > price && (
        <span
          className={cn(
            "text-surface-400 line-through",
            styles.original
          )}
        >
          {formatPrice(originalPrice)}
        </span>
      )}

      {discount > 0 && (
        <span
          className={cn(
            "bg-danger-500 text-white rounded-full font-bold inline-flex items-center justify-center",
            styles.badge
          )}
        >
          {toPersianDigits(discount)}٪
        </span>
      )}
    </div>
  );
}
