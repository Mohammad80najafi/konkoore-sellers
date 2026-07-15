import ShellLayout from "@/components/layout/ShellLayout";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "درباره ما",
  description:
    "با کنکورباز آشنا شوید — بازار آنلاین خرید و فروش کتاب‌های دست دوم کنکور",
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
    description:
      "تمام تراکنش‌ها با سیستم امانی محافظت می‌شوند. پول شما تا زمان دریافت کتاب نزد ما محفوظ است.",
  },
  {
    icon: "💰",
    title: "قیمت منصفانه",
    description:
      "بدون واسطه، مستقیم از فروشنده بخرید. قیمت‌گذاری هوشمند به شما کمک می‌کند بهترین معامله را انجام دهید.",
  },
  {
    icon: "🌍",
    title: "محیط زیست",
    description:
      "هر کتاب دست دوم = یک درخت نجات‌یافته. با بازیافت کتاب‌ها از مصرف کاغذ جلوگیری کنید.",
  },
  {
    icon: "📱",
    title: "سادگی استفاده",
    description:
      "ثبت آگهی در کمتر از ۲ دقیقه. جستجوی پیشرفته بر اساس رشته، پایه و ناشر.",
  },
];

const team = [
  {
    name: "محمد نجفی",
    role: "سازندگان پلتفرم",
    description:
      "تیمی از دانش‌آموختگان دانشگاه‌های برتر که خودشان تجربه کنکور را داشته‌اند.",
  },
];

export default function AboutPage() {
  return (
    <ShellLayout>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="bg-accent-500/10 absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-navy-400/20 absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center md:py-24">
          <h1 className="animate-fade-in mb-6 text-3xl leading-tight font-black md:text-4xl lg:text-5xl">
            درباره <span className="text-accent-400">کنکورباز</span>
          </h1>
          <p className="text-navy-200 animate-slide-up mx-auto mb-8 max-w-2xl text-base leading-relaxed md:text-lg">
            ما باور داریم هیچ کتاب کنکوری نباید روی کتابخاکی خاک بخورد. کنکورباز
            پلتفرمی است که کتاب‌های دست دوم کنکور را بین دانش‌آموزان به اشتراک
            می‌گذارد.
          </p>

          <div
            className="animate-slide-up flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href="/marketplace">
              <Button variant="accent" size="lg">
                شروع کنید
              </Button>
            </Link>
            <Link href="/create-listing">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:border-white/50 hover:bg-white/10"
              >
                کتابتان را بفروشید
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 left-0" aria-hidden="true">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z"
              fill="#fafaf9"
            />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="shadow-card card-hover rounded-2xl bg-white p-6 text-center"
            >
              <div className="text-navy-800 mb-1 text-2xl font-black md:text-3xl">
                {stat.value}
              </div>
              <div className="text-surface-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="shadow-card rounded-3xl bg-white p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-navy-800 mb-6 text-2xl font-bold md:text-3xl">
              داستان ما
            </h2>
            <div className="text-surface-600 space-y-4 leading-relaxed">
              <p>
                کنکورباز از یک ساده شروع شد: چرا باید کتاب‌های کنکور بعد از یک
                سال روی کتابخانه خاک بخورند، در حالی که دانش‌آموزان سال بعد همان
                کتاب‌ها را با قیمت چند برابر می‌خرند؟
              </p>
              <p>
                ما یک پلتفرم ساختیم که خرید و فروش کتاب‌های دست دوم کنکور را
                آسان، امن و ارزان می‌کند. بدون واسطه، بدون دلال — مستقیم بین
                دانش‌آموزان.
              </p>
              <p>
                امروز بیش از ۲۵,۰۰۰ دانش‌آموز در سراسر ایران از کنکورباز استفاده
                می‌کنند و تاکنون بیش از ۱۲,۵۰۰ کتاب از طریق پلتفرم ما بازیافت
                شده است.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-navy-800 mb-3 text-center text-2xl font-bold md:text-3xl">
          ارزش‌های ما
        </h2>
        <p className="text-surface-500 mx-auto mb-10 max-w-xl text-center">
          چیزی که کنکورباز را متفاوت می‌کند
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {values.map((value) => (
            <div
              key={value.title}
              className="shadow-card card-hover rounded-3xl bg-white p-6 md:p-8"
            >
              <div className="bg-navy-50 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl">
                {value.icon}
              </div>
              <h3 className="text-navy-800 mb-2 text-lg font-bold">
                {value.title}
              </h3>
              <p className="text-surface-500 text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="from-navy-50 to-navy-50 rounded-3xl bg-gradient-to-br via-white p-8 text-center md:p-12">
          <h2 className="text-navy-800 mb-6 text-2xl font-bold md:text-3xl">
            تیم ما
          </h2>
          <p className="text-surface-600 mx-auto mb-8 max-w-2xl leading-relaxed">
            کنکورباز توسط تیمی از دانش‌آموختگان دانشگاه‌های برتر ساخته شده که
            خودشان تجربه کنکور را داشته‌اند و می‌دانند چه چیزی برای دانش‌آموزان
            مهم است.
          </p>
          <div className="flex justify-center gap-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="shadow-card max-w-sm rounded-2xl bg-white p-6"
              >
                <div className="bg-navy-600 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white">
                  کب
                </div>
                <h3 className="text-navy-800 mb-1 font-bold">{member.name}</h3>
                <p className="text-accent-600 mb-2 text-sm font-semibold">
                  {member.role}
                </p>
                <p className="text-surface-500 text-xs">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mb-8 max-w-7xl px-4 py-12">
        <div className="gradient-hero relative overflow-hidden rounded-3xl p-8 text-center text-white md:p-12">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="animate-float absolute top-10 right-[20%] text-4xl opacity-10">
              📚
            </div>
            <div
              className="animate-float absolute bottom-10 left-[15%] text-3xl opacity-10"
              style={{ animationDelay: "1s" }}
            >
              🎓
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              آماده‌اید شروع کنید؟
            </h2>
            <p className="text-navy-200 mx-auto mb-6 max-w-lg">
              همین حالا کتاب‌های کنکورتان را بفروشید یا کتاب مورد نیازتان را
              ارزان‌تر بخرید.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/marketplace">
                <Button variant="accent" size="lg">
                  خرید کتاب
                </Button>
              </Link>
              <Link href="/create-listing">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
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
