// KonkoorBaz Utility Functions

import { BOOK_CONDITIONS, PRICE_INDICATORS } from "./constants";
import type { BookConditionId, PriceIndicator } from "./constants";

// ===== Persian Number Conversion =====
const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function normalizeDigits(str: string): string {
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(persianDigits[i], String(i)).replaceAll(arabicDigits[i], String(i));
  }
  return result;
}

// ===== Price Formatting =====
export function formatPrice(price: number): string {
  const formatted = price.toLocaleString("fa-IR");
  return `${formatted} تومان`;
}

export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `${toPersianDigits(millions.toFixed(millions % 1 === 0 ? 0 : 1))} میلیون`;
  }
  if (price >= 1_000) {
    const thousands = price / 1_000;
    return `${toPersianDigits(thousands.toFixed(0))} هزار تومان`;
  }
  return formatPrice(price);
}

// ===== Discount Calculation =====
export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

// ===== Jalali Date Conversion (simplified) =====
function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export function toJalali(dateStr: string): string {
  const date = new Date(dateStr);
  const [jy, jm, jd] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return `${toPersianDigits(jd)} ${JALALI_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

export function toJalaliRelative(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "همین الان";
  if (diffMinutes < 60) return `${toPersianDigits(diffMinutes)} دقیقه پیش`;
  if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
  if (diffDays < 7) return `${toPersianDigits(diffDays)} روز پیش`;
  if (diffDays < 30) return `${toPersianDigits(Math.floor(diffDays / 7))} هفته پیش`;
  return toJalali(dateStr);
}

// ===== Condition Helpers =====
export function getConditionLabel(conditionId: BookConditionId): string {
  return BOOK_CONDITIONS.find((c) => c.id === conditionId)?.label ?? conditionId;
}

export function getConditionColor(conditionId: BookConditionId): string {
  return BOOK_CONDITIONS.find((c) => c.id === conditionId)?.color ?? "text-surface-600";
}

export function getConditionBgColor(conditionId: BookConditionId): string {
  return BOOK_CONDITIONS.find((c) => c.id === conditionId)?.bgColor ?? "bg-surface-50";
}

export function getConditionScore(conditionId: BookConditionId): number {
  return BOOK_CONDITIONS.find((c) => c.id === conditionId)?.score ?? 0;
}

// ===== Price Indicator =====
export function getPriceIndicator(
  price: number,
  originalPrice: number,
  averageListingPrice?: number
): PriceIndicator {
  const ratio = price / originalPrice;
  const avgRatio = averageListingPrice ? price / averageListingPrice : ratio;

  if (ratio <= 0.4 || avgRatio <= 0.8) return "great";
  if (ratio <= 0.65 || avgRatio <= 1.1) return "fair";
  return "high";
}

export function getPriceIndicatorData(indicator: PriceIndicator) {
  return PRICE_INDICATORS[indicator];
}

// ===== Slug =====
export function generateSlug(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .toLowerCase();
}

// ===== Truncate =====
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

// ===== CN (class name helper) =====
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
