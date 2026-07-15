"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { logoutAction } from "@/lib/auth-actions";
import { connectSocket } from "@/lib/socket-client";

const navLinks = [
  { href: "/marketplace", label: "بازار کتاب" },
  { href: "/messages", label: "پیام‌ها" },
  { href: "/about", label: "درباره ما" },
];

interface HeaderProps {
  currentUser?: User | null;
  unreadCount?: number;
  sessionToken?: string | null;
}

export default function Header({
  currentUser,
  unreadCount = 0,
  sessionToken,
}: HeaderProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(unreadCount);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMessages = pathname.startsWith("/messages");

  useEffect(() => {
    if (!currentUser || !sessionToken) return;

    const socket = connectSocket(sessionToken);
    const handleUnreadCount = (nextCount: number) => setMessageCount(nextCount);

    socket.on("unread-count", handleUnreadCount);
    return () => {
      socket.off("unread-count", handleUnreadCount);
    };
  }, [currentUser, sessionToken]);

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res.success) {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/[0.06] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-[72px] items-center gap-3 lg:gap-5">
          {isMessages && (
            <Link
              href="/"
              className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-surface-500 transition-colors hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
              aria-label="بازگشت به خانه">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}

          <Link
            href="/"
            className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2"
            aria-label="صفحه اصلی کنکورباز">
            <Logo size="md" />
          </Link>

          <nav
            className="hidden items-center rounded-full border border-surface-100 bg-surface-50/80 p-1 lg:flex"
            aria-label="ناوبری اصلی">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/marketplace"
                  ? pathname === "/marketplace" || pathname.startsWith("/listing/")
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500",
                    isActive
                      ? "bg-white text-navy-800 shadow-sm ring-1 ring-navy-900/[0.06]"
                      : "text-surface-500 hover:bg-white/70 hover:text-navy-700",
                  )}>
                  {link.label}
                  {link.href === "/messages" && messageCount > 0 && (
                    <span
                      className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-black leading-none text-white shadow-sm"
                      aria-label={`${messageCount.toLocaleString("fa-IR")} پیام خوانده‌نشده`}
                    >
                      {messageCount > 99 ? "۹۹+" : messageCount.toLocaleString("fa-IR")}
                    </span>
                  )}
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
                </Link>
              );
            })}
          </nav>

          <form action="/marketplace" role="search" className="hidden min-w-0 flex-1 md:block">
            <div className="relative mx-auto w-full max-w-lg">
              <input
                type="search"
                name="q"
                defaultValue={searchParams.get("q") ?? ""}
                placeholder="نام کتاب، ناشر یا درس را جستجو کنید"
                className="h-11 w-full rounded-full border border-surface-200 bg-surface-50/70 px-11 text-sm text-surface-800 outline-none transition-all placeholder:text-surface-400 hover:border-surface-300 hover:bg-white focus:border-navy-400 focus:bg-white focus:ring-4 focus:ring-navy-500/10"
                aria-label="جستجوی کتاب"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-surface-400 transition-colors hover:bg-navy-50 hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                aria-label="اجرای جستجو">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="mr-auto flex shrink-0 items-center gap-2">
            <Link
              href="/create-listing"
              className="hidden h-11 items-center gap-2 rounded-[14px] bg-accent-500 px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(245,147,0,0.22)] transition-all hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-[0_10px_24px_rgba(245,147,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 sm:flex">
                <svg
                  className="h-4 w-4"
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
                فروش کتاب
            </Link>

            {currentUser ? (
              <div className="relative flex items-center rounded-full border border-surface-200 bg-surface-50/70 p-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full pr-1 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                  aria-label="پروفایل من">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-xs font-black text-white shadow-sm ring-2 ring-white">
                    {currentUser.name
                      ? currentUser.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                      : "U"}
                  </span>
                  <span className="hidden max-w-24 truncate pl-2 text-xs font-bold text-navy-800 xl:inline">
                    {currentUser.name}
                  </span>
                </Link>

                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-surface-400 transition-colors hover:bg-white hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
                    aria-label="منوی کاربری"
                    aria-expanded={userDropdownOpen}>
                    <svg
                      className={cn(
                        "h-4 w-4 transition-transform",
                        userDropdownOpen && "rotate-180",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute left-0 top-full z-20 mt-3 w-52 animate-scale-in rounded-2xl border border-surface-200/70 bg-white p-2 shadow-[0_18px_50px_rgba(10,17,56,0.16)]">
                        <div className="border-b border-surface-100 px-3 py-2.5">
                          <span className="block text-[10px] font-medium text-surface-400">حساب کاربری</span>
                          <span className="mt-0.5 block truncate text-sm font-bold text-navy-800">{currentUser.name}</span>
                        </div>
                        <Link
                          href="/dashboard"
                          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-navy-50 hover:text-navy-700"
                          onClick={() => setUserDropdownOpen(false)}>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          پروفایل من
                        </Link>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-right text-sm font-semibold text-danger-600 transition-colors hover:bg-danger-50">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          خروج از حساب
                        </button>
                      </div>
                    </>
                  )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex h-10 items-center rounded-full border border-navy-200 px-4 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2">
                ورود
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
