import { getCurrentUser } from "@/lib/auth-actions";
import { redirect } from "next/navigation";
import CreateListingForm from "@/components/create-listing/CreateListingForm";

export const metadata = {
  title: "اهدای کتاب",
  description: "کتاب کنکور خود را رایگان اهدا کنید",
};

export default async function CreateListingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) redirect("/auth/login");

  return (
    <main className="relative overflow-hidden bg-surface-50/60 pb-14 pt-7 sm:pb-20 sm:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_75%_10%,rgba(249,115,22,0.08),transparent_32%),radial-gradient(circle_at_18%_0%,rgba(30,58,138,0.07),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-7 max-w-3xl sm:mb-9">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold text-accent-600">
            <span className="h-px w-7 bg-accent-400" />
            بخون و ببخش
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-tight text-navy-900 sm:text-4xl">
            کتابت را برای اهدا آماده کن
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-surface-500 sm:text-base">
            چند مشخصه کوتاه را وارد کن؛ پیش‌نمایش آگهی هم‌زمان ساخته می‌شود و قبل از انتشار می‌توانی همه‌چیز را بازبینی کنی.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["اهدای کاملاً رایگان", "کمتر از ۳ دقیقه", "قابل ویرایش بعد از انتشار"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 bg-white/80 px-3 py-1.5 text-xs font-bold text-surface-600 shadow-sm backdrop-blur">
                <span className="text-success-600">✓</span>
                {item}
              </span>
            ))}
          </div>
        </header>

        <CreateListingForm />
      </div>
    </main>
  );
}
