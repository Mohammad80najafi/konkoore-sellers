"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { connectSocket, getSocket } from "@/lib/socket-client";

interface Message {
  _id: string;
  conversationId: string;
  sender: { _id: string; name: string; avatar: string };
  content: string;
  image?: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatViewProps {
  conversationId: string;
  currentUserId: string;
  sessionToken?: string | null;
  initialMessages: Message[];
  otherUser?: { _id: string; name: string; avatar: string };
  listing?: { _id: string; book: { title: string } };
}

export default function ChatView({
  conversationId,
  currentUserId,
  sessionToken,
  initialMessages,
  otherUser,
  listing,
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sessionToken) return;

    const socket = connectSocket(sessionToken);

    // If already connected, set state and join immediately
    if (socket.connected) {
      setConnected(true);
      socket.emit("join-conversation", conversationId);
      socket.emit("mark-read", { conversationId });
    }

    const onConnect = () => {
      setConnected(true);
      socket.emit("join-conversation", conversationId);
      socket.emit("mark-read", { conversationId });
    };
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onDisconnect);

    socket.on("new-message", (msg: Message) => {
      if (msg.conversationId !== conversationId) return;

      setMessages((prev) => {
        if (msg.sender._id === currentUserId) {
          const tempIdx = prev.findIndex(
            (m) =>
              m._id.startsWith("temp-") &&
              m.content === msg.content &&
              m.image === msg.image,
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = msg;
            return updated;
          }
          if (prev.some((m) => m._id === msg._id)) return prev;
          return prev;
        }
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      if (msg.sender._id !== currentUserId) {
        socket.emit("mark-read", { conversationId });
      }
    });

    return () => {
      socket.emit("leave-conversation", conversationId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onDisconnect);
      socket.off("new-message");
    };
  }, [conversationId, sessionToken, currentUserId]);

  // Fallback polling: only poll when disconnected from socket
  useEffect(() => {
    if (connected) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/messages/${conversationId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.messages) return;

        setMessages((prev) => {
          if (prev.length === data.messages.length) {
            const prevIds = prev.map((m) => m._id).join(",");
            const serverIds = data.messages.map((m: Message) => m._id).join(",");
            if (prevIds === serverIds) return prev;
          }

          const kept = prev.filter((m) => {
            if (!m._id.startsWith("temp-")) return true;
            return !data.messages.some(
              (sm: Message) =>
                sm.sender._id === m.sender._id &&
                sm.content === m.content &&
                sm.image === m.image,
            );
          });
          const nonTemp = kept.filter((m) => !m._id.startsWith("temp-"));
          const tempOnly = kept.filter((m) => m._id.startsWith("temp-"));
          const merged = [...nonTemp, ...data.messages];
          const seen = new Set<string>();
          const deduped = merged.filter((m) => {
            if (seen.has(m._id)) return false;
            seen.add(m._id);
            return true;
          });
          return [...deduped, ...tempOnly];
        });
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [conversationId, connected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImagePreview(data.url);
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = () => {
    if (!input.trim() && !imagePreview) return;
    const socket = getSocket();

    if (!connected) {
      if (sessionToken) connectSocket(sessionToken);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const content = input.trim();
    const image = imagePreview || "";

    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        conversationId,
        sender: { _id: currentUserId, name: "", avatar: "" },
        content,
        image,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    socket.emit("send-message", { conversationId, content, image });
    setInput("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    inputRef.current?.focus();
  };

  return (
    <div className="border-surface-100 flex h-full flex-col overflow-hidden rounded-2xl border bg-white">
      {/* Header */}
      <div className="border-surface-100 flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <Link
          href="/messages"
          className="text-surface-500 hover:text-navy-600 hover:bg-surface-50 rounded-lg p-1.5 transition-colors lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <div className="bg-navy-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
          <span className="text-navy-600 text-sm font-bold">
            {otherUser?.name ? otherUser.name[0] : "👤"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-navy-800 truncate text-sm font-bold">
            {otherUser?.name || "کاربر"}
          </p>
          {listing && (
            <p className="text-surface-400 truncate text-[11px]">
              📖 {listing.book.title}
            </p>
          )}
        </div>

        <div className={`h-2 w-2 rounded-full ${connected ? "bg-success-500" : "bg-surface-300"}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-surface-400 text-sm">پیامی وجود ندارد. اولین پیام را بفرستید!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender._id === currentUserId;
          return (
            <div key={msg._id} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[75%] overflow-hidden rounded-2xl ${
                  isMine
                    ? "bg-navy-600 rounded-br-md text-white"
                    : "bg-surface-100 text-surface-800 rounded-bl-md"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="عکس پیام"
                    className="max-h-64 w-full cursor-pointer object-cover"
                    onClick={() => window.open(msg.image, "_blank")}
                  />
                )}
                {msg.content && (
                  <div className="px-3.5 py-2">
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                )}
                <div className={`px-3.5 pb-2 ${!msg.content && msg.image ? "pt-1" : ""}`}>
                  <p className={`text-[10px] ${isMine ? "text-navy-200" : "text-surface-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="border-surface-100 border-t px-4 pt-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="پیش‌نمایش" className="h-20 rounded-lg object-cover" />
            <button
              onClick={removeImage}
              className="bg-danger-500 absolute -top-1.5 -left-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-xs text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-surface-100 flex shrink-0 items-center gap-2 border-t px-4 py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-surface-100 text-surface-500 hover:bg-surface-200 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors disabled:opacity-40"
          title="ارسال عکس"
        >
          {uploading ? (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="پیام بنویسید..."
          className="border-surface-200 bg-surface-50 text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-navy-500/20 flex-1 rounded-xl border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() && !imagePreview}
          className="bg-navy-600 hover:bg-navy-700 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
