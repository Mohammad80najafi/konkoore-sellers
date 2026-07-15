"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ConditionBadge from "@/components/ui/ConditionBadge";
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
        <span className="text-navy-700 font-medium">کتاب‌های اهدایی</span>
      </nav>

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-navy-800">
          کتاب‌های اهدایی کنکورباز
        </h1>
        <p className="text-sm text-surface-500 mt-1.5">
          {filteredListings.length} کتاب آماده اهدا — بخون و ببخش
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
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5"
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
  const { book, condition, seller, city, isBundle, images } =
    listing;
  const coverImage = images?.find((img) => img.url && img.url.trim() !== "")?.url;

  return (
    <Link
      href={`/listing/${listing._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-surface-200/80 bg-white shadow-[0_1px_2px_rgba(10,17,56,0.04)] transition duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-[0_18px_40px_rgba(10,17,56,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
    >
        <div className="relative aspect-[16/11] overflow-hidden bg-[linear-gradient(145deg,#f8f9fd_0%,#edf1fb_100%)]">
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="relative h-16 w-20 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105">
              <span className="absolute bottom-1 left-1 h-12 w-9 rotate-[-7deg] rounded-md border border-white bg-success-100 shadow-sm" />
              <span className="absolute bottom-1 left-6 h-14 w-10 rounded-md border border-white bg-[#f8dce7] shadow-sm" />
              <span className="absolute bottom-1 right-1 h-11 w-9 rotate-[5deg] rounded-md border border-white bg-[#dcecfb] shadow-sm" />
            </div>
          </div>
          {coverImage && (
            <span
              aria-hidden="true"
              className="absolute inset-3 bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          )}

          <span className="absolute left-3 top-3 rounded-lg bg-success-600 px-2.5 py-1 text-xs font-black text-white shadow-sm">
            اهدای رایگان
          </span>

          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {isBundle && (
              <span className="rounded-lg border border-white/70 bg-white/90 px-2 py-1 text-[10px] font-bold text-navy-700 shadow-sm backdrop-blur-sm">
                پکیج چندکتابی
              </span>
            )}
          </div>

        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 min-h-11 text-[15px] font-extrabold leading-6 text-navy-800 transition-colors group-hover:text-navy-600">
            {book.title}
              </h3>
              <p className="mt-1 truncate text-xs text-surface-500">
                {book.author} <span className="text-surface-300">•</span> {book.publisher.name}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-accent-50 px-2 py-1 text-[10px] font-bold text-accent-700">بخون و ببخش</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-surface-100 bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-surface-600">
              {fieldLabels[book.field] || book.field}
            </span>
            <ConditionBadge condition={condition.grade} size="sm" className="text-[11px]" />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-surface-100 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[10px] font-black text-navy-600">
                {seller.name ? seller.name[0] : "ک"}
              </span>
              <span className="truncate text-[11px] font-medium text-surface-600">{seller.name}</span>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[11px] text-surface-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {city}
            </span>
          </div>
        </div>
    </Link>
  );
}

function ListCard({ listing }: { listing: Listing }) {
  const { book, condition, seller, city, isBundle, images } =
    listing;
  const coverImage = images?.find((img) => img.url && img.url.trim() !== "")?.url;

  return (
    <Link
      href={`/listing/${listing._id}`}
      className="group block overflow-hidden rounded-[22px] border border-surface-200/80 bg-white shadow-[0_1px_2px_rgba(10,17,56,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-[0_16px_36px_rgba(10,17,56,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
    >
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[linear-gradient(145deg,#f8f9fd_0%,#edf1fb_100%)] sm:w-52">
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <div className="relative h-14 w-18 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105">
                <span className="absolute bottom-1 left-0 h-10 w-8 rotate-[-7deg] rounded-md border border-white bg-success-100 shadow-sm" />
                <span className="absolute bottom-1 left-5 h-12 w-9 rounded-md border border-white bg-[#f8dce7] shadow-sm" />
                <span className="absolute bottom-1 right-0 h-9 w-8 rotate-[5deg] rounded-md border border-white bg-[#dcecfb] shadow-sm" />
              </div>
            </div>
            {coverImage && (
              <span
                aria-hidden="true"
                className="absolute inset-3 bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${coverImage})` }}
              />
            )}

            <span className="absolute left-3 top-3 rounded-lg bg-success-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">اهدای رایگان</span>

            {isBundle && (
              <span className="absolute right-3 top-3 rounded-lg border border-white/70 bg-white/90 px-2 py-1 text-[10px] font-bold text-navy-700 shadow-sm backdrop-blur-sm">
                پکیج چندکتابی
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between p-4 md:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-base font-extrabold text-navy-800 transition-colors group-hover:text-navy-600">
                  {book.title}
                </h3>
                <p className="mt-1.5 truncate text-xs text-surface-500">
                {book.author} · {book.publisher.name}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-1 text-[10px] font-bold text-accent-700">بخون و ببخش</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-surface-100 bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-surface-600">
                  {fieldLabels[book.field] || book.field}
                </span>
                <ConditionBadge condition={condition.grade} size="sm" className="text-[11px]" />
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-surface-100 pt-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[10px] font-black text-navy-600">
                  {seller.name ? seller.name[0] : "ک"}
                </span>
                <div className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-surface-600">{seller.name}</span>
                  <span className="block text-[10px] text-surface-400">{city}</span>
                </div>
              </div>

              <span className="rounded-full bg-success-50 px-3 py-1.5 text-xs font-black text-success-700">برای اهدا</span>
            </div>
          </div>
        </div>
    </Link>
  );
}
