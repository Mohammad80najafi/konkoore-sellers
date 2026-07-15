"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { updateListingStatusAction, updateProfileAction } from "@/lib/auth-actions";
import { PROVINCES } from "@/lib/constants";
import type { SellerListing, User } from "@/lib/types";
import { cn, toJalali, toPersianDigits } from "@/lib/utils";

interface DashboardClientProps {
  currentUser: User;
  initialListings: SellerListing[];
}

type DashboardTab = "listings" | "edit-profile";

const conditionLabels: Record<string, string> = {
  "like-new": "در حد نو",
  excellent: "عالی",
  good: "خوب",
  acceptable: "قابل قبول",
  used: "استفاده‌شده",
};

const statusLabels: Record<string, string> = {
  active: "فعال",
  sold: "اهداشده",
  reserved: "رزرو شده",
  expired: "منقضی‌شده",
  pending: "در انتظار بررسی",
};

export default function DashboardClient({
  currentUser,
  initialListings,
}: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>("listings");
  const [listings, setListings] = useState(initialListings);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || "");
  const [selectedProvince, setSelectedProvince] = useState(
    currentUser.province || "تهران"
  );
  const [selectedCity, setSelectedCity] = useState(currentUser.city || "تهران");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const selectedProvinceData = PROVINCES.find(
    (province) => province.name === selectedProvince
  );
  const cities = selectedProvinceData?.cities || [];
  const activeListings = listings.filter((listing) => listing.status === "active").length;
  const donatedListings = listings.filter((listing) => listing.status === "sold").length;
  const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
  const totalFavorites = listings.reduce((sum, listing) => sum + listing.favorites, 0);
  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
    : "ک";

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const province = event.target.value;
    const provinceData = PROVINCES.find((item) => item.name === province);
    setSelectedProvince(province);
    setSelectedCity(provinceData?.cities[0] || "");
    setProfileMessage(null);
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    const result = await updateProfileAction(currentUser._id, {
      name,
      email,
      province: selectedProvince,
      city: selectedCity,
    });

    setIsSavingProfile(false);

    if (result.success) {
      setProfileMessage({
        type: "success",
        text: "اطلاعات حساب با موفقیت به‌روزرسانی شد.",
      });
      router.refresh();
    } else {
      setProfileMessage({
        type: "error",
        text: result.error || "ذخیره اطلاعات انجام نشد. دوباره تلاش کنید.",
      });
    }
  };

  const handleMarkAsDonated = async (listingId: string) => {
    setActionLoadingId(listingId);
    const result = await updateListingStatusAction(listingId, "sold");
    setActionLoadingId(null);

    if (result.success) {
      setListings((current) =>
        current.map((listing) =>
          listing._id === listingId ? { ...listing, status: "sold" } : listing
        )
      );
      router.refresh();
    }
  };

  return (
    <main className="relative overflow-hidden bg-surface-50/60 pb-16 pt-7 sm:pb-20 sm:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_78%_0%,rgba(30,58,138,0.08),transparent_34%),radial-gradient(circle_at_18%_12%,rgba(249,115,22,0.07),transparent_28%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-accent-600">
              <span className="h-px w-7 bg-accent-400" />
              میز کار اهداکننده
            </div>
            <h1 className="text-3xl font-black tracking-tight text-navy-900 sm:text-4xl">
              سلام {currentUser.name.split(" ")[0]}، اینجا همه‌چیز مرتب است
            </h1>
            <p className="mt-2 text-sm leading-7 text-surface-500">
              آگهی‌ها، درخواست‌های دریافت و اطلاعات حسابت را از یک‌جا مدیریت کن.
            </p>
          </div>

          <Link
            href="/create-listing"
            className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-2xl bg-accent-500 px-5 text-sm font-black text-white shadow-lg shadow-accent-500/20 transition hover:-translate-y-0.5 hover:bg-accent-600 sm:self-auto"
          >
            <span className="text-xl leading-none">+</span>
            ثبت آگهی جدید
          </Link>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-7">
          <section className="min-w-0">
            <div className="overflow-hidden rounded-[1.75rem] bg-navy-900 text-white shadow-[0_18px_55px_-34px_rgba(15,23,42,0.7)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                    اثر مهربانی تو
                  </p>
                  <p className="mt-1 text-sm font-black">عملکرد همه آگهی‌ها</p>
                </div>
                <span className="flex items-center gap-2 text-xs text-white/55">
                  <span className="h-2 w-2 rounded-full bg-success-400 shadow-[0_0_0_4px_rgba(74,222,128,0.12)]" />
                  به‌روز
                </span>
              </div>

              <div className="grid grid-cols-2 divide-x divide-x-reverse divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
                <Metric label="آگهی فعال" value={activeListings} suffix="آگهی" accent />
                <Metric label="اهداشده" value={donatedListings} suffix="کتاب" />
                <Metric label="مجموع بازدید" value={totalViews} suffix="بازدید" />
                <Metric label="علاقه‌مندی‌ها" value={totalFavorites} suffix="نفر" />
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-surface-200/80 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-4 border-b border-surface-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-xl font-black text-navy-900">
                    {activeTab === "listings" ? "آگهی‌های من" : "اطلاعات حساب"}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-surface-500">
                    {activeTab === "listings"
                      ? "وضعیت اهدا و بازخورد هر کتاب را دنبال کن."
                      : "نام و موقعیت نمایش‌داده‌شده در آگهی‌ها را ویرایش کن."}
                  </p>
                </div>

                <div className="flex rounded-xl bg-surface-100 p-1" role="tablist" aria-label="بخش‌های داشبورد">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "listings"}
                    onClick={() => setActiveTab("listings")}
                    className={cn(
                      "flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-black transition sm:flex-none",
                      activeTab === "listings"
                        ? "bg-white text-navy-800 shadow-sm"
                        : "text-surface-500 hover:text-surface-700"
                    )}
                  >
                    آگهی‌ها ({toPersianDigits(listings.length)})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "edit-profile"}
                    onClick={() => setActiveTab("edit-profile")}
                    className={cn(
                      "flex-1 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-black transition sm:flex-none",
                      activeTab === "edit-profile"
                        ? "bg-white text-navy-800 shadow-sm"
                        : "text-surface-500 hover:text-surface-700"
                    )}
                  >
                    ویرایش پروفایل
                  </button>
                </div>
              </div>

              {activeTab === "listings" ? (
                listings.length === 0 ? (
                  <div className="flex min-h-96 flex-col items-center justify-center px-6 py-12 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5.5A1.5 1.5 0 015.5 4H18v16H5.5A1.5 1.5 0 014 18.5v-13zM8 4v16" />
                      </svg>
                    </span>
                    <h3 className="mt-5 text-lg font-black text-navy-900">اولین کتابت منتظر یک دانش‌آموز است</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-surface-500">از کتاب چند عکس بگیر، روش تحویل را مشخص کن و اولین اهدایت را ثبت کن.</p>
                    <Link href="/create-listing" className="mt-6 rounded-xl border-2 border-navy-200 px-4 py-2.5 text-sm font-black text-navy-700 transition hover:bg-navy-50">ثبت اولین آگهی</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-surface-100">
                    {listings.map((listing) => (
                      <article
                        key={listing._id}
                        className={cn(
                          "group relative p-4 transition hover:bg-surface-50/60 sm:p-5",
                          listing.status === "sold" && "bg-surface-50/40"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute inset-y-5 right-0 w-1 rounded-l-full",
                            listing.status === "active" ? "bg-accent-500" : "bg-surface-200"
                          )}
                        />

                        <div className="flex gap-4 sm:gap-5">
                          <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-surface-200 bg-[linear-gradient(135deg,#f8fafc,#eef2ff)] sm:h-32 sm:w-24">
                            {listing.book.coverImage ? (
                              <Image
                                src={listing.book.coverImage}
                                alt={listing.book.title}
                                fill
                                sizes="96px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-400">
                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5.5A1.5 1.5 0 015.5 4H18v16H5.5A1.5 1.5 0 014 18.5v-13zM8 4v16" />
                                </svg>
                                <span className="mt-1 text-[10px]">بدون عکس</span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-sm font-black text-navy-900 sm:text-base">{listing.book.title}</h3>
                                  <StatusBadge status={listing.status} />
                                </div>
                                <p className="mt-1 truncate text-xs text-surface-500">
                                  {listing.book.publisher.name} · {listing.book.author}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-success-50 px-3 py-1 text-xs font-black text-success-700">اهدای رایگان</span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-surface-500">
                              <span className="rounded-full bg-surface-100 px-2.5 py-1">وضعیت: {conditionLabels[listing.condition.grade] || "استفاده‌شده"}</span>
                              <span className="rounded-full bg-surface-100 px-2.5 py-1">{toPersianDigits(listing.views)} بازدید</span>
                              <span className="rounded-full bg-surface-100 px-2.5 py-1">{toPersianDigits(listing.favorites)} علاقه‌مندی</span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-surface-100 pt-3">
                              <Link
                                href={`/listing/${listing._id}`}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-black text-navy-700 transition hover:bg-navy-50"
                              >
                                مشاهده آگهی
                              </Link>
                              {listing.status === "active" ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsDonated(listing._id)}
                                  isLoading={actionLoadingId === listing._id}
                                  className="mr-auto px-2.5 py-1.5 text-xs text-surface-500 hover:text-success-700"
                                >
                                  ثبت به‌عنوان اهداشده
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )
              ) : (
                <div className="p-5 sm:p-7">
                  {profileMessage ? (
                    <div
                      className={cn(
                        "mb-6 flex items-center gap-2 rounded-xl border p-4 text-xs font-bold",
                        profileMessage.type === "success"
                          ? "border-success-200 bg-success-50 text-success-700"
                          : "border-danger-200 bg-danger-50 text-danger-700"
                      )}
                      role="status"
                    >
                      <span>{profileMessage.type === "success" ? "✓" : "!"}</span>
                      {profileMessage.text}
                    </div>
                  ) : null}

                  <form onSubmit={handleProfileSubmit} className="max-w-2xl space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="نام و نام خانوادگی"
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                          setProfileMessage(null);
                        }}
                        required
                        className="h-12 rounded-2xl"
                      />
                      <Input
                        label="ایمیل (اختیاری)"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setProfileMessage(null);
                        }}
                        className="h-12 rounded-2xl text-left font-mono"
                      />
                    </div>

                    <div className="grid gap-5 rounded-2xl border border-surface-100 bg-surface-50/70 p-4 sm:grid-cols-2 sm:p-5">
                      <SelectField
                        id="dashboard-province"
                        label="استان"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        options={PROVINCES.map((province) => province.name)}
                      />
                      <SelectField
                        id="dashboard-city"
                        label="شهر"
                        value={selectedCity}
                        onChange={(event) => {
                          setSelectedCity(event.target.value);
                          setProfileMessage(null);
                        }}
                        options={cities}
                      />
                    </div>

                    <Button type="submit" isLoading={isSavingProfile} className="min-w-36">
                      ذخیره تغییرات
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </section>

          <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.38)] ring-1 ring-surface-200/80">
              <div className="relative bg-[linear-gradient(145deg,#172554,#1e3a8a)] p-5 text-white sm:p-6">
                <span className="absolute left-5 top-5 h-2 w-2 rounded-full bg-accent-400 shadow-[0_0_0_5px_rgba(249,115,22,0.12)]" />
                <div className="flex items-center gap-4 lg:block">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black ring-1 ring-white/15 lg:h-20 lg:w-20 lg:text-2xl">
                    {initials}
                  </div>
                  <div className="min-w-0 lg:mt-4">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-black">{currentUser.name}</h2>
                      {currentUser.isVerified ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-400 text-[10px] font-black text-navy-900" title="اهداکننده تأییدشده">✓</span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-xs text-white/55" dir="ltr">{currentUser.phone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-x-reverse divide-surface-100 border-b border-surface-100">
                <ProfileMetric label="امتیاز" value={toPersianDigits(currentUser.rating.toFixed(1))} />
                <ProfileMetric label="اهدا" value={toPersianDigits(currentUser.totalSales)} />
                <ProfileMetric label="دریافت" value={toPersianDigits(currentUser.totalPurchases)} />
              </div>

              <div className="space-y-3 p-5 text-xs text-surface-500">
                <p className="flex items-center justify-between gap-3">
                  <span>موقعیت</span>
                  <strong className="font-bold text-surface-700">{currentUser.city || "—"}، {currentUser.province || "—"}</strong>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span>عضویت</span>
                  <strong className="font-bold text-surface-700">{toJalali(currentUser.createdAt)}</strong>
                </p>
              </div>
            </div>

            <nav className="rounded-2xl border border-surface-200/80 bg-white p-2 shadow-sm" aria-label="دسترسی سریع داشبورد">
              <Link href="/messages" className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-surface-600 transition hover:bg-surface-50 hover:text-navy-800">
                پیام‌های من
                <span className="text-surface-300">←</span>
              </Link>
              <Link href="/marketplace" className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-surface-600 transition hover:bg-surface-50 hover:text-navy-800">
                مشاهده کتاب‌های اهدایی
                <span className="text-surface-300">←</span>
              </Link>
            </nav>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string;
  value: number;
  suffix: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4 sm:p-5">
      <span className="block text-[10px] text-white/45">{label}</span>
      <strong className={cn("mt-1 block text-xl font-black", accent ? "text-accent-300" : "text-white")}>
        {toPersianDigits(value)} <small className="text-[10px] font-medium text-white/40">{suffix}</small>
      </strong>
    </div>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 text-center">
      <span className="block text-[10px] text-surface-400">{label}</span>
      <strong className="mt-1 block text-sm font-black text-navy-800">{value}</strong>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black",
        status === "active" && "bg-success-50 text-success-700",
        status === "sold" && "bg-surface-100 text-surface-500",
        status === "reserved" && "bg-warning-50 text-warning-700",
        status === "pending" && "bg-navy-50 text-navy-700",
        status === "expired" && "bg-danger-50 text-danger-600"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-surface-700">{label}</label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-2xl border border-surface-200 bg-white px-4 text-sm text-surface-800 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
