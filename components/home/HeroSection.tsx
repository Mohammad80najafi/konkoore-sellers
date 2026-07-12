"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative overflow-hidden gradient-hero text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-navy-400/20 rounded-full blur-3xl" />
        {/* Floating book icons */}
        <div className="absolute top-20 right-[15%] text-4xl opacity-10 animate-float">
          📚
        </div>
        <div
          className="absolute top-32 left-[20%] text-3xl opacity-10 animate-float"
          style={{ animationDelay: "1s" }}>
          📖
        </div>
        <div
          className="absolute bottom-20 right-[30%] text-3xl opacity-10 animate-float"
          style={{ animationDelay: "2s" }}>
          🎓
        </div>
        <div
          className="absolute bottom-32 left-[10%] text-4xl opacity-10 animate-float"
          style={{ animationDelay: "0.5s" }}>
          ✏️
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          {/* Main headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 animate-fade-in text-balance">
            کتابهای کنکورت رو <span className="text-accent-400">ارزونتر</span>{" "}
            بخر، <span className="text-accent-400">راحتتر</span> بفروش
          </h1>

          <p className="text-base md:text-lg text-navy-200 mb-8 max-w-2xl mx-auto animate-slide-up leading-relaxed">
            هزاران کتاب کنکور دست دوم با قیمت مناسب. کتاب‌های تجربی، ریاضی،
            انسانی، هنر و زبان رو پیدا کن یا کتاب‌هایی که دیگه نیاز نداری رو
            بفروش.
          </p>

          {/* Search bar */}
          <div
            className="max-w-xl mx-auto mb-8 animate-slide-up"
            style={{ animationDelay: "0.2s" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/marketplace?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام کتاب، ناشر، درس یا رشته را جستجو کنید"
                className="w-full rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-4 pr-12 text-white placeholder:text-navy-200 text-base focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
                aria-label="جستجوی کتاب"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors">
                جستجو
              </button>
            </form>
          </div>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up"
            style={{ animationDelay: "0.4s" }}>
            <Link href="/marketplace">
              <Button
                variant="accent"
                size="lg"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                    />
                  </svg>
                }>
                خرید کتاب
              </Button>
            </Link>
            <Link href="/create-listing">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }>
                فروش کتاب
              </Button>
            </Link>
          </div>

          {/* Quick stats */}
          <div
            className="mt-12 flex items-center justify-center gap-8 md:gap-12 text-sm text-navy-200 animate-fade-in"
            style={{ animationDelay: "0.6s" }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">۱۲,۵۰۰+</div>
              <div>کتاب فعال</div>
            </div>
            <div className="w-px h-8 bg-white/20" aria-hidden="true" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">۲۵,۰۰۰+</div>
              <div>کاربر فعال</div>
            </div>
            <div className="w-px h-8 bg-white/20" aria-hidden="true" />
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">۶۰٪</div>
              <div>میانگین تخفیف</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full">
          <path
            d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z"
            fill="#fafaf9"
          />
        </svg>
      </div>
    </section>
  );
}
