import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import Link from "next/link";

const stepIcons: Record<string, string> = {
  search: "🔍",
  compare: "⚖️",
  secure: "🛡️",
  camera: "📸",
  price: "💰",
  sell: "🎉",
};

export default function HowItWorks() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-9 max-w-2xl">
          <span className="text-xs font-bold text-accent-600">از انتخاب تا تحویل</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-navy-800 md:text-3xl">دو مسیر ساده، یک بازار مطمئن</h2>
          <p className="mt-2 text-sm leading-7 text-surface-500">چه خریدار باشی چه فروشنده، از شروع تا پایان فقط سه قدم فاصله داری.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-navy-100 bg-navy-50/55 p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-navy-400">مسیر خریدار</span>
                <h3 className="mt-1 text-xl font-black text-navy-800">کتاب مناسب را پیدا کن</h3>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-700 text-xl text-white">🛒</span>
            </div>

            <ol className="space-y-3">
              {HOW_IT_WORKS_STEPS.buy.map((step) => (
                <li key={step.step} className="flex gap-3 rounded-2xl border border-white bg-white/80 p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-lg" aria-hidden="true">{stepIcons[step.icon]}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-accent-600">{step.step}</span>
                      <h4 className="text-sm font-black text-navy-800">{step.title}</h4>
                    </div>
                    <p className="mt-1 text-xs leading-6 text-surface-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link href="/marketplace" className="mt-5 flex h-11 items-center justify-center rounded-xl bg-navy-700 text-sm font-bold text-white transition hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
              شروع خرید
            </Link>
          </div>

          <div className="rounded-[28px] border border-accent-100 bg-accent-50/55 p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-accent-600">مسیر فروشنده</span>
                <h3 className="mt-1 text-xl font-black text-navy-800">کتاب‌هایت را دوباره به گردش بینداز</h3>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500 text-xl text-white">💰</span>
            </div>

            <ol className="space-y-3">
              {HOW_IT_WORKS_STEPS.sell.map((step) => (
                <li key={step.step} className="flex gap-3 rounded-2xl border border-white bg-white/80 p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-lg" aria-hidden="true">{stepIcons[step.icon]}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-accent-600">{step.step}</span>
                      <h4 className="text-sm font-black text-navy-800">{step.title}</h4>
                    </div>
                    <p className="mt-1 text-xs leading-6 text-surface-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link href="/create-listing" className="mt-5 flex h-11 items-center justify-center rounded-xl bg-accent-500 text-sm font-bold text-white transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2">
              ثبت آگهی رایگان
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
