"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn, toPersianDigits } from "@/lib/utils";
import {
  BOOK_CONDITIONS,
  FIELDS_OF_STUDY,
  GRADES,
  PROVINCES,
  PUBLISHERS,
  SUBJECTS,
} from "@/lib/constants";
import { createListingAction } from "@/lib/auth-actions";

type Step = 1 | 2 | 3 | 4;

const MAX_IMAGES = 8;

const steps = [
  {
    id: 1,
    label: "مشخصات کتاب",
    shortLabel: "کتاب",
    description: "عنوان، رشته و عکس‌های کتاب",
  },
  {
    id: 2,
    label: "وضعیت کتاب",
    shortLabel: "وضعیت",
    description: "چاپ، ویرایش و جزئیات ظاهری",
  },
  {
    id: 3,
    label: "قیمت و تحویل",
    shortLabel: "قیمت",
    description: "قیمت‌گذاری و روش دریافت",
  },
  {
    id: 4,
    label: "بازبینی و انتشار",
    shortLabel: "انتشار",
    description: "توضیحات نهایی و پیش‌نمایش",
  },
] as const;

export default function CreateListingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [field, setField] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [condition, setCondition] = useState("");
  const [year, setYear] = useState("1405");
  const [edition, setEdition] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [price, setPrice] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [shippingAvailable, setShippingAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(false);
  const [description, setDescription] = useState("");
  const [highlighting, setHighlighting] = useState(false);
  const [handwrittenNotes, setHandwrittenNotes] = useState(false);
  const [tornPages, setTornPages] = useState(false);
  const [missingPages, setMissingPages] = useState(false);
  const [answersCompleted, setAnswersCompleted] = useState(false);
  const [coverDamaged, setCoverDamaged] = useState(false);
  const [hasCd, setHasCd] = useState(false);
  const [hasSupplement, setHasSupplement] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSubjects = field ? SUBJECTS[field] || [] : [];
  const selectedProvince = PROVINCES.find((item) => item.name === province);
  const cities = selectedProvince?.cities || [];
  const selectedCondition = BOOK_CONDITIONS.find((item) => item.id === condition);
  const activeStep = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;
  const hasPrice = Number(price) > 0;
  const hasOriginalPrice = Number(originalPrice) > 0;
  const discount =
    hasPrice && hasOriginalPrice
      ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
      : 0;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return Boolean(
          field &&
            grade &&
            subject &&
            title.trim() &&
            author.trim() &&
            publisher
        );
      case 2:
        return Boolean(condition && year);
      case 3:
        return Boolean(price && originalPrice && province && city);
      case 4:
        return true;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - images.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    for (const file of filesToProcess) {
      if (file.size > 5 * 1024 * 1024) continue;
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.url) setImages((current) => [...current, data.url]);
      } catch {
        // A failed image is skipped so the remaining files can still upload.
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsLoading(true);
    setError(null);

    const result = await createListingAction({
      title: title.trim(),
      author: author.trim(),
      publisher,
      field,
      grade,
      subject,
      originalPrice: Number(originalPrice),
      price: Number(price),
      condition,
      year: Number(year),
      edition: edition ? Number(edition) : undefined,
      city,
      province,
      shippingAvailable,
      pickupAvailable,
      description: description.trim() || undefined,
      highlighting,
      handwrittenNotes,
      tornPages,
      missingPages,
      answersCompleted,
      coverDamaged,
      hasCd,
      hasSupplement,
      images: images.map((url, index) => ({
        url,
        alt: `${title} - ${index + 1}`,
        isPrimary: index === 0,
      })),
    });

    setIsLoading(false);

    if (result.success && result.listingId) {
      router.push("/dashboard");
    } else {
      setError(result.error || "خطایی رخ داد. دوباره تلاش کنید.");
    }
  };

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-7">
      <section className="overflow-hidden rounded-[1.75rem] border border-surface-200/80 bg-white shadow-[0_18px_55px_-34px_rgba(15,23,42,0.35)]">
        <header className="border-b border-surface-100 bg-[linear-gradient(135deg,#fff_0%,#fbfcff_55%,#fff7ed_100%)] px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-700 text-sm font-black text-white shadow-lg shadow-navy-900/15">
              {toPersianDigits(currentStep)}
            </span>
            <div>
              <p className="mb-1 text-xs font-bold tracking-wide text-accent-600">
                مرحله {toPersianDigits(currentStep)} از {toPersianDigits(steps.length)}
              </p>
              <h2 className="text-xl font-black text-navy-900 sm:text-2xl">
                {activeStep.label}
              </h2>
              <p className="mt-1 text-sm leading-6 text-surface-500">
                {activeStep.description}
              </p>
            </div>
          </div>
        </header>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {error && (
            <div
              className="mb-6 flex items-start gap-3 rounded-2xl border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700"
              role="alert"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger-100 font-bold">
                !
              </span>
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <FormLabel title="رشته تحصیلی" hint="کتاب برای کدام گروه درسی است؟" />
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {FIELDS_OF_STUDY.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setField(item.id);
                        setSubject("");
                      }}
                      className={cn(
                        "group relative flex min-h-24 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-3 py-3 text-xs font-bold transition-all",
                        field === item.id
                          ? "border-navy-700 bg-navy-700 text-white shadow-lg shadow-navy-900/15"
                          : "border-surface-200 bg-surface-50/60 text-surface-700 hover:-translate-y-0.5 hover:border-navy-300 hover:bg-white"
                      )}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span>{item.label}</span>
                      {field === item.id && (
                        <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel title="پایه تحصیلی" hint="مناسب‌ترین پایه را انتخاب کنید" />
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {GRADES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGrade(item.id)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-sm font-bold transition-all",
                        grade === item.id
                          ? "border-navy-700 bg-navy-50 text-navy-800 shadow-[inset_0_-2px_0_#1e3a8a]"
                          : "border-surface-200 bg-white text-surface-600 hover:border-navy-300 hover:text-navy-700"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-surface-100 bg-surface-50/70 p-4 sm:p-5">
                <FormLabel title="درس" hint="بعد از انتخاب رشته، درس‌های مرتبط اینجا نمایش داده می‌شوند" />
                <div className="flex min-h-8 flex-wrap gap-2">
                  {selectedSubjects.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSubject(item.id)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-xs font-bold transition-all",
                        subject === item.id
                          ? "border-accent-500 bg-accent-500 text-white shadow-sm"
                          : "border-surface-200 bg-white text-surface-600 hover:border-accent-300 hover:text-accent-700"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                  {selectedSubjects.length === 0 && (
                    <p className="flex items-center gap-2 text-xs text-surface-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-surface-300" />
                      ابتدا رشته تحصیلی را انتخاب کنید
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="عنوان دقیق کتاب"
                  placeholder="مثال: زیست‌شناسی جامع خیلی سبز"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-12 rounded-2xl"
                />
                <Input
                  label="نویسنده یا مؤلف"
                  placeholder="مثال: دکتر احمدی"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div>
                <FormLabel title="ناشر" hint="نام ناشر روی جلد کتاب را انتخاب کنید" />
                <div className="flex flex-wrap gap-2">
                  {PUBLISHERS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPublisher(item.name)}
                      className={cn(
                        "rounded-xl border px-3.5 py-2 text-xs font-bold transition-all",
                        publisher === item.name
                          ? "border-navy-700 bg-navy-700 text-white"
                          : "border-surface-200 bg-white text-surface-600 hover:border-navy-300"
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-end justify-between gap-4">
                  <FormLabel
                    title="عکس‌های کتاب"
                    hint="عکس اول، تصویر اصلی آگهی خواهد بود"
                    className="mb-0"
                  />
                  <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">
                    {toPersianDigits(images.length)} / {toPersianDigits(MAX_IMAGES)}
                  </span>
                </div>

                {images.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {images.map((image, index) => (
                      <div
                        key={image}
                        className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-surface-200 bg-surface-100"
                      >
                        <span
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${image})` }}
                          role="img"
                          aria-label={`عکس ${toPersianDigits(index + 1)} کتاب`}
                        />
                        {index === 0 && (
                          <span className="absolute bottom-2 right-2 rounded-full bg-navy-800/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                            عکس اصلی
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-base font-bold text-danger-600 opacity-100 shadow-sm transition sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label={`حذف عکس ${toPersianDigits(index + 1)}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex w-full items-center gap-4 rounded-2xl border-2 border-dashed border-surface-200 bg-surface-50/70 p-5 text-right transition-all hover:border-accent-300 hover:bg-accent-50/40 sm:p-6"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-accent-600 shadow-sm ring-1 ring-surface-100 transition-transform group-hover:-rotate-3 group-hover:scale-105">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 16.5V8a2 2 0 012-2h3l1.5-2h5L16 6h3a2 2 0 012 2v8.5a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v6m-3-3h6" />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-black text-navy-800">افزودن عکس از کتاب</span>
                      <span className="mt-1 block text-xs leading-5 text-surface-500">تا ۸ عکس JPG، PNG یا WebP؛ هر فایل حداکثر ۵ مگابایت</span>
                    </span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <FormLabel title="وضعیت کلی کتاب" hint="گزینه‌ای را انتخاب کنید که با ظاهر واقعی کتاب تطابق دارد" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {BOOK_CONDITIONS.map((item) => (
                    <label
                      key={item.id}
                      className={cn(
                        "relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all",
                        condition === item.id
                          ? "border-navy-500 bg-navy-50 shadow-[0_8px_22px_-16px_rgba(30,58,138,0.8)]"
                          : "border-surface-200 bg-white hover:border-navy-200"
                      )}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value={item.id}
                        checked={condition === item.id}
                        onChange={() => setCondition(item.id)}
                        className="mt-1 h-4 w-4 accent-navy-700"
                      />
                      <span>
                        <span className="block text-sm font-black text-navy-800">{item.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-surface-500">{item.description}</span>
                      </span>
                      {condition === item.id && (
                        <span className="absolute left-3 top-3 h-2 w-2 rounded-full bg-accent-500" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 rounded-2xl border border-surface-100 bg-surface-50/70 p-4 sm:grid-cols-2 sm:p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-surface-700" htmlFor="print-year">سال چاپ</label>
                  <select
                    id="print-year"
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-surface-200 bg-white px-4 text-sm text-surface-800 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                  >
                    {Array.from({ length: 27 }, (_, index) => 1406 - index).map((item) => (
                      <option key={item} value={item}>{toPersianDigits(item)}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="ویرایش کتاب (اختیاری)"
                  type="number"
                  placeholder="مثال: ۳"
                  value={edition}
                  onChange={(event) => setEdition(event.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div>
                <FormLabel title="جزئیات وضعیت" hint="این بخش اعتماد خریدار را بیشتر می‌کند؛ دقیق انتخاب کنید" />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    { label: "هایلایت شده", value: highlighting, setter: setHighlighting },
                    { label: "یادداشت دست‌نویس", value: handwrittenNotes, setter: setHandwrittenNotes },
                    { label: "صفحات پاره", value: tornPages, setter: setTornPages },
                    { label: "صفحات گمشده", value: missingPages, setter: setMissingPages },
                    { label: "تست‌ها پاسخ داده شده", value: answersCompleted, setter: setAnswersCompleted },
                    { label: "جلد آسیب‌دیده", value: coverDamaged, setter: setCoverDamaged },
                    { label: "دارای سی‌دی", value: hasCd, setter: setHasCd },
                    { label: "دارای کتاب تکمیلی", value: hasSupplement, setter: setHasSupplement },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-bold transition-all",
                        item.value
                          ? "border-accent-200 bg-accent-50 text-accent-800"
                          : "border-surface-200 bg-white text-surface-600 hover:border-surface-300"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(event) => item.setter(event.target.checked)}
                        className="h-4 w-4 rounded accent-accent-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="rounded-3xl bg-navy-800 p-5 text-white sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black">قیمت‌گذاری منصفانه</p>
                    <p className="mt-1 text-xs leading-5 text-white/60">قیمت مناسب، شانس فروش سریع‌تر را بیشتر می‌کند.</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">تومان</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="قیمت کتاب نو"
                    type="number"
                    placeholder="۵۰۰٬۰۰۰"
                    value={originalPrice}
                    onChange={(event) => setOriginalPrice(event.target.value)}
                    className="h-12 rounded-2xl border-white/10 bg-white/95"
                  />
                  <Input
                    label="قیمت پیشنهادی شما"
                    type="number"
                    placeholder="۲۵۰٬۰۰۰"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="h-12 rounded-2xl border-white/10 bg-white/95"
                  />
                </div>
                {(hasPrice || hasOriginalPrice) && (
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {hasOriginalPrice && (
                      <span className="rounded-full bg-white/10 px-3 py-1.5">نو: {Number(originalPrice).toLocaleString("fa-IR")} تومان</span>
                    )}
                    {hasPrice && (
                      <span className="rounded-full bg-accent-500 px-3 py-1.5 font-bold">فروش: {Number(price).toLocaleString("fa-IR")} تومان</span>
                    )}
                  </div>
                )}
              </div>

              {hasOriginalPrice && hasPrice && (
                <div
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-2xl border p-4 text-sm",
                    discount > 0
                      ? "border-success-100 bg-success-50 text-success-800"
                      : "border-danger-100 bg-danger-50 text-danger-700"
                  )}
                >
                  <span className="font-bold">
                    {discount > 0
                      ? `${toPersianDigits(discount)}٪ ارزان‌تر از نسخه نو`
                      : "قیمت فروش باید کمتر از قیمت کتاب نو باشد"}
                  </span>
                  {discount > 0 && <span className="text-xl">↘</span>}
                </div>
              )}

              <div>
                <FormLabel title="موقعیت کتاب" hint="برای محاسبه فاصله و هماهنگی تحویل" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-surface-700" htmlFor="province">استان</label>
                    <select
                      id="province"
                      value={province}
                      onChange={(event) => {
                        setProvince(event.target.value);
                        setCity("");
                      }}
                      className="h-12 w-full rounded-2xl border border-surface-200 bg-white px-4 text-sm text-surface-800 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                    >
                      <option value="">انتخاب استان</option>
                      {PROVINCES.map((item) => (
                        <option key={item.id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-surface-700" htmlFor="city">شهر</label>
                    <select
                      id="city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      disabled={!province}
                      className="h-12 w-full rounded-2xl border border-surface-200 bg-white px-4 text-sm text-surface-800 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-surface-400"
                    >
                      <option value="">انتخاب شهر</option>
                      {cities.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <FormLabel title="روش تحویل" hint="می‌توانید هر دو روش را فعال کنید" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DeliveryOption
                    checked={shippingAvailable}
                    onChange={setShippingAvailable}
                    icon="↗"
                    title="ارسال پستی"
                    description="پست پیشتاز یا تیپاکس"
                  />
                  <DeliveryOption
                    checked={pickupAvailable}
                    onChange={setPickupAvailable}
                    icon="⌖"
                    title="تحویل حضوری"
                    description={`تحویل در ${city || "شهر شما"}`}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-surface-700" htmlFor="description">توضیحات تکمیلی</label>
                  <span className="text-xs text-surface-400">{toPersianDigits(description.length)} / ۵۰۰</span>
                </div>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value.slice(0, 500))}
                  placeholder="مثلاً: جلد کتاب سالم است، فقط چند صفحه اول با مداد علامت‌گذاری شده..."
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm leading-7 text-surface-800 outline-none transition placeholder:text-surface-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                />
                <p className="mt-2 text-xs leading-5 text-surface-500">جزئیاتی را بنویسید که در عکس‌ها مشخص نیست؛ صداقت، فروش را سریع‌تر می‌کند.</p>
              </div>

              <div>
                <FormLabel title="پیش‌نمایش آگهی" hint="خریدار اطلاعات اصلی را تقریباً به این شکل می‌بیند" />
                <div className="overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-[0_16px_45px_-30px_rgba(15,23,42,0.45)] sm:flex">
                  <div className="relative aspect-[16/10] bg-[linear-gradient(135deg,#f8fafc,#eef2ff)] sm:aspect-auto sm:w-52 sm:shrink-0">
                    {images[0] ? (
                      <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${images[0]})` }} role="img" aria-label="تصویر اصلی آگهی" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-surface-400">
                        <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5.5A1.5 1.5 0 015.5 4H18v16H5.5A1.5 1.5 0 014 18.5v-13zM8 4v16" />
                        </svg>
                        <span className="mt-2 text-xs">بدون تصویر</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        {selectedCondition && <span className="rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-bold text-success-700">{selectedCondition.label}</span>}
                        {publisher && <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] font-bold text-navy-700">{publisher}</span>}
                      </div>
                      <h3 className="text-lg font-black leading-8 text-navy-900">{title || "عنوان کتاب شما"}</h3>
                      <p className="mt-1 text-sm text-surface-500">{author || "نام نویسنده"}</p>
                    </div>
                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-surface-100 pt-4">
                      <div>
                        <span className="block text-xs text-surface-400">قیمت فروش</span>
                        <strong className="mt-1 block text-lg font-black text-navy-800">{hasPrice ? Number(price).toLocaleString("fa-IR") : "—"} <small className="text-xs">تومان</small></strong>
                      </div>
                      <span className="text-xs text-surface-500">{city || "شهر"}، {province || "استان"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-surface-100 bg-surface-50/70 px-5 py-4 sm:px-7 sm:py-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCurrentStep((step) => Math.max(1, step - 1) as Step)}
            disabled={currentStep === 1}
            className="min-w-28"
          >
            مرحله قبل
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={() => setCurrentStep((step) => Math.min(4, step + 1) as Step)}
              disabled={!canProceed()}
              className="min-w-32"
            >
              ادامه
              <span aria-hidden="true">←</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="accent"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!canProceed()}
              className="min-w-36"
            >
              انتشار آگهی
            </Button>
          )}
        </footer>
      </section>

      <aside className="order-first lg:order-none lg:sticky lg:top-24">
        <div className="rounded-[1.75rem] border border-surface-200/80 bg-white p-4 shadow-[0_16px_45px_-34px_rgba(15,23,42,0.38)] sm:p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-surface-400">مراحل آگهی</p>
              <p className="mt-1 text-sm font-black text-navy-900">{toPersianDigits(Math.round(progress))}٪ تکمیل شده</p>
            </div>
            <span className="text-xs font-bold text-accent-600">{toPersianDigits(currentStep)} / {toPersianDigits(steps.length)}</span>
          </div>
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-100">
            <div className="h-full rounded-full bg-accent-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid grid-cols-4 gap-1 lg:block lg:space-y-1">
            {steps.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => item.id < currentStep && setCurrentStep(item.id)}
                disabled={item.id > currentStep}
                className={cn(
                  "group flex min-w-0 flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition lg:flex-row lg:px-2 lg:py-2.5 lg:text-right",
                  currentStep === item.id && "bg-navy-50",
                  item.id < currentStep && "cursor-pointer hover:bg-surface-50",
                  item.id > currentStep && "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition",
                    currentStep === item.id && "bg-navy-700 text-white",
                    item.id < currentStep && "bg-success-50 text-success-700",
                    item.id > currentStep && "bg-surface-100 text-surface-400"
                  )}
                >
                  {item.id < currentStep ? "✓" : toPersianDigits(item.id)}
                </span>
                <span className="min-w-0">
                  <span className={cn("block truncate text-[11px] font-bold lg:text-xs", currentStep === item.id ? "text-navy-800" : "text-surface-500")}>{item.shortLabel}</span>
                  <span className="mt-0.5 hidden text-[10px] leading-4 text-surface-400 lg:block">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 hidden overflow-hidden rounded-[1.75rem] bg-navy-900 text-white lg:block">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-white/55">پیش‌نویس زنده</p>
              <span className="h-2 w-2 rounded-full bg-accent-400 shadow-[0_0_0_4px_rgba(249,115,22,0.12)]" />
            </div>
            <h3 className="mt-4 line-clamp-2 text-base font-black leading-7">{title || "عنوان کتاب اینجا دیده می‌شود"}</h3>
            <p className="mt-1 truncate text-xs text-white/50">{author || "هنوز نویسنده را وارد نکرده‌اید"}</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-white/10 border-b border-white/10">
            <div className="p-4">
              <span className="block text-[10px] text-white/45">عکس‌ها</span>
              <strong className="mt-1 block text-sm">{toPersianDigits(images.length)} تصویر</strong>
            </div>
            <div className="p-4">
              <span className="block text-[10px] text-white/45">موقعیت</span>
              <strong className="mt-1 block truncate text-sm">{city || "انتخاب نشده"}</strong>
            </div>
          </div>
          <div className="p-5">
            <span className="block text-[10px] text-white/45">قیمت پیشنهادی</span>
            <strong className="mt-1 block text-lg font-black text-accent-300">{hasPrice ? Number(price).toLocaleString("fa-IR") : "—"} <small className="text-[10px] text-white/50">تومان</small></strong>
          </div>
        </div>

        <div className="mt-4 hidden items-start gap-3 rounded-2xl border border-accent-100 bg-accent-50/70 p-4 lg:flex">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-sm">✦</span>
          <p className="text-xs leading-5 text-accent-900">آگهی‌های دارای عکس واضح و قیمت منصفانه، معمولاً زودتر پیام می‌گیرند.</p>
        </div>
      </aside>
    </div>
  );
}

function FormLabel({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3", className)}>
      <p className="text-sm font-black text-navy-900">{title}</p>
      {hint && <p className="mt-1 text-xs leading-5 text-surface-500">{hint}</p>}
    </div>
  );
}

function DeliveryOption({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all",
        checked
          ? "border-navy-300 bg-navy-50"
          : "border-surface-200 bg-white hover:border-surface-300"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
          checked ? "bg-navy-700 text-white" : "bg-surface-100 text-surface-500"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-navy-800">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-surface-500">{description}</span>
      </span>
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold",
          checked ? "border-accent-500 bg-accent-500 text-white" : "border-surface-300 text-transparent"
        )}
      >
        ✓
      </span>
    </label>
  );
}
