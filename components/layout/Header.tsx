"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/marketplace", label: "بازار کتاب" },
  { href: "/marketplace?type=bundle", label: "پکیج‌ها" },
  { href: "/about", label: "درباره ما" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-200/50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="صفحه اصلی کنکورباز">
            <Logo size="md" />
          </Link>

          {/* Search bar — hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام کتاب، ناشر، درس یا رشته را جستجو کنید"
                className="w-full rounded-xl border border-surface-200 bg-white/80 px-4 py-2.5 pr-10 text-sm text-surface-800 placeholder:text-surface-400 transition-all focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none"
                aria-label="جستجوی کتاب"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="ناوبری اصلی">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-navy-700 hover:bg-surface-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sell button */}
            <Link href="/create-listing" className="hidden sm:block">
              <Button variant="accent" size="sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                فروش کتاب
              </Button>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-surface-600 hover:text-navy-700 hover:bg-surface-100 rounded-lg transition-colors"
              aria-label="سبد خرید"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                ۰
              </span>
            </Link>

            {/* User/Login */}
            <Link href="/login">
              <Button variant="outline" size="sm">
                ورود
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-surface-600 hover:text-navy-700 hover:bg-surface-100 rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی کتاب..."
              className="w-full rounded-xl border border-surface-200 bg-white/80 px-4 py-2 pr-10 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 focus:outline-none"
              aria-label="جستجوی کتاب"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-200 animate-slide-down">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1" aria-label="منو موبایل">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-surface-600 hover:text-navy-700 hover:bg-surface-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/create-listing"
              className="block sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant="accent" size="sm" fullWidth>
                فروش کتاب
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
