"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { logoutAction } from "@/lib/auth-actions";
import { connectSocket, getSocket } from "@/lib/socket-client";

const navLinks = [
  { href: "/marketplace", label: "بازار کتاب" },
  { href: "/marketplace?type=bundle", label: "پکیج‌ها" },
  { href: "/about", label: "درباره ما" },
];

interface HeaderProps {
  currentUser?: User | null;
  sessionToken?: string | null;
}

export default function Header({ currentUser, sessionToken }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [connected, setConnected] = useState(false);
  const pathname = usePathname();
  const isMessages = pathname.startsWith("/messages");

  useEffect(() => {
    if (!isMessages || !sessionToken) return;

    const socket = connectSocket(sessionToken);
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onDisconnect);
    };
  }, [isMessages, sessionToken]);

  const handleLogout = async () => {
    const res = await logoutAction();
    if (res.success) {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-200/50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          {isMessages && (
            <Link
              href="/"
              className="shrink-0 p-2 -mr-2 text-surface-600 hover:text-navy-700 hover:bg-surface-100 rounded-lg transition-colors"
              aria-label="بازگشت به خانه">
              <svg
                className="w-5 h-5 "
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
          <Link href="/" className="shrink-0" aria-label="صفحه اصلی کنکورباز">
            <Logo size="md" />
          </Link>

          {/* Connecting indicator on messages page */}
          {isMessages && !connected && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium animate-pulse">
              درحال اتصال...
            </span>
          )}

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
                aria-hidden="true">
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
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="ناوبری اصلی">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-navy-700 hover:bg-surface-50 rounded-lg transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sell button */}
            <Link href="/create-listing" className="hidden sm:block">
              <Button variant="accent" size="sm">
                <svg
                  className="w-4 h-4"
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
              </Button>
            </Link>

            {/* User/Login */}
            {currentUser ? (
              <div className="relative flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 p-1.5 px-3 rounded-xl hover:bg-surface-100 transition-colors"
                  aria-label="پروفایل من">
                  <div className="w-8 h-8 rounded-full bg-navy-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {currentUser.name
                      ? currentUser.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                      : "U"}
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-surface-800">
                    {currentUser.name}
                  </span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="منوی کاربری">
                    <svg
                      className={cn(
                        "w-4 h-4 transition-transform",
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
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl border border-surface-200/60 shadow-elevated p-1.5 z-20 animate-scale-in">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-navy-700 rounded-lg transition-colors font-medium"
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
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors text-right font-semibold cursor-pointer">
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
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  ورود
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
