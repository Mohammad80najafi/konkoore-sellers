import Link from "next/link";
import Card from "@/components/ui/Card";
import PriceTag from "@/components/ui/PriceTag";
import Badge from "@/components/ui/Badge";
import { toPersianDigits } from "@/lib/utils";
import type { Listing } from "@/lib/types";

interface BundleDealsProps {
  bundles: Listing[];
}

export default function BundleDeals({ bundles }: BundleDealsProps) {
  if (bundles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-navy-800">
            📦 پکیج‌های تخفیف‌دار
          </h2>
          <p className="text-sm text-surface-500 mt-1">
            چند کتاب رو با هم ارزان‌تر بخرید
          </p>
        </div>
        <Link
          href="/marketplace?type=bundle"
          className="text-sm font-medium text-navy-600 hover:text-navy-800 transition-colors flex items-center gap-1"
        >
          همه پکیج‌ها
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundles.map((bundle) => (
          <Link key={bundle._id} href={`/listing/${bundle._id}`}>
            <Card variant="interactive" padding="none" className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Image area */}
                <div className="sm:w-48 h-40 sm:h-auto bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center shrink-0 relative">
                  <div className="text-5xl">📦</div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="accent" size="sm">
                      {toPersianDigits(bundle.bundleBooks?.length || 0)} کتاب
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-navy-800 mb-2">
                      {bundle.description?.split(".")[0] || bundle.book.title}
                    </h3>

                    {/* Bundle books list */}
                    {bundle.bundleBooks && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {bundle.bundleBooks.slice(0, 4).map((book) => (
                          <span
                            key={book._id}
                            className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full"
                          >
                            {book.title.split(" ").slice(0, 2).join(" ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <PriceTag
                      price={bundle.price}
                      originalPrice={bundle.originalPrice}
                      size="md"
                    />
                    <span className="text-xs text-surface-500">
                      {bundle.seller.city}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
