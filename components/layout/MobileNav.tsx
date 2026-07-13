"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { connectSocket, getSocket } from "@/lib/socket-client";
import type { User } from "@/lib/types";

const navItems = [
  {
    href: "/",
    label: "خانه",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/marketplace",
    label: "بازار",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: "/create-listing",
    label: "فروش",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    isSpecial: true,
  },
  {
    href: "/messages",
    label: "پیام‌ها",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "حساب من",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

interface MobileNavProps {
  currentUser?: User | null;
  unreadCount?: number;
}

export default function MobileNav({ currentUser, unreadCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const [count, setCount] = useState(unreadCount);

  useEffect(() => {
    setCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (!currentUser) return;
    const cookies = document.cookie.split(";");
    const sessionCookie = cookies.find((c) => c.trim().startsWith("socket-token="));
    const token = sessionCookie?.split("=")[1];
    if (!token) return;

    const socket = connectSocket(token);

    const handleNewMessage = () => {
      setCount((prev) => prev + 1);
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [currentUser]);

  const items = navItems.map((item) => {
    if (item.href === "/dashboard" && !currentUser) {
      return { ...item, href: "/auth/login" };
    }
    return item;
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-surface-200/50"
      aria-label="ناوبری موبایل"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map((item) => {
          const isActive = pathname === item.href;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-accent-500 text-white shadow-lg hover:bg-accent-600 transition-all active:scale-95"
                aria-label={item.label}
              >
                {item.icon}
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg transition-colors min-w-[56px]",
                isActive
                  ? "text-navy-700"
                  : "text-surface-400 hover:text-surface-600"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              {item.href === "/messages" && count > 0 && (
                <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {count > 99 ? "99+" : count}
                </span>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
