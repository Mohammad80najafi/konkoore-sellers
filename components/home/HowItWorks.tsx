import Image from "next/image";
import Link from "next/link";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const stepIcons: Record<string, string> = {
  search: "🔍",
  compare: "⚖️",
  secure: "🛡️",
  camera: "📸",
  share: "🤲",
  give: "🎁",
};

export default function HowItWorks() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-9 grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="max-w-2xl">
            <span className="text-accent-600 text-xs font-bold">
              از انتخاب تا تحویل
            </span>
            <h2 className="text-navy-800 mt-2 text-2xl font-black tracking-tight md:text-3xl">
              دو مسیر ساده، یک چرخه مهربان
            </h2>
            <p className="text-surface-500 mt-2 text-sm leading-7">
              چه کتاب بخواهی چه کتابی برای بخشیدن داشته باشی، فقط سه قدم فاصله
              داری.
            </p>
          </div>

          <div className="border-surface-100 bg-surface-50 overflow-hidden rounded-[24px] border shadow-sm">
            <Image
              src="/images/home/book-handoff.webp"
              alt="تحویل کتاب‌های کنکور از یک دانش‌آموز به دانش‌آموز دیگر"
              width={1400}
              height={933}
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 320px, 420px"
              className="h-52 w-full object-cover md:h-44 lg:h-48"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="border-navy-100 bg-navy-50/55 rounded-[28px] border p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <span className="text-navy-400 text-[10px] font-bold">
                  مسیر گیرنده
                </span>
                <h3 className="text-navy-800 mt-1 text-xl font-black">
                  کتاب مناسب را پیدا کن
                </h3>
              </div>
              <span className="bg-navy-700 flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white">
                🛒
              </span>
            </div>

            <ol className="space-y-3">
              {HOW_IT_WORKS_STEPS.buy.map((step) => (
                <li
                  key={step.step}
                  className="flex gap-3 rounded-2xl border border-white bg-white/80 p-3.5"
                >
                  <span
                    className="bg-navy-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    aria-hidden="true"
                  >
                    {stepIcons[step.icon]}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-600 text-[10px] font-black">
                        {step.step}
                      </span>
                      <h4 className="text-navy-800 text-sm font-black">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-surface-500 mt-1 text-xs leading-6">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="/marketplace"
              className="bg-navy-700 hover:bg-navy-800 focus-visible:ring-navy-500 mt-5 flex h-11 items-center justify-center rounded-xl text-sm font-bold text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              پیدا کردن کتاب
            </Link>
          </div>

          <div className="border-accent-100 bg-accent-50/55 rounded-[28px] border p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <span className="text-accent-600 text-[10px] font-bold">
                  مسیر اهداکننده
                </span>
                <h3 className="text-navy-800 mt-1 text-xl font-black">
                  کتاب‌هایت را دوباره به گردش بینداز
                </h3>
              </div>
              <span className="bg-accent-500 flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white">
                🎁
              </span>
            </div>

            <ol className="space-y-3">
              {HOW_IT_WORKS_STEPS.sell.map((step) => (
                <li
                  key={step.step}
                  className="flex gap-3 rounded-2xl border border-white bg-white/80 p-3.5"
                >
                  <span
                    className="bg-accent-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    aria-hidden="true"
                  >
                    {stepIcons[step.icon]}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-600 text-[10px] font-black">
                        {step.step}
                      </span>
                      <h4 className="text-navy-800 text-sm font-black">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-surface-500 mt-1 text-xs leading-6">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              href="/create-listing"
              className="bg-accent-500 hover:bg-accent-600 focus-visible:ring-accent-500 mt-5 flex h-11 items-center justify-center rounded-xl text-sm font-bold text-white transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              اهدای کتاب
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
