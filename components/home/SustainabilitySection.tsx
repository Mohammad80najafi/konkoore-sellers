import Image from "next/image";
import { SUSTAINABILITY_STATS } from "@/lib/constants";

const iconMap: Record<string, string> = {
  book: "📚",
  gift: "🎁",
  leaf: "🌿",
  users: "👥",
};

export default function SustainabilitySection() {
  return (
    <section className="bg-white py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="border-success-100 overflow-hidden rounded-[32px] border bg-[#eff8f3] p-6 md:p-10 lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[0.72fr_0.82fr_1.2fr] lg:gap-8">
            <div>
              <span className="bg-success-500 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl text-white">
                🌱
              </span>
              <span className="text-success-700 mt-5 block text-xs font-bold">
                هر کتاب، یک دور بیشتر
              </span>
              <h2 className="text-navy-800 mt-2 text-2xl leading-tight font-black md:text-3xl">
                بخشیدن یک کتاب، شروع یک مسیر تازه
              </h2>
              <p className="text-surface-600 mt-4 text-sm leading-8">
                با هر کتابی که دوباره خوانده می‌شود، یک دانش‌آموز بدون هزینه به
                منبع آموزشی می‌رسد و کاغذ و انرژی کمتری مصرف می‌شود.
              </p>
              <div
                className="bg-success-400 mt-6 h-1 w-20 rounded-full"
                aria-hidden="true"
              />
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-sm lg:h-full lg:min-h-[340px]">
              <Image
                src="/images/home/books-second-life.webp"
                alt="دو دانش‌آموز در حال مرتب کردن کتاب‌های اهدایی در کتابخانه"
                width={900}
                height={1131}
                sizes="(max-width: 1023px) calc(100vw - 5rem), 28vw"
                className="h-64 w-full object-cover lg:h-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {SUSTAINABILITY_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[22px] border border-white/80 bg-white/80 p-4 backdrop-blur-sm md:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl" aria-hidden="true">
                      {iconMap[stat.icon]}
                    </span>
                    <span className="bg-success-100 h-px flex-1" />
                  </div>
                  <div className="text-navy-800 mt-5 text-lg font-black md:text-2xl">
                    {stat.value}
                  </div>
                  <div className="text-surface-500 mt-1 text-[11px] leading-5 md:text-xs">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
