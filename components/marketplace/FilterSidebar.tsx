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

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-navy-800">فیلترها</h2>
          {activeFilterCount > 0 && (
            <span className="min-w-[18px] h-[18px] bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
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
            className="lg:hidden p-1 text-surface-400 hover:text-surface-600 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-surface-500">{resultCount} کتاب پیدا شد</p>

      {/* Field of Study */}
      <div>
        <h3 className="text-xs font-bold text-surface-500 mb-3">رشته تحصیلی</h3>
        <div className="grid grid-cols-2 gap-2">
          {FIELDS_OF_STUDY.map((field) => (
            <button
              key={field.id}
              onClick={() =>
                onFilterChange("field", filters.field === field.id ? undefined : field.id)
              }
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                filters.field === field.id
                  ? "bg-navy-600 text-white border-navy-600"
                  : "bg-white text-surface-600 border-surface-200 hover:border-navy-300"
              )}
            >
              <span>{field.icon}</span>
              <span>{field.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grade */}
      <div>
        <h3 className="text-xs font-bold text-surface-500 mb-3">پایه تحصیلی</h3>
        <div className="space-y-1">
          {GRADES.map((grade) => (
            <label
              key={grade.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                filters.grade === grade.id
                  ? "bg-navy-50 text-navy-700"
                  : "text-surface-600 hover:bg-surface-50"
              )}
            >
              <input
                type="radio"
                name="grade"
                value={grade.id}
                checked={filters.grade === grade.id}
                onChange={() =>
                  onFilterChange("grade", filters.grade === grade.id ? undefined : grade.id)
                }
                className="w-4 h-4 accent-navy-600"
              />
              <span className="text-sm">{grade.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <h3 className="text-xs font-bold text-surface-500 mb-3">درس</h3>
        <div className="flex flex-wrap gap-1.5">
          {selectedSubjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() =>
                onFilterChange("subject", filters.subject === subject.id ? undefined : subject.id)
              }
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer",
                filters.subject === subject.id
                  ? "bg-navy-600 text-white border-navy-600"
                  : "bg-white text-surface-600 border-surface-200 hover:border-navy-300"
              )}
            >
              {subject.label}
            </button>
          ))}
          {selectedSubjects.length === 0 && (
            <p className="text-xs text-surface-400">ابتدا رشته را انتخاب کنید</p>
          )}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h3 className="text-xs font-bold text-surface-500 mb-3">وضعیت کتاب</h3>
        <div className="space-y-1">
          {BOOK_CONDITIONS.map((cond) => (
            <label
              key={cond.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                filters.condition === cond.id
                  ? "bg-navy-50 text-navy-700"
                  : "text-surface-600 hover:bg-surface-50"
              )}
            >
              <input
                type="radio"
                name="condition"
                value={cond.id}
                checked={filters.condition === cond.id}
                onChange={() =>
                  onFilterChange("condition", filters.condition === cond.id ? undefined : cond.id)
                }
                className="w-4 h-4 accent-navy-600"
              />
              <span className="text-sm flex-1">{cond.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-bold text-surface-500 mb-3">محدوده قیمت</h3>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            placeholder="از"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)
            }
            className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none"
          />
          <span className="text-surface-400">—</span>
          <input
            type="number"
            placeholder="تا"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)
            }
            className="flex-1 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none"
          />
        </div>
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
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-surface-50 text-surface-600 border border-surface-200 hover:border-navy-300 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Province */}
      <div>
        <h3 className="text-xs font-bold text-surface-500 mb-3">استان</h3>
        <select
          value={filters.province ?? ""}
          onChange={(e) => onFilterChange("province", e.target.value || undefined)}
          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-800 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none cursor-pointer"
        >
          <option value="">همه استان‌ها</option>
          {PROVINCES.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Shipping */}
      <div>
        <h3 className="text-xs font-bold text-surface-500 mb-3">نحوه دریافت</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.shippingAvailable === true}
              onChange={(e) => onFilterChange("shippingAvailable", e.target.checked ? true : undefined)}
              className="w-4 h-4 accent-navy-600 rounded"
            />
            ارسال پستی
          </label>
          <label className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-600 hover:bg-surface-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.pickupAvailable === true}
              onChange={(e) => onFilterChange("pickupAvailable", e.target.checked ? true : undefined)}
              className="w-4 h-4 accent-navy-600 rounded"
            />
            تحویل حضوری
          </label>
        </div>
      </div>

      {/* Mobile apply */}
      <button
        onClick={onClose}
        className="lg:hidden w-full py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors cursor-pointer"
      >
        نمایش {resultCount} نتیجه
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-80 bg-white overflow-y-auto transition-transform duration-300 lg:hidden shadow-2xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-5">{content}</div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
          {content}
        </div>
      </div>
    </>
  );
}
