import Card from "@/components/ui/Card";
import StarRating from "@/components/ui/StarRating";
import { TESTIMONIALS } from "@/lib/constants";
import { formatPrice, toPersianDigits } from "@/lib/utils";

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3 text-center">
        نظرات دانش‌آموزان
      </h2>
      <p className="text-surface-500 text-center mb-10 max-w-xl mx-auto">
        هزاران دانش‌آموز از کنکورباز استفاده کرده‌اند
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TESTIMONIALS.map((testimonial) => (
          <Card key={testimonial.id} variant="default" padding="md" className="flex flex-col">
            {/* Quote icon */}
            <div className="text-3xl text-navy-100 mb-3" aria-hidden="true">❝</div>

            {/* Testimonial text */}
            <p className="text-sm text-surface-600 leading-relaxed flex-1 mb-4">
              {testimonial.text}
            </p>

            {/* Saved amount */}
            {testimonial.savedAmount > 0 && (
              <div className="bg-success-50 text-success-700 text-xs font-medium px-3 py-1.5 rounded-lg mb-4 inline-flex items-center gap-1 self-start">
                💰 {formatPrice(testimonial.savedAmount)} صرفه‌جویی
              </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 pt-3 border-t border-surface-100">
              <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-lg">
                👤
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-navy-800">
                  {testimonial.name}
                </div>
                <div className="text-xs text-surface-500">
                  رشته {testimonial.field}
                </div>
              </div>
              <StarRating rating={testimonial.rating} size="sm" showNumber={false} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
