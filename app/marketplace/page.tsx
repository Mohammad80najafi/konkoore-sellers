import { Suspense } from "react";
import MarketplacePage from "@/components/marketplace/MarketplacePage";
import { getAllListings } from "@/lib/data";
import type { Listing } from "@/lib/types";

export const metadata = {
  title: "کتاب‌های اهدایی",
  description:
    "کتاب‌های دست دوم کنکور را رایگان دریافت کنید یا کتاب‌های خود را به دانش‌آموز بعدی ببخشید.",
};

export default async function MarketplaceRoute() {
  const listings = await getAllListings(100);
  const initialListings = JSON.parse(JSON.stringify(listings)) as Listing[];

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="skeleton h-8 w-48 mb-4" />
          <div className="skeleton h-4 w-64 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="skeleton h-44" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <MarketplacePage initialListings={initialListings} />
    </Suspense>
  );
}
