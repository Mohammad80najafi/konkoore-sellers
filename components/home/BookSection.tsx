import Link from "next/link";
import ConditionBadge from "@/components/ui/ConditionBadge";
import type { Listing } from "@/lib/types";

const fieldLabels: Record<string, string> = {
  experimental: "تجربی",
  mathematics: "ریاضی",
  humanities: "انسانی",
  art: "هنر",
  languages: "زبان",
};

interface BookCardProps {
  listing: Listing;
}

export function BookCard({ listing }: BookCardProps) {
  const { book, condition, seller, city, isBundle } = listing;
  const coverImage = listing.images?.find((image) => image.url?.trim())?.url;

  return (
    <Link
      href={`/listing/${listing._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-surface-200/80 bg-white shadow-[0_1px_2px_rgba(10,17,56,0.04)] transition duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-[0_18px_40px_rgba(10,17,56,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
        <div className="relative aspect-[16/11] overflow-hidden bg-[linear-gradient(145deg,#f8f9fd_0%,#edf1fb_100%)]">
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="relative h-16 w-20 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105">
              <span className="absolute bottom-1 left-1 h-12 w-9 rotate-[-7deg] rounded-md border border-white bg-success-100 shadow-sm" />
              <span className="absolute bottom-1 left-6 h-14 w-10 rounded-md border border-white bg-[#f8dce7] shadow-sm" />
              <span className="absolute bottom-1 right-1 h-11 w-9 rotate-[5deg] rounded-md border border-white bg-[#dcecfb] shadow-sm" />
            </div>
          </div>
          {coverImage ? (
            <span
              aria-hidden="true"
              className="absolute inset-3 bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          ) : null}

          <div className="absolute right-3 top-3 flex flex-col items-start gap-1.5">
            {isBundle && (
              <span className="rounded-lg border border-white/70 bg-white/90 px-2 py-1 text-[10px] font-bold text-navy-700 shadow-sm backdrop-blur-sm">
                پکیج
              </span>
            )}
            <span className="rounded-lg bg-accent-50/95 px-2 py-1 text-[10px] font-bold text-accent-700 shadow-sm">بخون و ببخش</span>
          </div>

          <span className="absolute left-2 top-2 rounded-lg bg-success-600 px-2 py-1 text-[10px] font-black text-white shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[11px]">اهدای رایگان</span>
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="line-clamp-2 min-h-11 text-[13px] font-extrabold leading-[1.4rem] text-navy-800 transition-colors group-hover:text-navy-600 sm:min-h-12 sm:text-[15px] sm:leading-6">
            {book.title}
          </h3>
          <p className="mt-1 truncate text-xs text-surface-500">{book.publisher.name}</p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-surface-100 bg-surface-50 px-2.5 py-1 text-[11px] font-medium text-surface-600">
              {fieldLabels[book.field] || book.field}
            </span>
            <ConditionBadge condition={condition.grade} size="sm" className="text-[11px]" />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-surface-100 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[10px] font-black text-navy-600">
                {seller.name?.[0] || "ک"}
              </span>
              <span className="truncate text-[11px] font-medium text-surface-600">{seller.name}</span>
            </div>
            <span className="shrink-0 text-[11px] text-surface-400">{city}</span>
          </div>
        </div>
    </Link>
  );
}

interface BookSectionProps {
  title: string;
  subtitle?: string;
  listings: Listing[];
  viewAllHref?: string;
  surface?: boolean;
}

export default function BookSection({ title, subtitle, listings, viewAllHref, surface = false }: BookSectionProps) {
  return (
    <section className={surface ? "border-y border-surface-100 bg-surface-50/60 py-14 md:py-16" : "bg-white py-14 md:py-16"}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div className="border-r-4 border-accent-500 pr-4">
            <h2 className="text-2xl font-black tracking-tight text-navy-800 md:text-3xl">
            {title}
            </h2>
            {subtitle ? <p className="mt-1.5 text-sm text-surface-500">{subtitle}</p> : null}
          </div>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-surface-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 transition hover:border-navy-200 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">
              مشاهده همه
              <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {listings.map((listing) => (
            <BookCard key={listing._id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
