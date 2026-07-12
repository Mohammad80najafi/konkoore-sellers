"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import PriceTag from "@/components/ui/PriceTag";
import ConditionBadge from "@/components/ui/ConditionBadge";
import Badge from "@/components/ui/Badge";
import FilterSidebar from "./FilterSidebar";
import SortBar from "./SortBar";
import { toPersianDigits, cn } from "@/lib/utils";
import type { FilterState, Listing } from "@/lib/types";

const fieldLabels: Record<string, string> = {
  experimental: "تجربی",
  mathematics: "ریاضی",
  humanities: "انسانی",
  art: "هنر",
  languages: "زبان",
};

const ITEMS_PER_PAGE = 12;

function filterListings(listings: Listing[], filters: FilterState): Listing[] {
  return listings.filter((listing) => {
    if (filters.field && listing.book.field !== filters.field) return false;
    if (filters.grade && listing.book.grade !== filters.grade) return false;
    if (filters.subject && listing.book.subject !== filters.subject) return false;
    if (filters.condition && listing.condition.grade !== filters.condition) return false;
    if (filters.minPrice && listing.price < filters.minPrice) return false;
    if (filters.maxPrice && listing.price > filters.maxPrice) return false;
    if (filters.province && listing.province !== filters.province) return false;
    if (filters.shippingAvailable && !listing.shippingAvailable) return false;
    if (filters.pickupAvailable && !listing.pickupAvailable) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = `${listing.book.title} ${listing.book.author} ${listing.book.publisher.name}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

function sortListings(listings: Listing[], sort: string): Listing[] {
  const sorted = [...listings];
  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "discount":
      return sorted.sort((a, b) => {
        const discA = (a.originalPrice - a.price) / a.originalPrice;
        const discB = (b.originalPrice - b.price) / b.originalPrice;
        return discB - discA;
      });
    case "condition": {
      const conditionOrder: Record<string, number> = {
        "like-new": 5,
        excellent: 4,
        good: 3,
        acceptable: 2,
        "heavily-used": 1,
      };
      return sorted.sort(
        (a, b) =>
          (conditionOrder[b.condition.grade] ?? 0) -
          (conditionOrder[a.condition.grade] ?? 0)
      );
    }
    case "views":
      return sorted.sort((a, b) => b.views - a.views);
    default:
      return sorted;
  }
}

export default function MarketplacePage({ initialListings = [] }: { initialListings?: Listing[] }) {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    field: (searchParams.get("field") as FilterState["field"]) || undefined,
    grade: (searchParams.get("grade") as FilterState["grade"]) || undefined,
    subject: searchParams.get("subject") || undefined,
    condition: (searchParams.get("condition") as FilterState["condition"]) || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    province: searchParams.get("province") || undefined,
    shippingAvailable: searchParams.get("shipping") === "true" || undefined,
    pickupAvailable: searchParams.get("pickup") === "true" || undefined,
    query: searchParams.get("q") || undefined,
  });

  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [listingType, setListingType] = useState(
    searchParams.get("type") || "single"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string | number | boolean | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const handleReset = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const activeFilterCount = useMemo(
    () =>
      [
        filters.field,
        filters.grade,
        filters.subject,
        filters.condition,
        filters.minPrice,
        filters.maxPrice,
        filters.province,
        filters.shippingAvailable,
        filters.pickupAvailable,
      ].filter(Boolean).length,
    [filters]
  );

  const filteredListings = useMemo(() => {
    let results = initialListings.filter((l) => l.status === "active");

    if (listingType === "bundle") {
      results = results.filter((l) => l.isBundle);
    } else if (listingType === "single") {
      results = results.filter((l) => !l.isBundle);
    }

    results = filterListings(results, filters);
    results = sortListings(results, sort);
    return results;
  }, [filters, sort, listingType, initialListings]);

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-surface-500" aria-label="breadcrumb">
        <Link href="/" className="hover:text-navy-600 transition-colors">
          خانه
        </Link>
        <span className="mx-2 text-surface-300">/</span>
        <span className="text-navy-700 font-medium">بازار کتاب</span>
      </nav>

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-800">
          بازار کتاب کنکورباز
        </h1>
        <p className="text-sm text-surface-500 mt-1.5">
          {filteredListings.length} کتاب دست دوم موجود — ارزان‌تر بخر، راحت‌تر بفروش
        </p>
      </div>

      {/* Sort bar */}
      <SortBar
        sort={sort}
        onSortChange={setSort}
        listingType={listingType}
        onListingTypeChange={setListingType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenFilters={() => setSidebarOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main content area */}
      <div className="mt-6 flex gap-6">
        {/* Sidebar (desktop: sticky, mobile: slide-in) */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          resultCount={filteredListings.length}
        />

        {/* Listings grid */}
        <div className="flex-1 min-w-0">
          {paginatedListings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-surface-100">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-surface-50 flex items-center justify-center">
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="text-lg font-bold text-navy-800 mb-2">
                کتابی پیدا نشد
              </h3>
              <p className="text-sm text-surface-500 mb-6 max-w-sm mx-auto">
                فیلترها را تغییر دهید یا جستجوی دیگری امتحان کنید
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-all cursor-pointer shadow-lg shadow-navy-700/20"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                    : "space-y-3"
                )}
              >
                {paginatedListings.map((listing) =>
                  viewMode === "grid" ? (
                    <GridCard key={listing._id} listing={listing} />
                  ) : (
                    <ListCard key={listing._id} listing={listing} />
                  )
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all hover:shadow-sm"
                  >
                    <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-10 h-10 text-sm font-semibold rounded-xl transition-all cursor-pointer",
                          currentPage === page
                            ? "bg-navy-700 text-white shadow-lg shadow-navy-700/20"
                            : "text-surface-600 hover:bg-surface-100 hover:shadow-sm"
                        )}
                      >
                        {toPersianDigits(page)}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl text-surface-500 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all hover:shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GridCard({ listing }: { listing: Listing }) {
  const { book, price, originalPrice, condition, seller, city, isBundle } =
    listing;

  return (
    <Link href={`/listing/${listing._id}`}>
      <Card variant="interactive" padding="none" className="overflow-hidden h-full group">
        {/* Image area */}
        <div className="relative h-40 md:h-48 bg-gradient-to-br from-navy-50 via-surface-50 to-navy-100 flex items-center justify-center overflow-hidden">
          <span className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-300">📚</span>
          
          {/* Top badges */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
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
            <div className="absolute top-2.5 left-2.5 bg-danger-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
              {toPersianDigits(
                Math.round(((originalPrice - price) / originalPrice) * 100)
              )}
             ٪ تخفیف
            </div>
          )}

          {/* Bundle count */}
          {listing.isBundle && listing.bundleBooks && (
            <div className="absolute bottom-2.5 left-2.5 bg-navy-800/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
              {listing.bundleBooks.length} کتاب
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-2.5">
          <h3 className="font-bold text-sm text-navy-800 line-clamp-2 leading-relaxed group-hover:text-navy-600 transition-colors">
            {book.title}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-surface-500 bg-surface-50 px-2 py-0.5 rounded-md">
              {book.publisher.name}
            </span>
            <span className="text-[11px] text-surface-400">
              {fieldLabels[book.field] || book.field}
            </span>
          </div>

          <ConditionBadge condition={condition.grade} size="sm" />
          
          <PriceTag price={price} originalPrice={originalPrice} size="sm" />

          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-surface-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-navy-100 flex items-center justify-center">
                <span className="text-[9px]">
                  {seller.name ? seller.name[0] : "👤"}
                </span>
              </div>
              <span className="text-[11px] text-surface-500">{seller.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-surface-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {city}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ListCard({ listing }: { listing: Listing }) {
  const { book, price, originalPrice, condition, seller, city, isBundle } =
    listing;

  return (
    <Link href={`/listing/${listing._id}`}>
      <Card variant="interactive" padding="none" className="overflow-hidden group">
        <div className="flex">
          {/* Image */}
          <div className="relative w-32 md:w-40 shrink-0 h-32 md:h-36 bg-gradient-to-br from-navy-50 via-surface-50 to-navy-100 flex items-center justify-center overflow-hidden">
            <span className="text-4xl opacity-30 group-hover:scale-110 transition-transform duration-300">📚</span>
            {isBundle && (
              <div className="absolute top-2 right-2">
                <Badge variant="accent" size="sm">
                  📦 پکیج
                </Badge>
              </div>
            )}
            {originalPrice > price && (
              <div className="absolute top-2 left-2 bg-danger-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                {toPersianDigits(
                  Math.round(((originalPrice - price) / originalPrice) * 100)
                )}٪
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-sm md:text-base text-navy-800 line-clamp-1 group-hover:text-navy-600 transition-colors">
                  {book.title}
                </h3>
                {listing.priceIndicator === "great" && (
                  <Badge variant="success" size="sm">
                    🔥 قیمت عالی
                  </Badge>
                )}
              </div>
              <p className="text-xs text-surface-500 mt-1.5">
                {book.publisher.name} · {fieldLabels[book.field] || book.field} ·{" "}
                {book.author}
              </p>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div className="flex items-center gap-3">
                <ConditionBadge condition={condition.grade} size="sm" />
                <div className="flex items-center gap-1.5 text-[11px] text-surface-500">
                  <div className="w-4 h-4 rounded-full bg-navy-100 flex items-center justify-center">
                    <span className="text-[7px]">
                      {seller.name ? seller.name[0] : "👤"}
                    </span>
                  </div>
                  <span>{seller.name}</span>
                  <span className="text-surface-300">·</span>
                  <span>{city}</span>
                </div>
              </div>
              <PriceTag price={price} originalPrice={originalPrice} size="sm" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
