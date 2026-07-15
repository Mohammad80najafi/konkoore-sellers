import { SUSTAINABILITY_STATS } from "@/lib/constants";

const iconMap: Record<string, string> = {
  book: "📚",
  money: "💰",
  leaf: "🌿",
  users: "👥",
};

export default function SustainabilitySection() {
  return (
    <section className="bg-white py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-[32px] border border-success-100 bg-[#eff8f3] p-6 md:p-10 lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success-500 text-2xl text-white">🌱</span>
              <span className="mt-5 block text-xs font-bold text-success-700">هر کتاب، یک دور بیشتر</span>
              <h2 className="mt-2 text-2xl font-black leading-tight text-navy-800 md:text-3xl">خرید دست دوم، انتخابی که اثر می‌گذارد</h2>
              <p className="mt-4 text-sm leading-8 text-surface-600">با هر کتابی که دوباره خوانده می‌شود، هم هزینه یک دانش‌آموز کمتر می‌شود و هم کاغذ و انرژی کمتری مصرف می‌کنیم.</p>
              <div className="mt-6 h-1 w-20 rounded-full bg-success-400" aria-hidden="true" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {SUSTAINABILITY_STATS.map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-white/80 bg-white/80 p-4 backdrop-blur-sm md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl" aria-hidden="true">{iconMap[stat.icon]}</span>
                    <span className="h-px flex-1 bg-success-100" />
                  </div>
                  <div className="mt-5 text-lg font-black text-navy-800 md:text-2xl">{stat.value}</div>
                  <div className="mt-1 text-[11px] leading-5 text-surface-500 md:text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
