import { SUSTAINABILITY_STATS } from "@/lib/constants";

const iconMap: Record<string, string> = {
  book: "📚",
  money: "💰",
  leaf: "🌿",
  users: "👥",
};

export default function SustainabilitySection() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-to-br from-success-50 via-white to-success-50">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3">
              🌱 با خرید دست دوم، به محیط زیست کمک کن
            </h2>
            <p className="text-surface-500 max-w-2xl mx-auto leading-relaxed">
              هر کتاب دست دوم که خریداری می‌کنید، نه تنها پول شما را صرفه‌جویی می‌کند
              بلکه از مصرف کاغذ و انرژی برای چاپ کتاب جدید جلوگیری می‌کند.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SUSTAINABILITY_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 shadow-card text-center card-hover"
              >
                <div className="text-3xl mb-3">{iconMap[stat.icon]}</div>
                <div className="text-xl md:text-2xl font-black text-navy-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-surface-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
