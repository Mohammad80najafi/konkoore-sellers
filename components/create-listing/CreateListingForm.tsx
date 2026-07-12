"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn, toPersianDigits } from "@/lib/utils";
import {
  FIELDS_OF_STUDY,
  GRADES,
  BOOK_CONDITIONS,
  PROVINCES,
  SUBJECTS,
  PUBLISHERS,
} from "@/lib/constants";
import { createListingAction } from "@/lib/auth-actions";

type Step = 1 | 2 | 3 | 4;

const steps = [
  { id: 1, label: "اطلاعات کتاب" },
  { id: 2, label: "وضعیت و جزئیات" },
  { id: 3, label: "قیمت و ارسال" },
  { id: 4, label: "توضیحات" },
];

export default function CreateListingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [field, setField] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [condition, setCondition] = useState<string>("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
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

  const MAX_IMAGES = 8;

  const selectedSubjects = field ? SUBJECTS[field] || [] : [];
  const selectedProvince = PROVINCES.find((p) => p.name === province);
  const cities = selectedProvince?.cities || [];

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!field && !!grade && !!subject && !!title.trim() && !!author.trim() && !!publisher;
      case 2:
        return !!condition && !!year;
      case 3:
        return !!price && !!originalPrice && !!province && !!city;
      case 4:
        return true;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - images.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    filesToProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) return; // max 5MB per image
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
      images: images.map((url, i) => ({ url, alt: `${title} - ${i + 1}`, isPrimary: i === 0 })),
    });

    setIsLoading(false);

    if (result.success && result.listingId) {
      router.push(`/dashboard`);
    } else {
      setError(result.error || "خطایی رخ داد.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
      {/* Step indicator */}
      <div className="border-b border-surface-100 px-6 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    currentStep >= step.id
                      ? "bg-navy-600 text-white"
                      : "bg-surface-100 text-surface-400"
                  )}
                >
                  {currentStep > step.id ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:inline",
                    currentStep >= step.id ? "text-navy-700" : "text-surface-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-16 h-0.5 mx-2 sm:mx-3",
                    currentStep > step.id ? "bg-navy-600" : "bg-surface-100"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="p-6 min-h-[400px]">
        {error && (
          <div className="mb-4 p-3 bg-danger-50 text-danger-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Step 1: Book Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-navy-800">اطلاعات کتاب</h3>

            {/* Field */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-2 block">رشته تحصیلی</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {FIELDS_OF_STUDY.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => { setField(f.id); setSubject(""); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer",
                      field === f.id
                        ? "bg-navy-600 text-white border-navy-600"
                        : "bg-white text-surface-600 border-surface-200 hover:border-navy-300"
                    )}
                  >
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-2 block">پایه تحصیلی</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGrade(g.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                      grade === g.id
                        ? "bg-navy-600 text-white border-navy-600"
                        : "bg-white text-surface-600 border-surface-200 hover:border-navy-300"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-2 block">درس</label>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubject(s.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                      subject === s.id
                        ? "bg-accent-500 text-white border-accent-500"
                        : "bg-white text-surface-600 border-surface-200 hover:border-accent-300"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
                {selectedSubjects.length === 0 && (
                  <p className="text-xs text-surface-400">ابتدا رشته را انتخاب کنید</p>
                )}
              </div>
            </div>

            {/* Title */}
            <Input
              label="عنوان کتاب"
              placeholder="مثال: زیست‌شناسی جامع گاج"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Author */}
            <Input
              label="نویسنده / مولف"
              placeholder="مثال: دکتر احمدی"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />

            {/* Publisher */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-2 block">ناشر</label>
              <div className="flex flex-wrap gap-2">
                {PUBLISHERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPublisher(p.name)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                      publisher === p.name
                        ? "bg-navy-600 text-white border-navy-600"
                        : "bg-white text-surface-600 border-surface-200 hover:border-navy-300"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-2 block">
                عکس‌های کتاب ({images.length}/{MAX_IMAGES})
              </label>
              <p className="text-xs text-surface-400 mb-3">حداقل ۱ و حداکثر ۸ عکس از زاویه‌های مختلف</p>

              {/* Image preview grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-surface-200 group">
                      <img src={img} alt={`عکس ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-1 right-1 text-[9px] bg-navy-600 text-white px-1.5 py-0.5 rounded-md font-medium">
                          اصلی
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 left-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-surface-200 rounded-xl text-surface-400 hover:border-navy-300 hover:text-navy-600 transition-colors cursor-pointer flex flex-col items-center gap-2"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">انتخاب عکس</span>
                  <span className="text-[11px]">JPG, PNG — حداکثر ۵ مگابایت</span>
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

        {/* Step 2: Condition & Details */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-navy-800">وضعیت و جزئیات</h3>

            {/* Condition */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-3 block">وضعیت کتاب</label>
              <div className="space-y-2">
                {BOOK_CONDITIONS.map((c) => (
                  <label
                    key={c.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                      condition === c.id
                        ? "bg-navy-50 border-navy-300 text-navy-700"
                        : "bg-white border-surface-200 text-surface-600 hover:border-surface-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={c.id}
                      checked={condition === c.id}
                      onChange={() => setCondition(c.id)}
                      className="w-4 h-4 accent-navy-600"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{c.label}</span>
                      <p className="text-xs text-surface-500 mt-0.5">{c.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Year & Edition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-surface-700 mb-1.5 block">سال چاپ</label>
                <div className="relative">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none cursor-pointer appearance-none pr-10"
                  >
                    {Array.from({ length: 27 }, (_, i) => 1406 - i).map((y) => (
                      <option key={y} value={y}>{toPersianDigits(y)}</option>
                    ))}
                  </select>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <Input
                label="ویرایش (اختیاری)"
                type="number"
                placeholder="ویرایش"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
              />
            </div>

            {/* Condition defects */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-3 block">جزئیات وضعیت</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "هایلایت شده", value: highlighting, setter: setHighlighting },
                  { label: "یادداشت دست‌نویس", value: handwrittenNotes, setter: setHandwrittenNotes },
                  { label: "صفحات پاره", value: tornPages, setter: setTornPages },
                  { label: "صفحات گمشده", value: missingPages, setter: setMissingPages },
                  { label: "تست‌ها پاسخ داده شده", value: answersCompleted, setter: setAnswersCompleted },
                  { label: "جلد آسیب‌دیده", value: coverDamaged, setter: setCoverDamaged },
                  { label: "سی‌دی دارد", value: hasCd, setter: setHasCd },
                  { label: "کتاب تکمیلی دارد", value: hasSupplement, setter: setHasSupplement },
                ].map((item) => (
                  <label
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm",
                      item.value
                        ? "bg-accent-50 border-accent-200 text-accent-700"
                        : "bg-white border-surface-200 text-surface-600 hover:border-surface-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 accent-accent-500 rounded"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Price & Location */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-navy-800">قیمت و ارسال</h3>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="قیمت نو (تومان)"
                  type="number"
                  placeholder="۵۰۰,۰۰۰"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
                {originalPrice && Number(originalPrice) > 0 && (
                  <p className="text-xs text-surface-500 mt-1">
                    {toPersianDigits(Number(originalPrice).toLocaleString("fa-IR"))} تومان
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="قیمت فروش (تومان)"
                  type="number"
                  placeholder="۲۵۰,۰۰۰"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                {price && Number(price) > 0 && (
                  <p className="text-xs text-surface-500 mt-1">
                    {toPersianDigits(Number(price).toLocaleString("fa-IR"))} تومان
                  </p>
                )}
              </div>
            </div>

            {/* Discount preview */}
            {originalPrice && price && Number(originalPrice) > 0 && Number(price) > 0 && (
              <div className={cn(
                "p-3 text-sm rounded-xl flex items-center gap-2",
                Number(price) < Number(originalPrice) * 0.5
                  ? "bg-success-50 text-success-700"
                  : Number(price) < Number(originalPrice)
                    ? "bg-accent-50 text-accent-700"
                    : "bg-surface-50 text-surface-600"
              )}>
                {Number(price) < Number(originalPrice) * 0.5 && <span>🔥</span>}
                {Number(price) < Number(originalPrice) ? (
                  <span>
                    {toPersianDigits(Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100))}٪ تخفیف نسبت به قیمت نو
                  </span>
                ) : (
                  <span>قیمت فروش باید کمتر از قیمت نو باشد</span>
                )}
              </div>
            )}

            {/* Province & City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-surface-700 mb-1.5 block">استان</label>
                <select
                  value={province}
                  onChange={(e) => { setProvince(e.target.value); setCity(""); }}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none cursor-pointer"
                >
                  <option value="">انتخاب استان</option>
                  {PROVINCES.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-700 mb-1.5 block">شهر</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!province}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-800 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">انتخاب شهر</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <label className="text-sm font-medium text-surface-700 mb-3 block">نحوه ارسال</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all bg-white border-surface-200 hover:border-surface-300">
                  <input
                    type="checkbox"
                    checked={shippingAvailable}
                    onChange={(e) => setShippingAvailable(e.target.checked)}
                    className="w-4 h-4 accent-navy-600 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-surface-700">ارسال پستی</span>
                    <p className="text-xs text-surface-500">ارسال از طریق پست پیشتاز یا تیپاکس</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all bg-white border-surface-200 hover:border-surface-300">
                  <input
                    type="checkbox"
                    checked={pickupAvailable}
                    onChange={(e) => setPickupAvailable(e.target.checked)}
                    className="w-4 h-4 accent-navy-600 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-surface-700">تحویل حضوری</span>
                    <p className="text-xs text-surface-500">تحویل در شهر {city || "شما"}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Description */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-navy-800">توضیحات</h3>

            <div>
              <label className="text-sm font-medium text-surface-700 mb-1.5 block">توضیحات اختیاری</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اطلاعات اضافی درباره کتاب، مثلاً وضعیت جلد، یادداشت‌ها، یا هر نکته دیگری..."
                rows={5}
                className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none resize-none"
              />
              <p className="text-xs text-surface-400 mt-1">حداکثر ۵۰۰ کاراکتر</p>
            </div>

            {/* Summary */}
            <div className="bg-surface-50 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-navy-800">خلاصه آگهی</h4>
              <div className="text-sm text-surface-600 space-y-1">
                <p><span className="font-medium">عنوان:</span> {title}</p>
                <p><span className="font-medium">نویسنده:</span> {author}</p>
                <p><span className="font-medium">ناشر:</span> {publisher}</p>
                <p><span className="font-medium">وضعیت:</span> {BOOK_CONDITIONS.find((c) => c.id === condition)?.label}</p>
                <p><span className="font-medium">قیمت فروش:</span> {Number(price).toLocaleString("fa-IR")} تومان</p>
                <p><span className="font-medium">مکان:</span> {city}، {province}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t border-surface-100 px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1) as Step)}
          disabled={currentStep === 1}
        >
          مرحله قبل
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep((s) => Math.min(4, s + 1) as Step)}
            disabled={!canProceed()}
          >
            مرحله بعد
          </Button>
        ) : (
          <Button
            variant="accent"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!canProceed()}
          >
            انتشار آگهی
          </Button>
        )}
      </div>
    </div>
  );
}
