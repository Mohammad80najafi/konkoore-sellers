import Link from "next/link";
import { FIELDS_OF_STUDY } from "@/lib/constants";

const fieldColors: Record<string, { surface: string; text: string; line: string }> = {
  experimental: { surface: "bg-emerald-50", text: "text-emerald-700", line: "bg-emerald-400" },
  mathematics: { surface: "bg-blue-50", text: "text-blue-700", line: "bg-blue-400" },
  humanities: { surface: "bg-purple-50", text: "text-purple-700", line: "bg-purple-400" },
  art: { surface: "bg-rose-50", text: "text-rose-700", line: "bg-rose-400" },
  languages: { surface: "bg-amber-50", text: "text-amber-700", line: "bg-amber-400" },
};

const fieldIcons: Record<string, string> = {
  experimental: "🔬",
  mathematics: "📐",
  humanities: "📚",
  art: "🎨",
  languages: "🌍",
};

export default function CategoryCards() {
  return (
    <section className="border-b border-surface-100 bg-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-accent-600">از مسیر خودت شروع کن</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-navy-800 md:text-3xl">
              رشته‌ات را انتخاب کن
            </h2>
          </div>
          <p className="hidden max-w-sm text-left text-sm leading-7 text-surface-500 md:block">
            کتاب‌های هر رشته را یک‌جا ببین و سریع‌تر به گزینه مناسب برس.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {FIELDS_OF_STUDY.map((field) => {
            const colors = fieldColors[field.id] || fieldColors.experimental;
            return (
              <Link
                key={field.id}
                href={`/marketplace?field=${field.id}`}
                className="group relative min-h-40 overflow-hidden rounded-[22px] border border-surface-100 bg-white p-4 shadow-[0_1px_2px_rgba(10,17,56,0.04)] transition duration-300 hover:-translate-y-1 hover:border-navy-200 hover:shadow-[0_16px_36px_rgba(10,17,56,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 md:p-5">
                <span className={`absolute inset-x-0 bottom-0 h-1 ${colors.line}`} />
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${colors.surface}`}>
                  {fieldIcons[field.id]}
                </span>
                <span className={`mt-5 block text-base font-black ${colors.text}`}>
                  {field.label}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-surface-400 transition-colors group-hover:text-navy-600">
                  مشاهده کتاب‌ها
                  <svg className="h-3.5 w-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
