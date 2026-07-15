import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-100 flex items-center justify-center">
          <span className="text-4xl">📚</span>
        </div>
        <h1 className="text-4xl font-black text-navy-800 mb-3">۴۰۴</h1>
        <h2 className="text-lg font-bold text-surface-700 mb-2">صفحه یافت نشد</h2>
        <p className="text-sm text-surface-500 mb-6">
          صفحه مورد نظر شما وجود ندارد یا منتقل شده است.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
          >
            صفحه اصلی
          </Link>
          <Link
            href="/marketplace"
            className="px-5 py-2.5 border border-navy-200 text-navy-700 text-sm font-semibold rounded-xl hover:bg-navy-50 transition-colors"
          >
            کتاب‌های اهدایی
          </Link>
        </div>
      </div>
    </div>
  );
}
