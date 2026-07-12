"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { User, Listing } from "@/lib/types";
import { updateProfileAction, updateListingStatusAction } from "@/lib/auth-actions";
import { toPersianDigits, formatPrice, toJalali } from "@/lib/utils";

// Mock Persian Provinces and Cities
const PROVINCE_CITIES: Record<string, string[]> = {
  "تهران": ["تهران", "ری", "کرج", "ورامین", "شهریار", "قدس", "پاکدشت"],
  "اصفهان": ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر", "فولادشهر"],
  "فارس": ["شیراز", "مرودشت", "جهرم", "فسا", "کازرون", "داراب"],
  "خراسان رضوی": ["مشهد", "سبزوار", "نیشابور", "تربت حیدریه", "قوچان", "کاشمر"],
  "آذربایجان شرقی": ["تبریز", "مراغه", "مرند", "میانه", "اهر", "بناب"],
  "مازندران": ["ساری", "بابل", "آمل", "قائم‌شهر", "بهشهر", "چالوس"],
  "یزد": ["یزد", "میبد", "اردکان", "بافق", "ابرکوه"],
  "خوزستان": ["اهواز", "دزفول", "آبادان", "خرمشهر", "اندیمشک", "ماهشهر"],
};

interface DashboardClientProps {
  currentUser: User;
  initialListings: Listing[];
}

export default function DashboardClient({ currentUser, initialListings }: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"listings" | "edit-profile">("listings");
  const [listings, setListings] = useState<Listing[]>(initialListings);
  
  // Profile Form States
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || "");
  const [selectedProvince, setSelectedProvince] = useState(currentUser.province || "تهران");
  const [selectedCity, setSelectedCity] = useState(currentUser.city || "تهران");
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Action Loading States for Listing Status update
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Handle Province change and auto select first city
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prov = e.target.value;
    setSelectedProvince(prov);
    const cities = PROVINCE_CITIES[prov] || [];
    if (cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  };

  // Submit Profile update Server Action
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);

    const res = await updateProfileAction(currentUser._id, {
      name,
      email,
      province: selectedProvince,
      city: selectedCity,
    });

    setIsSavingProfile(false);
    if (res.success) {
      setProfileMessage({ type: "success", text: "اطلاعات کاربری با موفقیت به روز رسانی شد." });
      router.refresh();
    } else {
      setProfileMessage({ type: "error", text: res.error || "خطایی در ثبت اطلاعات رخ داد." });
    }
  };

  // Mark Listing as Sold Server Action
  const handleMarkAsSold = async (listingId: string) => {
    setActionLoadingId(listingId);
    
    const res = await updateListingStatusAction(listingId, "sold");
    
    setActionLoadingId(null);
    if (res.success) {
      setListings(prev => 
        prev.map(item => item._id === listingId ? { ...item, status: "sold" } : item)
      );
      router.refresh();
    }
  };

  // Get human readable status label in Persian
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success-50 text-success-600">فعال</span>;
      case "sold":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-100 text-surface-500">فروخته شده</span>;
      case "reserved":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-warning-50 text-warning-600">رزرو شده</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-surface-100 text-surface-600">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full animate-fade-in">
      
      {/* 1. Header Profile Box */}
      <div className="bg-white rounded-3xl border border-surface-200/60 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        
        {/* User Info details */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
          
          {/* Circular initials avatar */}
          <div className="w-20 h-20 rounded-full bg-navy-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-elevated">
            {currentUser.name ? currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2) : "U"}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-surface-800">{currentUser.name}</h2>
              {currentUser.isVerified && (
                <span className="w-5 h-5 bg-navy-100 text-navy-600 rounded-full flex items-center justify-center text-[10px] font-bold" title="فروشنده تایید شده">
                  ✓
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-surface-500 font-semibold">{currentUser.phone}</p>
            
            {currentUser.province && currentUser.city && (
              <p className="text-xs text-surface-500 flex items-center justify-center sm:justify-start gap-1">
                <span>📍</span>
                <span>{currentUser.province}، {currentUser.city}</span>
              </p>
            )}
            
            <p className="text-[11px] text-surface-400">
              عضویت از {toJalali(currentUser.createdAt)}
            </p>
          </div>
        </div>

        {/* Sell Book shortcut */}
        <div className="flex items-center gap-3">
          <Link href="/create-listing">
            <Button variant="accent" size="md">
              <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ثبت آگهی کتاب جدید
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. User Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Rating */}
        <div className="bg-white rounded-2xl border border-surface-200/50 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-surface-500">امتیاز فروشنده</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xl font-extrabold text-surface-800 font-mono">
              {toPersianDigits(currentUser.rating.toFixed(1))}
            </span>
            <span className="text-yellow-500 text-lg">★</span>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl border border-surface-200/50 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-surface-500">تعداد فروش</span>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xl font-extrabold text-surface-800 font-mono">
              {toPersianDigits(currentUser.totalSales)}
            </span>
            <span className="text-xs text-surface-400 font-medium">کتاب</span>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white rounded-2xl border border-surface-200/50 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-surface-500">تعداد خرید</span>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xl font-extrabold text-surface-800 font-mono">
              {toPersianDigits(currentUser.totalPurchases)}
            </span>
            <span className="text-xs text-surface-400 font-medium">کتاب</span>
          </div>
        </div>

        {/* Total Listings */}
        <div className="bg-white rounded-2xl border border-surface-200/50 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-surface-500">آگهی‌های شما</span>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xl font-extrabold text-surface-800 font-mono">
              {toPersianDigits(listings.length)}
            </span>
            <span className="text-xs text-surface-400 font-medium">آگهی</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-surface-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "listings"
              ? "border-navy-600 text-navy-700"
              : "border-transparent text-surface-500 hover:text-surface-800"
          }`}
        >
          آگهی‌های من ({toPersianDigits(listings.length)})
        </button>
        <button
          onClick={() => setActiveTab("edit-profile")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "edit-profile"
              ? "border-navy-600 text-navy-700"
              : "border-transparent text-surface-500 hover:text-surface-800"
          }`}
        >
          ویرایش اطلاعات پروفایل
        </button>
      </div>

      {/* 4. Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "listings" ? (
          
          /* listings LIST */
          listings.length === 0 ? (
            <div className="bg-white border border-surface-200/60 rounded-3xl p-12 text-center shadow-sm">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-base font-bold text-surface-700 mb-2">هنوز آگهی ثبت نکرده‌اید</h3>
              <p className="text-xs text-surface-400 mb-6">کتاب‌های کنکور قدیمی خود را ثبت کنید و به کنکوری‌های دیگر بفروشید.</p>
              <Link href="/create-listing">
                <Button variant="outline" size="sm">ثبت اولین آگهی</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <div 
                  key={listing._id}
                  className={`bg-white rounded-2xl border p-5 flex gap-4 transition-all ${
                    listing.status === "sold" 
                      ? "border-surface-200/50 opacity-75 shadow-sm"
                      : "border-surface-200/70 hover:border-navy-200 hover:shadow-md shadow-sm"
                  }`}
                >
                  
                  {/* Book cover (Image placeholder fallback) */}
                  <div className="w-20 h-28 bg-surface-100 rounded-lg relative overflow-hidden shrink-0 flex items-center justify-center border border-surface-200/50">
                    {listing.book.coverImage ? (
                      <Image 
                        src={listing.book.coverImage} 
                        alt={listing.book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-2xl">📖</span>
                    )}
                  </div>

                  {/* Listing Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-surface-800 leading-snug">
                          {listing.book.title}
                        </h4>
                        {getStatusBadge(listing.status)}
                      </div>
                      
                      <p className="text-xs text-surface-500 mt-1">
                        ناشر: {listing.book.publisher.name} | نویسنده: {listing.book.author}
                      </p>
                      
                      <p className="text-xs text-surface-400 mt-0.5">
                        وضعیت کتاب: {
                          listing.condition.grade === "like-new" ? "در حد نو" :
                          listing.condition.grade === "excellent" ? "عالی" :
                          listing.condition.grade === "good" ? "خوب" :
                          listing.condition.grade === "acceptable" ? "قابل قبول" : "استفاده شده"
                        }
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-surface-400">
                        <span>👁 {toPersianDigits(listing.views)} بازدید</span>
                        <span>❤ {toPersianDigits(listing.favorites)} علاقه‌مندی</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-surface-100 pt-3 mt-3">
                      <div>
                        <span className="text-[10px] text-surface-400 block">قیمت فروش:</span>
                        <span className="text-sm font-extrabold text-navy-700 font-mono tracking-wide">
                          {formatPrice(listing.price)}
                        </span>
                      </div>

                      {/* Action buttons based on status */}
                      {listing.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 py-1 font-bold"
                          onClick={() => handleMarkAsSold(listing._id)}
                          isLoading={actionLoadingId === listing._id}
                        >
                          نشان به عنوان فروخته شده
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          
          /* PROFILE EDIT FORM */
          <div className="bg-white border border-surface-200/60 rounded-3xl p-6 sm:p-8 max-w-2xl shadow-sm">
            <h3 className="text-base font-bold text-surface-800 mb-6">ویرایش اطلاعات حساب</h3>
            
            {profileMessage && (
              <div 
                className={`p-4 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2 ${
                  profileMessage.type === "success" 
                    ? "bg-success-50 text-success-600 border border-success-200" 
                    : "bg-danger-50 text-danger-600 border border-danger-200"
                }`}
              >
                <span>{profileMessage.type === "success" ? "✓" : "⚠"}</span>
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Full name input */}
                <Input
                  label="نام و نام خانوادگی"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setProfileMessage(null);
                  }}
                  required
                />

                {/* Email address */}
                <Input
                  label="آدرس ایمیل (اختیاری)"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setProfileMessage(null);
                  }}
                  className="text-left font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Province select */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">استان</label>
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none transition-all duration-200 cursor-pointer"
                  >
                    {Object.keys(PROVINCE_CITIES).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* City select */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">شهر</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setProfileMessage(null);
                    }}
                    className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none transition-all duration-200 cursor-pointer"
                  >
                    {(PROVINCE_CITIES[selectedProvince] || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSavingProfile}
                >
                  ذخیره تغییرات مشخصات
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
