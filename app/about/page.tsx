import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "درباره ما",
  description: "با کنکورباز آشنا شوید — بازار آنلاین خرید و فروش کتاب‌های دست دوم کنکور",
};

const stats = [
  { value: "۲۵,۰۰۰+", label: "کاربر فعال" },
  { value: "۱۲,۵۰۰+", label: "کتاب فروخته شده" },
  { value: "۸.۲ میلیارد", label: "تومان صرفه‌جویی" },
  { value: "۳۱", label: "استان پوشش" },
];

const values = [
  {
    icon: "🤝",
    title: "اعتماد و امنیت",
    description: "تمام تراکنش‌ها با سیستم امانی محافظت می‌شوند. پول شما تا زمان دریافت کتاب نزد ما محفوظ است.",
  },
  {
    icon: "💰",
    title: "قیمت منصفانه",
    description: "بدون واسطه، مستقیم از فروشنده بخرید. قیمت‌گذاری هوشمند به شما کمک می‌کند بهترین معامله را انجام دهید.",
  },
  {
    icon: "🌍",
    title: "محیط زیست",
    description: "هر کتاب دست دوم = یک درخت نجات‌یافته. با بازیافت کتاب‌ها از مصرف کاغذ جلوگیری کنید.",
  },
  {
    icon: "📱",
    title: "سادگی استفاده",
    description: "ثبت آگهی در کمتر از ۲ دقیقه. جستجوی پیشرفته بر اساس رشته، پایه و ناشر.",
  },
];

const team = [
  { name: "تیم کنکورباز", role: "سازندگان پلتفرم", description: "تیمی از دانش‌آموختگان دانشگاه‌های برتر که خودشان تجربه کنکور را داشته‌اند." },
];

export default function AboutPage() {
  return (
    <ShellLayout>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-navy-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 animate-fade-in">
            درباره <span className="text-accent-400">کنکورباز</span>
          </h1>
          <p className="text-base md:text-lg text-navy-200 mb-8 max-w-2xl mx-auto animate-slide-up leading-relaxed">
            ما باور داریم هیچ کتاب کنکوری نباید روی کتابخاکی خاک بخورد.
            کنکورباز پلتفرمی است که کتاب‌های دست دوم کنکور را بین دانش‌آموزان به اشتراک می‌گذارد.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/marketplace">
              <Button variant="accent" size="lg">
                شروع کنید
              </Button>
            </Link>
            <Link href="/create-listing">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                کتابتان را بفروشید
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="#fafaf9" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-card text-center card-hover">
              <div className="text-2xl md:text-3xl font-black text-navy-800 mb-1">{stat.value}</div>
              <div className="text-sm text-surface-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-card">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-6">داستان ما</h2>
            <div className="space-y-4 text-surface-600 leading-relaxed">
              <p>
                کنکورباز از یک ساده شروع شد: چرا باید کتاب‌های کنکور بعد از یک سال روی کتابخانه خاک بخورند،
                در حالی که دانش‌آموزان سال بعد همان کتاب‌ها را با قیمت چند برابر می‌خرند؟
              </p>
              <p>
                ما یک پلتفرم ساختیم که خرید و فروش کتاب‌های دست دوم کنکور را آسان، امن و ارزان می‌کند.
                بدون واسطه، بدون دلال — مستقیم بین دانش‌آموزان.
              </p>
              <p>
                امروز بیش از ۲۵,۰۰۰ دانش‌آموز در سراسر ایران از کنکورباز استفاده می‌کنند
                و تاکنون بیش از ۱۲,۵۰۰ کتاب از طریق پلتفرم ما بازیافت شده است.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3 text-center">ارزش‌های ما</h2>
        <p className="text-surface-500 text-center mb-10 max-w-xl mx-auto">
          چیزی که کنکورباز را متفاوت می‌کند
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value) => (
            <div key={value.title} className="bg-white rounded-3xl p-6 md:p-8 shadow-card card-hover">
              <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center text-3xl mb-4">
                {value.icon}
              </div>
              <h3 className="text-lg font-bold text-navy-800 mb-2">{value.title}</h3>
              <p className="text-sm text-surface-500 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-navy-50 via-white to-navy-50 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-6">تیم ما</h2>
          <p className="text-surface-600 max-w-2xl mx-auto leading-relaxed mb-8">
            کنکورباز توسط تیمی از دانش‌آموختگان دانشگاه‌های برتر ساخته شده که خودشان تجربه کنکور را داشته‌اند
            و می‌دانند چه چیزی برای دانش‌آموزان مهم است.
          </p>
          <div className="flex justify-center gap-4">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl p-6 shadow-card max-w-sm">
                <div className="w-16 h-16 rounded-full bg-navy-600 text-white font-bold flex items-center justify-center text-xl mx-auto mb-4">
                  کب
                </div>
                <h3 className="font-bold text-navy-800 mb-1">{member.name}</h3>
                <p className="text-sm text-accent-600 font-semibold mb-2">{member.role}</p>
                <p className="text-xs text-surface-500">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12 mb-8">
        <div className="gradient-hero rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-10 right-[20%] text-4xl opacity-10 animate-float">📚</div>
            <div className="absolute bottom-10 left-[15%] text-3xl opacity-10 animate-float" style={{ animationDelay: "1s" }}>🎓</div>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              آماده‌اید شروع کنید؟
            </h2>
            <p className="text-navy-200 mb-6 max-w-lg mx-auto">
              همین حالا کتاب‌های کنکورتان را بفروشید یا کتاب مورد نیازتان را ارزان‌تر بخرید.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/marketplace">
                <Button variant="accent" size="lg">خرید کتاب</Button>
              </Link>
              <Link href="/create-listing">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  فروش کتاب
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </ShellLayout>
  );
}
