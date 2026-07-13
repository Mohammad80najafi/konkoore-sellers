"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ConversationItem {
  _id: string;
  otherUser?: { _id: string; name: string; avatar: string };
  lastMessage?: { content: string; sender: { name: string }; createdAt: string };
  listing?: { _id: string; book: { title: string; images?: { url: string }[] } };
}

interface ConversationListProps {
  conversations: ConversationItem[];
  currentUserId: string;
  unreadCounts?: Record<string, number>;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "الان";
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} روز پیش`;
  return new Date(dateStr).toLocaleDateString("fa-IR");
}

export default function ConversationList({ conversations, currentUserId, unreadCounts = {} }: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      if (c.otherUser?.name?.toLowerCase().includes(q)) return true;
      if (c.lastMessage?.content?.toLowerCase().includes(q)) return true;
      if (c.listing?.book?.title?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [conversations, search]);

  if (conversations.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
        <div className="text-5xl mb-4">💬</div>
        <h3 className="text-base font-bold text-surface-700 mb-2">هنوز پیامی ندارید</h3>
        <p className="text-sm text-surface-400">
          از صفحه کتاب روی «پیام به فروشنده» کلیک کنید تا چت شروع شود.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative mb-4">
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در پیام‌ها..."
          className="w-full rounded-xl border border-surface-200 bg-surface-50 pr-10 pl-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-surface-100">
            <p className="text-sm text-surface-400">پیامی یافت نشد</p>
          </div>
        ) : (
          filtered.map((convo) => {
            const unread = unreadCounts[convo._id] || 0;
            return (
              <Link
                key={convo._id}
                href={`/messages/${convo._id}`}
                className={cn(
                  "flex items-center gap-3 p-3 bg-white rounded-xl border transition-all",
                  unread > 0
                    ? "border-navy-200 bg-navy-50/30 hover:border-navy-300"
                    : "border-surface-100 hover:border-navy-200 hover:shadow-sm"
                )}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-navy-600">
                      {convo.otherUser?.name ? convo.otherUser.name[0] : "👤"}
                    </span>
                  </div>
                  {unread > 0 && (
                    <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm truncate", unread > 0 ? "font-bold text-navy-800" : "font-semibold text-navy-800")}>
                      {convo.otherUser?.name || "کاربر"}
                    </span>
                    {convo.lastMessage && (
                      <span className="text-[10px] text-surface-400 shrink-0">
                        {timeAgo(convo.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  {convo.listing && (
                    <p className="text-[11px] text-accent-600 truncate mt-0.5">
                      📖 {convo.listing.book.title}
                    </p>
                  )}

                  {convo.lastMessage && (
                    <p className={cn("text-xs truncate mt-0.5", unread > 0 ? "text-surface-700 font-medium" : "text-surface-500")}>
                      {convo.lastMessage.sender.name}: {convo.lastMessage.content}
                    </p>
                  )}
                </div>

                <svg className="w-4 h-4 text-surface-300 shrink-0 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
