"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createMessageConversation,
  searchMessageUsers,
} from "@/lib/message-actions";
import type { UserSearchResult } from "@/lib/message-types";

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function NewConversationDialog({
  open,
  onClose,
}: NewConversationDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      setError("حداقل دو حرف از نام کاربر را وارد کنید.");
      return;
    }
    setLoading(true);
    setError("");
    const users = await searchMessageUsers(query);
    setResults(users);
    if (users.length === 0) setError("کاربری با این نام پیدا نشد.");
    setLoading(false);
  };

  const startConversation = async (userId: string) => {
    setCreating(userId);
    setError("");
    const result = await createMessageConversation(userId);
    if (result.success && result.conversationId) {
      router.push(`/messages/${result.conversationId}`);
      onClose();
      return;
    }
    setError(result.error || "مکالمه ایجاد نشد.");
    setCreating(null);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-navy-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="بستن پنجره"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-conversation-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-elevated"
      >
        <div className="border-b border-surface-100 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 id="new-conversation-title" className="font-bold text-navy-900">
                گفت‌وگوی تازه
              </h2>
              <p className="mt-0.5 text-xs text-surface-500">
                هم‌کلاسی یا فروشنده موردنظرتان را پیدا کنید.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full text-surface-500 transition-colors hover:bg-surface-100 hover:text-navy-800"
              aria-label="بستن"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M18 6 6 18" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={search} className="flex gap-2 px-5 pt-5">
          <label className="relative flex-1">
            <span className="sr-only">نام کاربر</span>
            <svg
              className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
              <path d="m20 20-4-4" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="نام کاربر..."
              className="h-11 w-full rounded-xl border border-surface-200 bg-surface-50 pr-10 pl-3 text-sm text-navy-900 outline-none transition focus:border-navy-400 focus:bg-white focus:ring-3 focus:ring-navy-100"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-navy-700 px-4 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "..." : "جست‌وجو"}
          </button>
        </form>

        <div className="min-h-32 max-h-72 overflow-y-auto px-3 py-4">
          {error && <p className="px-2 py-6 text-center text-sm text-surface-500">{error}</p>}
          {!error && results.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-surface-400">
              برای شروع، نام یک کاربر را جست‌وجو کنید.
            </p>
          )}
          {results.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => startConversation(user._id)}
              disabled={creating !== null}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-right transition-colors hover:bg-navy-50 disabled:opacity-50"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-navy-100 font-bold text-navy-700">
                {user.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-navy-900">{user.name}</span>
                <span className="block text-xs text-surface-400" dir="ltr">{user.phone}</span>
              </span>
              <span className="text-xs font-semibold text-navy-600">
                {creating === user._id ? "در حال ساخت..." : "انتخاب"}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
