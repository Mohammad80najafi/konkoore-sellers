import Image from "next/image";
import Link from "next/link";
import { FIELDS_OF_STUDY } from "@/lib/constants";

const fieldColors: Record<
  string,
  { surface: string; text: string; line: string }
> = {
  experimental: {
    surface: "bg-emerald-50",
    text: "text-emerald-700",
    line: "bg-emerald-400",
  },
  mathematics: {
    surface: "bg-blue-50",
    text: "text-blue-700",
    line: "bg-blue-400",
  },
  humanities: {
    surface: "bg-purple-50",
    text: "text-purple-700",
    line: "bg-purple-400",
  },
  art: { surface: "bg-rose-50", text: "text-rose-700", line: "bg-rose-400" },
  languages: {
    surface: "bg-amber-50",
    text: "text-amber-700",
    line: "bg-amber-400",
  },
};

const fieldIcons: Record<string, string> = {
  experimental: "🔬",
  mathematics: "📐",
  humanities: "📚",
  art: "🎨",
  languages: "🌍",
};

const fieldImages: Record<string, string> = {
  experimental: "/images/home/categories/experimental.webp",
  mathematics: "/images/home/categories/mathematics.webp",
  humanities: "/images/home/categories/humanities.webp",
  art: "/images/home/categories/art.webp",
  languages: "/images/home/categories/languages.webp",
};

export default function CategoryCards() {
  return (
    <section className="border-surface-100 border-b bg-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-accent-600 text-xs font-bold">
              از مسیر خودت شروع کن
            </span>
            <h2 className="text-navy-800 mt-2 text-2xl font-black tracking-tight md:text-3xl">
              رشته‌ات را انتخاب کن
            </h2>
          </div>
          <p className="text-surface-500 hidden max-w-sm text-left text-sm leading-7 md:block">
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
                className="group border-surface-100 hover:border-navy-200 focus-visible:ring-navy-500 relative min-h-52 overflow-hidden rounded-[22px] border bg-white shadow-[0_1px_2px_rgba(10,17,56,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(10,17,56,0.1)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span
                  className={`absolute inset-x-0 bottom-0 h-1 ${colors.line}`}
                />
                <div className="bg-surface-50 relative h-28 overflow-hidden">
                  <Image
                    src={fieldImages[field.id] || fieldImages.experimental}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 50vw, 20vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <span className={`block text-base font-black ${colors.text}`}>
                    {field.label}
                  </span>
                  <span className="text-surface-400 group-hover:text-navy-600 mt-1.5 flex items-center gap-1 text-[11px] font-medium transition-colors">
                    مشاهده کتاب‌ها
                    <svg
                      className="h-3.5 w-3.5 rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
