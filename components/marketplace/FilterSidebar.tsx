"use client";

import { cn } from "@/lib/utils";
import {
  FIELDS_OF_STUDY,
  GRADES,
  BOOK_CONDITIONS,
  PROVINCES,
  SUBJECTS,
} from "@/lib/constants";
import type { FilterState } from "@/lib/types";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | number | boolean | undefined) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  isOpen,
  onClose,
  resultCount,
}: FilterSidebarProps) {
  const activeFilterCount = [
    filters.field,
    filters.grade,
    filters.subject,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.province,
    filters.shippingAvailable,
    filters.pickupAvailable,
  ].filter(Boolean).length;

  const selectedSubjects = filters.field ? SUBJECTS[filters.field] || [] : [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 lg:top-20 right-0 lg:right-auto z-50 lg:z-auto",
          "h-full lg:h-auto lg:max-h-[calc(100vh-6rem)]",
          "w-80 lg:w-72 xl:w-80",
          "bg-white lg:bg-transparent",
          "overflow-y-auto lg:overflow-visible",
          "transition-transform duration-300 lg:transition-none",
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          "lg:self-start"
        )}
      >
        <div className="lg:bg-white lg:rounded-2xl lg:shadow-card lg:border lg:border-surface-200/50 p-5 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-navy-800">فیلترها</h2>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={onReset}
                  className="text-xs text-danger-600 hover:text-danger-700 font-medium cursor-pointer"
                >
                  پاک کردن همه
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1 text-surface-500 hover:text-surface-700 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Result count */}
          <p className="text-xs text-surface-500">
            {resultCount} کتاب پیدا شد
          </p>

          {/* Field of Study */}
          <FilterSection title="رشته تحصیلی">
            <div className="flex flex-wrap gap-1.5">
              {FIELDS_OF_STUDY.map((field) => (
                <button
                  key={field.id}
                  onClick={() =>
                    onFilterChange(
                      "field",
                      filters.field === field.id ? undefined : field.id
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer border",
                    filters.field === field.id
                      ? "bg-navy-600 text-white border-navy-600"
                      : "bg-surface-50 text-surface-600 border-surface-200 hover:border-navy-300 hover:text-navy-700"
                  )}
                >
                  {field.icon} {field.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Grade */}
          <FilterSection title="پایه تحصیلی">
            <div className="space-y-1.5">
              {GRADES.map((grade) => (
                <label
                  key={grade.id}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                    filters.grade === grade.id
                      ? "bg-navy-50 text-navy-700 font-medium"
                      : "text-surface-600 hover:bg-surface-50"
                  )}
                >
                  <input
                    type="radio"
                    name="grade"
                    value={grade.id}
                    checked={filters.grade === grade.id}
                    onChange={() =>
                      onFilterChange(
                        "grade",
                        filters.grade === grade.id ? undefined : grade.id
                      )
                    }
                    className="w-3.5 h-3.5 accent-navy-600"
                  />
                  {grade.label}
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Subject (dynamic based on field) */}
          <FilterSection title="درس">
            <div className="flex flex-wrap gap-1.5">
              {selectedSubjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() =>
                    onFilterChange(
                      "subject",
                      filters.subject === subject.id ? undefined : subject.id
                    )
                  }
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer border",
                    filters.subject === subject.id
                      ? "bg-navy-600 text-white border-navy-600"
                      : "bg-surface-50 text-surface-600 border-surface-200 hover:border-navy-300"
                  )}
                >
                  {subject.label}
                </button>
              ))}
              {selectedSubjects.length === 0 && (
                <p className="text-xs text-surface-400">ابتدا رشته را انتخاب کنید</p>
              )}
            </div>
          </FilterSection>

          {/* Condition */}
          <FilterSection title="وضعیت کتاب">
            <div className="space-y-1.5">
              {BOOK_CONDITIONS.map((cond) => (
                <label
                  key={cond.id}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                    filters.condition === cond.id
                      ? "bg-navy-50 text-navy-700 font-medium"
                      : "text-surface-600 hover:bg-surface-50"
                  )}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={cond.id}
                    checked={filters.condition === cond.id}
                    onChange={() =>
                      onFilterChange(
                        "condition",
                        filters.condition === cond.id ? undefined : cond.id
                      )
                    }
                    className="w-3.5 h-3.5 accent-navy-600"
                  />
                  {cond.label}
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="محدوده قیمت">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-surface-400 mb-1 block">از</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice ?? ""}
                  onChange={(e) =>
                    onFilterChange(
                      "minPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none"
                />
              </div>
              <span className="text-surface-400 mt-4">—</span>
              <div className="flex-1">
                <label className="text-[10px] text-surface-400 mb-1 block">تا</label>
                <input
                  type="number"
                  placeholder="بدون محدودیت"
                  value={filters.maxPrice ?? ""}
                  onChange={(e) =>
                    onFilterChange(
                      "maxPrice",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none"
                />
              </div>
            </div>
          </FilterSection>

          {/* Province */}
          <FilterSection title="استان">
            <select
              value={filters.province ?? ""}
              onChange={(e) =>
                onFilterChange("province", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-800 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none cursor-pointer"
            >
              <option value="">همه استان‌ها</option>
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Shipping */}
          <FilterSection title="نحوه دریافت">
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={filters.shippingAvailable === true}
                  onChange={(e) =>
                    onFilterChange(
                      "shippingAvailable",
                      e.target.checked ? true : undefined
                    )
                  }
                  className="w-3.5 h-3.5 accent-navy-600 rounded"
                />
                ارسال پستی
              </label>
              <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={filters.pickupAvailable === true}
                  onChange={(e) =>
                    onFilterChange(
                      "pickupAvailable",
                      e.target.checked ? true : undefined
                    )
                  }
                  className="w-3.5 h-3.5 accent-navy-600 rounded"
                />
                تحویل حضوری
              </label>
            </div>
          </FilterSection>

          {/* Quick price presets */}
          <FilterSection title="قیمت سریع">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "زیر ۲۰۰K", min: 0, max: 200000 },
                { label: "۲۰۰K – ۵۰۰K", min: 200000, max: 500000 },
                { label: "۵۰۰K – ۱M", min: 500000, max: 1000000 },
                { label: "بالای ۱M", min: 1000000, max: undefined },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    onFilterChange("minPrice", preset.min);
                    onFilterChange("maxPrice", preset.max);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-surface-50 text-surface-600 border border-surface-200 hover:border-navy-300 hover:text-navy-700 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Mobile apply button */}
          <button
            onClick={onClose}
            className="lg:hidden w-full py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors cursor-pointer"
          >
            نمایش {resultCount} نتیجه
          </button>
        </div>
      </aside>
    </>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2.5">
        {title}
      </h3>
      {children}
    </div>
  );
}
