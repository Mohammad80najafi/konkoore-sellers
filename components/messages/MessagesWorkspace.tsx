"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { connectSocket } from "@/lib/socket-client";
import type {
  ChatMessage,
  ConversationSummary,
  SocketResult,
} from "@/lib/message-types";
import NewConversationDialog from "./NewConversationDialog";

interface MessagesWorkspaceProps {
  currentUserId: string;
  sessionToken: string;
  initialConversations: ConversationSummary[];
  initialUnreadCounts: Record<string, number>;
  activeConversationId?: string;
  initialMessages?: ChatMessage[];
}

const timeFormatter = new Intl.DateTimeFormat("fa-IR", {
  hour: "2-digit",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("fa-IR", {
  month: "long",
  day: "numeric",
});

function Avatar({ name, src, small = false }: { name: string; src?: string; small?: boolean }) {
  const size = small ? "h-10 w-10 rounded-xl" : "h-12 w-12 rounded-2xl";
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={small ? 40 : 48}
        height={small ? 40 : 48}
        className={cn(size, "shrink-0 object-cover")}
      />
    );
  }
  return (
    <span className={cn(size, "grid shrink-0 place-items-center bg-navy-100 font-bold text-navy-700")}>
      {name.slice(0, 1) || "ک"}
    </span>
  );
}

function messagePreview(message?: ChatMessage) {
  if (!message) return "مکالمه هنوز شروع نشده";
  if (message.content) return message.content;
  return "تصویر فرستاده شد";
}

export default function MessagesWorkspace({
  currentUserId,
  sessionToken,
  initialConversations,
  initialUnreadCounts,
  activeConversationId,
  initialMessages = [],
}: MessagesWorkspaceProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [unreadCounts, setUnreadCounts] = useState(initialUnreadCounts);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [image, setImage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connection, setConnection] = useState<"connecting" | "online" | "offline">("connecting");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeConversation = conversations.find(
    (conversation) => conversation._id === activeConversationId,
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("fa");
  const visibleConversations = normalizedSearch
    ? conversations.filter((conversation) =>
        [
          conversation.otherUser?.name,
          conversation.listing?.title,
          messagePreview(conversation.lastMessage),
        ].some((value) => value?.toLocaleLowerCase("fa").includes(normalizedSearch)),
      )
    : conversations;

  useEffect(() => {
    const socket = connectSocket(sessionToken);

    const joinActiveConversation = () => {
      setConnection("online");
      if (activeConversationId) socket.emit("join-conversation", activeConversationId);
    };
    const handleDisconnect = () => setConnection("offline");
    const handleNewMessage = (message: ChatMessage) => {
      setConversations((current) => {
        const index = current.findIndex(
          (conversation) => conversation._id === message.conversationId,
        );
        if (index < 0) return current;
        const updated = {
          ...current[index],
          lastMessage: message,
          updatedAt: message.createdAt,
        };
        return [updated, ...current.slice(0, index), ...current.slice(index + 1)];
      });

      if (message.conversationId === activeConversationId) {
        setMessages((current) =>
          current.some((item) => item._id === message._id)
            ? current
            : [...current, message],
        );
        if (message.sender._id !== currentUserId) {
          setUnreadCounts((current) => ({ ...current, [message.conversationId]: 0 }));
          socket.emit("mark-read", { conversationId: message.conversationId });
        }
      }
    };
    const handleConversationUnread = (data: { conversationId: string; count: number }) => {
      setUnreadCounts((current) => ({ ...current, [data.conversationId]: data.count }));
    };

    if (socket.connected) queueMicrotask(joinActiveConversation);
    socket.on("connect", joinActiveConversation);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleDisconnect);
    socket.on("new-message", handleNewMessage);
    socket.on("conversation-unread", handleConversationUnread);

    return () => {
      if (activeConversationId) socket.emit("leave-conversation", activeConversationId);
      socket.off("connect", joinActiveConversation);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleDisconnect);
      socket.off("new-message", handleNewMessage);
      socket.off("conversation-unread", handleConversationUnread);
    };
  }, [activeConversationId, currentUserId, sessionToken]);

  useEffect(() => {
    if (!activeConversationId || connection !== "offline") return;
    const poll = async () => {
      try {
        const response = await fetch(`/api/messages/${activeConversationId}`);
        if (!response.ok) return;
        const body = (await response.json()) as { messages?: ChatMessage[] };
        if (body.messages) setMessages(body.messages);
      } catch {
        // The next reconnect or polling interval will retry.
      }
    };
    void poll();
    const interval = window.setInterval(poll, 10000);
    return () => window.clearInterval(interval);
  }, [activeConversationId, connection]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("تصویر باید JPG، PNG یا WebP و کوچک‌تر از ۵ مگابایت باشد.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const body = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error);
      setImage(body.url);
    } catch {
      setError("تصویر بارگذاری نشد. دوباره تلاش کنید.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const sendMessage = () => {
    const content = draft.trim();
    if (!activeConversationId || (!content && !image) || sending) return;
    if (connection !== "online") {
      setError("ارتباط با پیام‌رسان قطع است؛ چند لحظه دیگر تلاش کنید.");
      return;
    }

    setSending(true);
    setError("");
    const socket = connectSocket(sessionToken);
    socket.timeout(8000).emit(
      "send-message",
      { conversationId: activeConversationId, content, image },
      (timeoutError: Error | null, result?: SocketResult) => {
        setSending(false);
        if (timeoutError || !result?.ok) {
          setError(result?.error || "پیام ارسال نشد. دوباره تلاش کنید.");
          return;
        }
        setDraft("");
        setImage("");
        if (result.message) {
          setMessages((current) =>
            current.some((item) => item._id === result.message?._id)
              ? current
              : [...current, result.message!],
          );
        }
      },
    );
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="mx-auto h-[calc(100dvh-8rem)] max-w-7xl md:h-[calc(100dvh-4rem)] md:p-4">
        <div className="grid h-full overflow-hidden bg-white md:grid-cols-[360px_minmax(0,1fr)] md:rounded-3xl md:border md:border-surface-200 md:shadow-card">
          <aside className={cn("flex min-h-0 flex-col border-l border-surface-100", activeConversationId && "hidden md:flex")}>
            <div className="shrink-0 px-4 pb-3 pt-5 md:px-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-accent-600">صندوق پیام</p>
                  <h1 className="text-xl font-black text-navy-950">گفت‌وگوها</h1>
                </div>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-700 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-navy-800"
                  aria-label="گفت‌وگوی جدید"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <label className="relative mt-4 block">
                <span className="sr-only">جست‌وجوی گفت‌وگو</span>
                <svg className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                  <path d="m20 20-4-4" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="نام، کتاب یا متن پیام"
                  className="h-11 w-full rounded-2xl border border-surface-200 bg-surface-50 pr-10 pl-4 text-sm outline-none transition focus:border-navy-300 focus:bg-white focus:ring-3 focus:ring-navy-100"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 md:px-3">
              {visibleConversations.length === 0 ? (
                <div className="mx-2 mt-12 text-center">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-navy-50 text-navy-500">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 12a8 8 0 0 1-8 8H6l-3 2 1-4a8 8 0 1 1 17-6Z" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h2 className="mt-4 font-bold text-navy-900">{search ? "نتیجه‌ای پیدا نشد" : "هنوز گفت‌وگویی ندارید"}</h2>
                  <p className="mt-1 text-xs leading-6 text-surface-500">{search ? "عبارت دیگری را امتحان کنید." : "از صفحه یک کتاب به فروشنده پیام بدهید."}</p>
                </div>
              ) : (
                visibleConversations.map((conversation) => {
                  const unread = unreadCounts[conversation._id] || 0;
                  const isActive = conversation._id === activeConversationId;
                  return (
                    <Link
                      key={conversation._id}
                      href={`/messages/${conversation._id}`}
                      className={cn(
                        "group mb-1 flex gap-3 rounded-2xl px-3 py-3 transition-colors",
                        isActive ? "bg-navy-700 text-white" : "hover:bg-surface-50",
                      )}
                    >
                      <div className="relative">
                        <Avatar name={conversation.otherUser?.name || "کاربر"} src={conversation.otherUser?.avatar} />
                        {unread > 0 && (
                          <span className={cn("absolute -left-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-white ring-2", isActive ? "bg-accent-500 ring-navy-700" : "bg-danger-500 ring-white")}>
                            {unread > 99 ? "۹۹+" : unread.toLocaleString("fa-IR")}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("truncate text-sm", unread ? "font-extrabold" : "font-semibold", !isActive && "text-navy-900")}>
                            {conversation.otherUser?.name || "کاربر کنکورباز"}
                          </p>
                          <time className={cn("shrink-0 text-[10px]", isActive ? "text-navy-200" : "text-surface-400")}>
                            {timeFormatter.format(new Date(conversation.updatedAt))}
                          </time>
                        </div>
                        {conversation.listing && (
                          <p className={cn("mt-0.5 truncate text-[11px]", isActive ? "text-accent-200" : "text-accent-700")}>
                            درباره «{conversation.listing.title}»
                          </p>
                        )}
                        <p className={cn("mt-1 truncate text-xs", isActive ? "text-navy-100" : unread ? "font-medium text-surface-700" : "text-surface-500")}>
                          {conversation.lastMessage?.sender._id === currentUserId ? "شما: " : ""}{messagePreview(conversation.lastMessage)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>

          <main className={cn("min-h-0 bg-surface-50/60", !activeConversationId && "hidden md:block")}>
            {activeConversation ? (
              <div className="flex h-full min-h-0 flex-col">
                <header className="shrink-0 border-b border-surface-100 bg-white px-3 py-3 md:px-5">
                  <div className="flex items-center gap-3">
                    <Link href="/messages" className="grid h-10 w-10 place-items-center rounded-xl text-surface-500 hover:bg-surface-100 md:hidden" aria-label="بازگشت به پیام‌ها">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m9 5 7 7-7 7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </Link>
                    <Avatar name={activeConversation.otherUser?.name || "کاربر"} src={activeConversation.otherUser?.avatar} small />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-extrabold text-navy-950">{activeConversation.otherUser?.name || "کاربر کنکورباز"}</h2>
                      <p className={cn("mt-0.5 flex items-center gap-1.5 text-[11px]", connection === "online" ? "text-success-600" : "text-surface-400")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", connection === "online" ? "bg-success-500" : connection === "connecting" ? "animate-pulse bg-accent-500" : "bg-surface-300")} />
                        {connection === "online" ? "پیام‌رسان آماده است" : connection === "connecting" ? "در حال اتصال..." : "در حال اتصال دوباره..."}
                      </p>
                    </div>
                  </div>
                  {activeConversation.listing && (
                    <Link href={`/listing/${activeConversation.listing._id}`} className="mt-3 flex items-center gap-3 rounded-2xl border border-accent-100 bg-accent-50/70 p-2.5 transition hover:border-accent-200 hover:bg-accent-50">
                      {activeConversation.listing.coverUrl ? (
                        <Image src={activeConversation.listing.coverUrl} alt="" width={38} height={48} className="h-12 w-9 rounded-lg object-cover" />
                      ) : (
                        <span className="grid h-12 w-9 place-items-center rounded-lg bg-white text-lg shadow-sm">📘</span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-semibold text-accent-700">کتاب این گفت‌وگو</span>
                        <span className="block truncate text-xs font-bold text-navy-900">{activeConversation.listing.title}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-navy-600">دیدن آگهی</span>
                    </Link>
                  )}
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 md:px-6">
                  {messages.length === 0 && (
                    <div className="mx-auto mt-12 max-w-sm text-center">
                      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white text-2xl shadow-card">👋</span>
                      <h3 className="mt-4 font-bold text-navy-900">شروع گفت‌وگو</h3>
                      <p className="mt-1 text-xs leading-6 text-surface-500">درباره وضعیت کتاب، روش ارسال یا زمان تحویل سؤال کنید.</p>
                    </div>
                  )}
                  {messages.map((message, index) => {
                    const mine = message.sender._id === currentUserId;
                    const previous = messages[index - 1];
                    const showDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
                    return (
                      <div key={message._id}>
                        {showDay && (
                          <div className="my-5 flex items-center gap-3 text-[10px] text-surface-400 before:h-px before:flex-1 before:bg-surface-200 after:h-px after:flex-1 after:bg-surface-200">
                            {dayFormatter.format(new Date(message.createdAt))}
                          </div>
                        )}
                        <div className={cn("mb-2 flex", mine ? "justify-start" : "justify-end")}>
                          <article className={cn("max-w-[82%] overflow-hidden rounded-2xl shadow-sm md:max-w-[68%]", mine ? "rounded-tr-md bg-navy-700 text-white" : "rounded-tl-md border border-surface-100 bg-white text-surface-800")}>
                            {message.image && <Image src={message.image} alt="تصویر پیام" width={480} height={320} className="max-h-80 w-full object-cover" />}
                            {message.content && <p className="whitespace-pre-wrap break-words px-3.5 pt-2.5 text-sm leading-7">{message.content}</p>}
                            <time className={cn("block px-3.5 pb-2 pt-0.5 text-[9px]", mine ? "text-navy-200" : "text-surface-400")}>
                              {timeFormatter.format(new Date(message.createdAt))}
                            </time>
                          </article>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                <footer className="shrink-0 border-t border-surface-100 bg-white p-3 md:p-4">
                  {image && (
                    <div className="mb-2 flex items-start gap-2 rounded-2xl bg-surface-50 p-2">
                      <Image src={image} alt="پیش‌نمایش تصویر" width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
                      <span className="flex-1 pt-1 text-xs text-surface-500">تصویر آماده ارسال است</span>
                      <button type="button" onClick={() => setImage("")} className="grid h-8 w-8 place-items-center rounded-full text-surface-500 hover:bg-white" aria-label="حذف تصویر">×</button>
                    </div>
                  )}
                  {error && <p className="mb-2 text-xs font-medium text-danger-600" role="alert">{error}</p>}
                  <div className="flex items-end gap-2">
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="hidden" />
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-100 text-surface-600 transition hover:bg-surface-200 disabled:opacity-50" aria-label="افزودن تصویر">
                      {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-300 border-t-navy-600" /> : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 16.5 8.5 12a2 2 0 0 1 3 0l1.5 1.5 1.5-1.5a2 2 0 0 1 3 0l2.5 2.5M7 20h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3Z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="9" r="1.5" /></svg>}
                    </button>
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">متن پیام</span>
                      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleComposerKeyDown} maxLength={2000} rows={1} placeholder="پیامتان را بنویسید..." className="max-h-32 min-h-11 w-full resize-none rounded-2xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm leading-6 outline-none transition focus:border-navy-300 focus:bg-white focus:ring-3 focus:ring-navy-100" />
                    </label>
                    <button type="button" onClick={sendMessage} disabled={sending || (!draft.trim() && !image)} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-500 text-white shadow-sm transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-surface-200 disabled:text-surface-400" aria-label="ارسال پیام">
                      {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m4 12 16-8-5 16-3-7-8-1Z" strokeWidth="1.8" strokeLinejoin="round" /><path d="m12 13 8-9" strokeWidth="1.8" strokeLinecap="round" /></svg>}
                    </button>
                  </div>
                </footer>
              </div>
            ) : (
              <div className="grid h-full place-items-center p-10">
                <div className="max-w-md text-center">
                  <div className="relative mx-auto h-24 w-28">
                    <span className="absolute right-0 top-1 grid h-20 w-20 rotate-3 place-items-center rounded-[1.7rem] bg-navy-700 text-white shadow-lg">💬</span>
                    <span className="absolute bottom-0 left-0 grid h-14 w-14 -rotate-6 place-items-center rounded-2xl bg-accent-400 text-2xl shadow-md">📚</span>
                  </div>
                  <h2 className="mt-6 text-xl font-black text-navy-950">خرید خوب با یک سؤال شروع می‌شود</h2>
                  <p className="mt-2 text-sm leading-7 text-surface-500">یک گفت‌وگو را انتخاب کنید و درباره کتاب، ارسال و تحویل با فروشنده هماهنگ شوید.</p>
                  <button type="button" onClick={() => setDialogOpen(true)} className="mt-5 rounded-2xl bg-navy-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800">گفت‌وگوی جدید</button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <NewConversationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
