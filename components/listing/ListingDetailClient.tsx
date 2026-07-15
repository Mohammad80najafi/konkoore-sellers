"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/utils";
import { BOOK_CONDITIONS } from "@/lib/constants";
import { createMessageConversation } from "@/lib/message-actions";
import type { Listing } from "@/lib/types";

const fieldLabels: Record<string, string> = {
  experimental: "تجربی",
  mathematics: "ریاضی",
  humanities: "انسانی",
  art: "هنر",
  languages: "زبان",
};

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
  konkoor: "کنکور",
};

export default function ListingDetailClient({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { book, condition, seller, city, province, isBundle, bundleBooks, description, year, edition, shippingAvailable, pickupAvailable, images } = listing;

  const validImages = images?.filter((img) => img.url && img.url.trim() !== "") || [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const dragRef = useRef<{ startX: number; currentX: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [messageLoading, setMessageLoading] = useState(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setDragOffset(0);
    document.body.style.overflow = "";
  };

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % validImages.length);
    setDragOffset(0);
  }, [validImages.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + validImages.length) % validImages.length);
    setDragOffset(0);
  }, [validImages.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, currentX: e.clientX };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current.currentX = e.clientX;
    setDragOffset(e.clientX - dragRef.current.startX);
  };

  const onPointerUp = () => {
    if (!dragRef.current) return;
    const diff = dragRef.current.currentX - dragRef.current.startX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? goPrev() : goNext();
    }
    dragRef.current = null;
    setDragOffset(0);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, goNext, goPrev]);

  const conditionInfo = BOOK_CONDITIONS.find((c) => c.id === condition.grade);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-surface-500" aria-label="breadcrumb">
        <Link href="/" className="hover:text-navy-600 transition-colors">خانه</Link>
        <span className="mx-2 text-surface-300">/</span>
        <Link href="/marketplace" className="hover:text-navy-600 transition-colors">کتاب‌های اهدایی</Link>
        <span className="mx-2 text-surface-300">/</span>
        <span className="text-navy-700 font-medium line-clamp-1">{book.title}</span>
      </nav>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Main content — 3 cols */}
        <div className="md:col-span-3 space-y-6">
          {/* Image gallery */}
          {validImages.length > 0 ? (
            <div>
              {/* Main image */}
              <div
                className="rounded-2xl overflow-hidden bg-surface-100 mb-3 cursor-zoom-in"
                onClick={() => openLightbox(selectedImage)}
              >
                <img
                  src={validImages[selectedImage]?.url}
                  alt={validImages[selectedImage]?.alt || book.title}
                  className="w-full h-64 md:h-80 object-contain"
                />
              </div>
              {/* Thumbnails */}
              {validImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1">
                  {validImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                        selectedImage === index
                          ? "border-navy-600 shadow-sm"
                          : "border-surface-200 hover:border-surface-300 opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Placeholder when no images */
            <div className="bg-gradient-to-br from-navy-50 via-surface-50 to-navy-100 rounded-2xl h-64 md:h-80 flex items-center justify-center">
              <div className="text-center">
                <span className="text-7xl opacity-30 block mb-2">📚</span>
                <p className="text-xs text-surface-400">عکسی موجود نیست</p>
              </div>
            </div>
          )}

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 text-[11px] font-medium bg-navy-50 text-navy-700 rounded-lg">
                {fieldLabels[book.field] || book.field}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-surface-100 text-surface-600 rounded-lg">
                {gradeLabels[book.grade] || book.grade}
              </span>
              {isBundle && (
                <span className="px-2.5 py-1 text-[11px] font-medium bg-accent-50 text-accent-700 rounded-lg">
                  📦 پکیج ({bundleBooks?.length || 0} کتاب)
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-navy-800 leading-relaxed">{book.title}</h1>
            <p className="text-sm text-surface-500 mt-1">{book.author} — {book.publisher.name}</p>
          </div>

          {/* Condition */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <h2 className="text-sm font-bold text-navy-800 mb-3">وضعیت کتاب</h2>
            <div className="flex items-center gap-3 mb-3">
              <span className={cn("px-3 py-1.5 text-sm font-semibold rounded-lg", conditionInfo?.bgColor, conditionInfo?.color)}>
                {conditionInfo?.label}
              </span>
              <span className="text-xs text-surface-500">{conditionInfo?.description}</span>
            </div>

            {/* Defects */}
            <div className="flex flex-wrap gap-2">
              {condition.highlighting && <DefectTag label="هایلایت" />}
              {condition.handwrittenNotes && <DefectTag label="یادداشت" />}
              {condition.tornPages && <DefectTag label="پارگی" />}
              {condition.missingPages && <DefectTag label="صفحات گمشده" />}
              {condition.answersCompleted && <DefectTag label="تست‌ها پاسخ داده شده" />}
              {condition.coverDamaged && <DefectTag label="جلد آسیب‌دیده" />}
              {condition.hasCd && <DefectTag label="سی‌دی دارد" />}
              {condition.hasSupplement && <DefectTag label="کتاب تکمیلی" />}
            </div>
          </div>

          {/* Bundle books */}
          {isBundle && bundleBooks && bundleBooks.length > 0 && (
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <h2 className="text-sm font-bold text-navy-800 mb-3">کتاب‌های پکیج</h2>
              <div className="space-y-2">
                {bundleBooks.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-navy-800">{b.title}</span>
                      <span className="text-xs text-surface-500 mr-2">{b.author}</span>
                    </div>
                    <span className="text-xs text-surface-500">{b.publisher.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <h2 className="text-sm font-bold text-navy-800 mb-3">توضیحات اهداکننده</h2>
              <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-line">{description}</p>
            </div>
          )}
        </div>

        {/* Sidebar — 2 cols */}
        <div className="md:col-span-2 space-y-4">
          {/* Donation card */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5 sticky top-24">
            <div className="mb-4 rounded-xl bg-success-50 p-4">
              <span className="text-xs font-bold text-success-700">بخون و ببخش</span>
              <strong className="mt-1 block text-xl font-black text-navy-800">این کتاب رایگان اهدا می‌شود</strong>
            </div>

            {/* Year & Edition */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-surface-50 rounded-lg px-3 py-2">
                <span className="text-[11px] text-surface-400 block">سال چاپ</span>
                <span className="font-medium text-navy-800">{toPersianDigits(year)}</span>
              </div>
              {edition > 0 && (
                <div className="bg-surface-50 rounded-lg px-3 py-2">
                  <span className="text-[11px] text-surface-400 block">ویرایش</span>
                  <span className="font-medium text-navy-800">{toPersianDigits(edition)}</span>
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", shippingAvailable ? "bg-success-50 text-success-600" : "bg-surface-100 text-surface-400")}>
                  {shippingAvailable ? "✓" : "✗"}
                </div>
                <span className="text-surface-600">ارسال پستی</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", pickupAvailable ? "bg-success-50 text-success-600" : "bg-surface-100 text-surface-400")}>
                  {pickupAvailable ? "✓" : "✗"}
                </div>
                <span className="text-surface-600">تحویل حضوری</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-surface-600 mb-5 pb-5 border-b border-surface-100">
              <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {city}، {province}
            </div>

            {/* Donor */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-navy-700">
                  {seller.name ? seller.name[0] : "👤"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-800 truncate">{seller.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-surface-500">
                  {seller.rating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <svg className="w-3 h-3 text-accent-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {seller.rating}
                    </span>
                  )}
                  <span>{seller.totalSales} اهدای موفق</span>
                </div>
              </div>
            </div>

            {/* Message donor button */}
            <button
              onClick={async () => {
                setMessageLoading(true);
                const res = await createMessageConversation(seller._id, listing._id);
                if (res.success && res.conversationId) {
                  router.push(`/messages/${res.conversationId}`);
                }
                setMessageLoading(false);
              }}
              disabled={messageLoading}
              className="w-full py-2.5 bg-navy-600 text-white text-sm font-semibold rounded-xl hover:bg-navy-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {messageLoading ? "..." : "پیام به اهداکننده"}
            </button>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link href="/marketplace" className="text-sm text-navy-600 hover:text-navy-800 font-medium inline-flex items-center gap-1.5">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به کتاب‌های اهدایی
        </Link>
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && validImages.length > 0 && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center select-none touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 right-4 z-10 bg-white/10 px-3 py-1 rounded-full text-white text-sm font-mono">
            {lightboxIndex + 1} / {validImages.length}
          </div>

          {/* Prev arrow */}
          {validImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {validImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute left-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <img
            src={validImages[lightboxIndex]?.url}
            alt={validImages[lightboxIndex]?.alt || book.title}
            className="max-w-[90vw] max-h-[85vh] object-contain pointer-events-none transition-transform"
            style={{ transform: `translateX(${dragOffset}px)` }}
            draggable={false}
          />

          {/* Thumbnail strip */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 p-2 rounded-xl">
              {validImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); setDragOffset(0); }}
                  className={cn(
                    "w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0",
                    lightboxIndex === i ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                  )}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DefectTag({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 text-[11px] font-medium bg-surface-100 text-surface-600 rounded-md">
      {label}
    </span>
  );
}
