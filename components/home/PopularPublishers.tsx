import { PUBLISHERS } from "@/lib/constants";
import Link from "next/link";

export default function PopularPublishers() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-xl md:text-2xl font-bold text-navy-800 mb-6 text-center">
        ناشران محبوب
      </h2>

      <div className="flex gap-3 overflow-x-auto scrollbar-hidden pb-2">
        {PUBLISHERS.map((publisher) => (
          <Link
            key={publisher.id}
            href={`/marketplace?publisher=${publisher.id}`}
            className="flex flex-col items-center gap-2 min-w-[100px] p-4 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 card-hover"
          >
            <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center text-2xl">
              📘
            </div>
            <span className="text-xs font-medium text-surface-700 text-center whitespace-nowrap">
              {publisher.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
