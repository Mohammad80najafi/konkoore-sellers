import StarRating from "@/components/ui/StarRating";
import { TESTIMONIALS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export default function Testimonials() {
  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-accent-600">تجربه واقعی دانش‌آموزها</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-navy-800 md:text-3xl">چرا دوباره به کنکورباز برمی‌گردند؟</h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-success-50 px-3 py-2 text-xs font-bold text-success-700 md:flex">
            <span className="text-sm">★</span>
            رضایت خریدار و فروشنده
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <article
              key={testimonial.id}
              className={`flex flex-col rounded-[24px] border p-5 md:p-6 ${index === 0 ? "border-navy-700 bg-navy-800 text-white lg:col-span-2" : "border-surface-100 bg-surface-50/60"}`}>
              <div className="flex items-start justify-between gap-4">
                <span className={`text-4xl font-black ${index === 0 ? "text-accent-400" : "text-navy-100"}`} aria-hidden="true">“</span>
                <StarRating rating={testimonial.rating} size="sm" showNumber={false} />
              </div>

              <p className={`mt-3 flex-1 leading-8 ${index === 0 ? "max-w-3xl text-base text-navy-100 md:text-lg" : "text-sm text-surface-600"}`}>
                {testimonial.text}
              </p>

              {testimonial.savedAmount > 0 ? (
                <div className={`mt-5 inline-flex self-start rounded-full px-3 py-1.5 text-[11px] font-bold ${index === 0 ? "bg-white/10 text-success-300" : "bg-success-50 text-success-700"}`}>
                  {formatPrice(testimonial.savedAmount)} صرفه‌جویی
                </div>
              ) : null}

              <div className={`mt-5 flex items-center gap-3 border-t pt-4 ${index === 0 ? "border-white/10" : "border-surface-100"}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${index === 0 ? "bg-white/10 text-white" : "bg-navy-100 text-navy-700"}`}>
                  {testimonial.name[0]}
                </span>
                <div>
                  <div className={`text-sm font-black ${index === 0 ? "text-white" : "text-navy-800"}`}>{testimonial.name}</div>
                  <div className={`text-xs ${index === 0 ? "text-navy-300" : "text-surface-500"}`}>رشته {testimonial.field}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
