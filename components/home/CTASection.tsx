import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-white px-4 py-10 md:py-16">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-navy-900 text-white shadow-[0_24px_70px_rgba(10,17,56,0.2)]">
        <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
          <div className="p-7 md:p-10 lg:p-14">
            <span className="text-xs font-bold text-accent-400">قفسه‌ات را خالی کن</span>
            <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight md:text-4xl">کتاب‌هایی که تمام شده‌اند، می‌توانند شروع یک نفر دیگر باشند.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-navy-200 md:text-base">کتاب‌هایت را رایگان آگهی کن، خریدار مناسب را پیدا کن و بخشی از هزینه‌های کنکور را برگردان.</p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-listing" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 text-sm font-black text-white transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ثبت آگهی رایگان
              </Link>
              <Link href="/marketplace" className="flex h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                اول بازار را ببین
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-navy-300">
              {[
                "ثبت آگهی رایگان",
                "ارتباط مستقیم",
                "فروش در سراسر ایران",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex min-h-72 items-center justify-center overflow-hidden bg-accent-500 p-8 lg:min-h-full" aria-hidden="true">
            <span className="absolute -left-10 -top-10 h-40 w-40 rounded-full border border-white/20" />
            <span className="absolute -bottom-16 -right-12 h-52 w-52 rounded-full border border-white/20" />
            <div className="relative h-44 w-48">
              <span className="absolute bottom-4 left-0 h-28 w-20 -rotate-12 rounded-xl border-4 border-white bg-success-200 shadow-2xl" />
              <span className="absolute bottom-4 left-14 h-36 w-24 rounded-xl border-4 border-white bg-white shadow-2xl" />
              <span className="absolute bottom-4 right-0 h-24 w-20 rotate-12 rounded-xl border-4 border-white bg-navy-200 shadow-2xl" />
              <span className="absolute left-16 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 text-2xl shadow-xl">↗</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
