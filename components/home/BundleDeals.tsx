import Link from "next/link";
import { calculateDiscount, formatPrice, toPersianDigits } from "@/lib/utils";
import type { Listing } from "@/lib/types";

interface BundleDealsProps {
  bundles: Listing[];
}

export default function BundleDeals({ bundles }: BundleDealsProps) {
  if (bundles.length === 0) return null;

  return (
    <section className="overflow-hidden bg-navy-900 py-14 text-white md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-accent-400">یک انتخاب، چند کتاب</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">پکیج‌های به‌صرفه کنکور</h2>
            <p className="mt-2 text-sm leading-7 text-navy-200">چند کتاب هماهنگ را یک‌جا بخر و هزینه کمتری بپرداز.</p>
          </div>
          <Link
            href="/marketplace?type=bundle"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400">
            همه پکیج‌ها
            <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          {bundles.map((bundle) => {
            const discount = calculateDiscount(bundle.originalPrice, bundle.price);
            return (
              <Link
                key={bundle._id}
                href={`/listing/${bundle._id}`}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-white text-navy-900 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400">
                <div className="flex h-full flex-col sm:flex-row">
                  <div className="relative flex min-h-44 shrink-0 items-center justify-center overflow-hidden bg-accent-50 sm:w-48">
                    <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-black text-white">
                      {toPersianDigits(bundle.bundleBooks?.length || 0)} کتاب
                    </span>
                    <div className="relative h-20 w-24 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105" aria-hidden="true">
                      <span className="absolute bottom-2 left-0 h-14 w-11 -rotate-6 rounded-lg border-2 border-white bg-navy-200 shadow-md" />
                      <span className="absolute bottom-2 left-7 h-16 w-12 rounded-lg border-2 border-white bg-accent-300 shadow-md" />
                      <span className="absolute bottom-2 right-0 h-12 w-10 rotate-6 rounded-lg border-2 border-white bg-success-200 shadow-md" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-base font-black leading-7 text-navy-800">
                        {bundle.description?.split(".")[0] || bundle.book.title}
                      </h3>
                      {discount > 0 ? (
                        <span className="shrink-0 rounded-full bg-danger-50 px-2.5 py-1 text-[10px] font-black text-danger-600">
                          {toPersianDigits(discount)}٪ کمتر
                        </span>
                      ) : null}
                    </div>

                    {bundle.bundleBooks ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {bundle.bundleBooks.slice(0, 4).map((book) => (
                          <span
                            key={book._id}
                            className="rounded-full bg-surface-50 px-2.5 py-1 text-[10px] font-medium text-surface-600">
                            {book.title.split(" ").slice(0, 2).join(" ")}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-surface-100 pt-4">
                      <div>
                        <span className="block text-[10px] text-surface-400">قیمت کل پکیج</span>
                        <span className="mt-0.5 block text-lg font-black text-navy-800">{formatPrice(bundle.price)}</span>
                      </div>
                      <span className="text-xs text-surface-400">{bundle.seller.city}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
