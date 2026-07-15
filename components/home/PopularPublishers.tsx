import { PUBLISHERS } from "@/lib/constants";
import Link from "next/link";

export default function PopularPublishers() {
  return (
    <section className="border-b border-surface-100 bg-surface-50/60 py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-accent-600">قفسه ناشران</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-navy-800 md:text-3xl">ناشر مورد اعتمادت را پیدا کن</h2>
          </div>
          <p className="hidden text-sm text-surface-500 md:block">دسترسی سریع به کتاب‌های ناشران محبوب کنکور</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {PUBLISHERS.map((publisher) => (
            <Link
              key={publisher.id}
              href={`/marketplace?publisher=${publisher.id}`}
              className="group flex min-h-20 items-center gap-3 rounded-2xl border border-surface-100 bg-white p-3 transition duration-300 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-[0_10px_28px_rgba(10,17,56,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500">
              <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded-md rounded-r-xl bg-navy-700 text-sm font-black text-white shadow-sm transition-transform group-hover:-rotate-3" aria-hidden="true">
                {publisher.name[0]}
              </span>
              <span className="text-xs font-bold leading-5 text-surface-700 transition-colors group-hover:text-navy-700">
                {publisher.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
