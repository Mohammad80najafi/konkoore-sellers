import Link from "next/link";
import Card from "@/components/ui/Card";
import PriceTag from "@/components/ui/PriceTag";
import ConditionBadge from "@/components/ui/ConditionBadge";
import Badge from "@/components/ui/Badge";
import { toPersianDigits, toJalaliRelative } from "@/lib/utils";
import type { Listing } from "@/lib/types";

interface BookCardProps {
  listing: Listing;
}

export function BookCard({ listing }: BookCardProps) {
  const { book, price, originalPrice, condition, seller, city, isBundle } = listing;
  const fieldLabels: Record<string, string> = {
    experimental: "تجربی",
    mathematics: "ریاضی",
    humanities: "انسانی",
    art: "هنر",
    languages: "زبان",
  };

  return (
    <Link href={`/listing/${listing._id}`}>
      <Card variant="interactive" padding="none" className="overflow-hidden h-full">
        {/* Image placeholder */}
        <div className="relative h-44 md:h-48 bg-gradient-to-br from-navy-50 to-navy-100 flex items-center justify-center overflow-hidden">
          <span className="text-5xl opacity-40">📚</span>

          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isBundle && (
              <Badge variant="accent" size="sm">
                📦 پکیج
              </Badge>
            )}
            {listing.priceIndicator === "great" && (
              <Badge variant="success" size="sm">
                🔥 قیمت عالی
              </Badge>
            )}
          </div>

          {/* Discount badge */}
          {originalPrice > price && (
            <div className="absolute top-2 left-2 bg-danger-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {toPersianDigits(Math.round(((originalPrice - price) / originalPrice) * 100))}٪
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-2.5">
          {/* Title */}
          <h3 className="font-bold text-sm text-navy-800 line-clamp-2 leading-relaxed">
            {book.title}
          </h3>

          {/* Publisher & field */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-surface-500">{book.publisher.name}</span>
            <span className="text-xs text-surface-300">|</span>
            <span className="text-xs text-surface-500">
              {fieldLabels[book.field] || book.field}
            </span>
          </div>

          {/* Condition */}
          <ConditionBadge condition={condition.grade} size="sm" />

          {/* Price */}
          <PriceTag price={price} originalPrice={originalPrice} size="sm" />

          {/* Seller & city */}
          <div className="flex items-center justify-between pt-1 border-t border-surface-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-navy-100 flex items-center justify-center">
                <span className="text-[10px]">👤</span>
              </div>
              <span className="text-xs text-surface-500">{seller.name}</span>
            </div>
            <span className="text-xs text-surface-400">{city}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

interface BookSectionProps {
  title: string;
  subtitle?: string;
  listings: Listing[];
  viewAllHref?: string;
}

export default function BookSection({ title, subtitle, listings, viewAllHref }: BookSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-navy-800">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-surface-500 mt-1">{subtitle}</p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors flex items-center gap-1"
          >
            مشاهده همه
            <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {listings.map((listing) => (
          <BookCard key={listing._id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
