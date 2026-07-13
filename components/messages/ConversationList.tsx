"use client";

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

export default function ConversationList({ conversations, currentUserId }: ConversationListProps) {
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
    <div className="space-y-2">
      {conversations.map((convo) => (
        <Link
          key={convo._id}
          href={`/messages/${convo._id}`}
          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-surface-100 hover:border-navy-200 hover:shadow-sm transition-all"
        >
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-navy-600">
              {convo.otherUser?.name ? convo.otherUser.name[0] : "👤"}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-navy-800 truncate">
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
              <p className="text-xs text-surface-500 truncate mt-0.5">
                {convo.lastMessage.sender.name}: {convo.lastMessage.content}
              </p>
            )}
          </div>

          {/* Chevron */}
          <svg className="w-4 h-4 text-surface-300 shrink-0 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
