"use client";

import { cn } from "@/lib/utils";
import { SORT_OPTIONS, LISTING_TYPES } from "@/lib/constants";

interface SortBarProps {
  sort: string;
  onSortChange: (sort: string) => void;
  listingType: string;
  onListingTypeChange: (type: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export default function SortBar({
  sort,
  onSortChange,
  listingType,
  onListingTypeChange,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  activeFilterCount,
}: SortBarProps) {
  return (
    <div className="space-y-4">
      {/* Top row: filter toggle + listing type tabs + view mode */}
      <div className="flex items-center justify-between gap-3">
        {/* Mobile filter toggle */}
        <button
          onClick={onOpenFilters}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:border-navy-300 hover:shadow-sm transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          فیلترها
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Listing type tabs */}
        <div className="flex bg-surface-100/80 rounded-xl p-1">
          {LISTING_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onListingTypeChange(type.id)}
              className={cn(
                "px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer",
                listingType === type.id
                  ? "bg-white text-navy-700 shadow-sm"
                  : "text-surface-500 hover:text-surface-700"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="hidden md:flex items-center gap-1 bg-surface-100/80 rounded-xl p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2 rounded-lg transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-white text-navy-700 shadow-sm"
                : "text-surface-400 hover:text-surface-600"
            )}
            aria-label="نمایش شبکه‌ای"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-2 rounded-lg transition-all cursor-pointer",
              viewMode === "list"
                ? "bg-white text-navy-700 shadow-sm"
                : "text-surface-400 hover:text-surface-600"
            )}
            aria-label="نمایش لیستی"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom row: sort options */}
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hidden pb-1">
        <span className="text-xs text-surface-500 shrink-0 font-medium">مرتب سازی:</span>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap",
                sort === option.id
                  ? "bg-navy-700 text-white shadow-sm shadow-navy-700/20"
                  : "bg-white text-surface-600 border border-surface-200 hover:border-navy-300 hover:text-navy-700 hover:shadow-sm"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
