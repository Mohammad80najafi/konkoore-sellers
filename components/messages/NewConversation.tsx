"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchUsers, createConversation } from "@/lib/auth-actions";

interface UserResult {
  _id: string;
  name: string;
  phone: string;
  avatar: string;
}

export default function NewConversation({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const users = await searchUsers(q, currentUserId);
    setResults(users);
    setLoading(false);
  };

  const startChat = async (userId: string) => {
    setCreating(userId);
    const res = await createConversation(userId);
    if (res.success && res.conversationId) {
      router.push(`/messages/${res.conversationId}`);
    }
    setCreating(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white text-sm font-semibold rounded-xl hover:bg-navy-700 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        پیام جدید
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-20 mx-auto max-w-md bg-white rounded-2xl border border-surface-200 shadow-2xl z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-navy-800">شروع مکالمه جدید</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-surface-400 hover:text-surface-600 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="نام کاربر را جستجو کنید..."
              autoFocus
              className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none"
            />

            <div className="mt-3 max-h-60 overflow-y-auto">
              {loading && (
                <p className="text-xs text-surface-400 text-center py-4">در حال جستجو...</p>
              )}

              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <p className="text-xs text-surface-400 text-center py-4">کاربری یافت نشد</p>
              )}

              {results.map((user) => (
                <button
                  key={user._id}
                  onClick={() => startChat(user._id)}
                  disabled={creating !== null}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-navy-600">
                      {user.name ? user.name[0] : "👤"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-surface-400">{user.phone}</p>
                  </div>
                  {creating === user._id && (
                    <svg className="w-4 h-4 animate-spin text-navy-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
