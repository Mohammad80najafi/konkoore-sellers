import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl gradient-hero text-white p-8 md:p-12 lg:p-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-navy-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-2xl mx-auto">
          <div className="text-5xl mb-6">📚</div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight">
            کتاب‌هایی که دیگه نیاز نداری رو بفروش!
          </h2>

          <p className="text-base md:text-lg text-navy-200 mb-8 leading-relaxed">
            بعد از کنکور، کتاب‌هات رو تو خونه نگه ندار. با چند کلیک ساده
            کتاب‌هات رو آگهی کن و از فروششون درآمد کسب کن.
            همزمان به دانش‌آموز دیگه‌ای کمک می‌کنی ارزان‌تر درس بخونه.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/create-listing">
              <Button variant="accent" size="xl" icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }>
                همین الان کتابت رو بفروش
              </Button>
            </Link>
            <Link href="/faq">
              <Button
                variant="ghost"
                size="lg"
                className="text-navy-200 hover:text-white hover:bg-white/10"
              >
                بیشتر بدانید
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-navy-300">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ثبت آگهی رایگان
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              فروش سریع
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              پرداخت امن
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
