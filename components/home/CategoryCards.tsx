import Link from "next/link";
import { FIELDS_OF_STUDY } from "@/lib/constants";

const fieldColors: Record<string, { bg: string; hover: string; text: string; shadow: string }> = {
  experimental: { bg: "bg-emerald-50", hover: "hover:bg-emerald-100", text: "text-emerald-700", shadow: "shadow-emerald-100" },
  mathematics: { bg: "bg-blue-50", hover: "hover:bg-blue-100", text: "text-blue-700", shadow: "shadow-blue-100" },
  humanities: { bg: "bg-purple-50", hover: "hover:bg-purple-100", text: "text-purple-700", shadow: "shadow-purple-100" },
  art: { bg: "bg-rose-50", hover: "hover:bg-rose-100", text: "text-rose-700", shadow: "shadow-rose-100" },
  languages: { bg: "bg-amber-50", hover: "hover:bg-amber-100", text: "text-amber-700", shadow: "shadow-amber-100" },
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
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-navy-800 mb-8 text-center">
        رشته‌ات رو انتخاب کن
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {FIELDS_OF_STUDY.map((field) => {
          const colors = fieldColors[field.id] || fieldColors.experimental;
          return (
            <Link
              key={field.id}
              href={`/marketplace?field=${field.id}`}
              className={`group flex flex-col items-center gap-3 p-5 md:p-6 rounded-2xl ${colors.bg} ${colors.hover} transition-all duration-300 card-hover`}
            >
              <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">
                {fieldIcons[field.id]}
              </span>
              <span className={`font-bold text-sm md:text-base ${colors.text}`}>
                {field.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
