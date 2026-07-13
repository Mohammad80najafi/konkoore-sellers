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
  initialMessages: Message[];
  otherUser?: { _id: string; name: string; avatar: string };
  listing?: { _id: string; book: { title: string } };
}

export default function ChatView({
  conversationId,
  currentUserId,
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
    const cookies = document.cookie.split(";");
    const sessionCookie = cookies.find((c) => c.trim().startsWith("socket-token="));
    const token = sessionCookie?.split("=")[1];

    if (!token) return;

    const socket = connectSocket(token);

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-conversation", conversationId);
      socket.emit("mark-read", { conversationId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new-message", (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // Replace temp message with real server message (same sender + content)
          const tempIdx = prev.findIndex(
            (m) =>
              m._id.startsWith("temp-") &&
              m.sender._id === msg.sender._id &&
              m.content === msg.content &&
              m.image === msg.image
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = msg;
            return updated;
          }
          // Skip if already exists
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        socket.emit("mark-read", { conversationId });
      }
    });

    return () => {
      socket.emit("leave-conversation", conversationId);
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new-message");
    };
  }, [conversationId]);

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
      if (data.url) {
        setImagePreview(data.url);
      }
    } catch {
      // ignore
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = () => {
    if ((!input.trim() && !imagePreview) || !connected) return;
    const socket = getSocket();
    const tempId = `temp-${Date.now()}`;
    const content = input.trim();
    const image = imagePreview || "";

    // Optimistic update — show message immediately
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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-surface-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 shrink-0">
        <Link
          href="/messages"
          className="p-1.5 text-surface-500 hover:text-navy-600 hover:bg-surface-50 rounded-lg transition-colors lg:hidden"
        >
          <svg className="w-5 h-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-navy-600">
            {otherUser?.name ? otherUser.name[0] : "👤"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-navy-800 truncate">{otherUser?.name || "کاربر"}</p>
          {listing && (
            <p className="text-[11px] text-surface-400 truncate">📖 {listing.book.title}</p>
          )}
        </div>

        <div className={`w-2 h-2 rounded-full ${connected ? "bg-success-500" : "bg-surface-300"}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-surface-400">پیامی وجود ندارد. اولین پیام را بفرستید!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender._id === currentUserId;
          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl overflow-hidden ${
                  isMine
                    ? "bg-navy-600 text-white rounded-br-md"
                    : "bg-surface-100 text-surface-800 rounded-bl-md"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="عکس پیام"
                    className="w-full max-h-64 object-cover cursor-pointer"
                    onClick={() => window.open(msg.image, "_blank")}
                  />
                )}
                {msg.content && (
                  <div className="px-3.5 py-2">
                    <p className="leading-relaxed text-sm">{msg.content}</p>
                  </div>
                )}
                <div className={`px-3.5 pb-2 ${!msg.content && msg.image ? "pt-1" : ""}`}>
                  <p
                    className={`text-[10px] ${
                      isMine ? "text-navy-200" : "text-surface-400"
                    }`}
                  >
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
        <div className="px-4 pt-2 border-t border-surface-100">
          <div className="relative inline-block">
            <img src={imagePreview} alt="پیش‌نمایش" className="h-20 rounded-lg object-cover" />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-100 shrink-0">
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
          className="w-10 h-10 rounded-xl bg-surface-100 text-surface-500 flex items-center justify-center hover:bg-surface-200 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          title="ارسال عکس"
        >
          {uploading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm text-surface-800 placeholder:text-surface-400 focus:border-navy-500 focus:ring-1 focus:ring-navy-500/20 focus:outline-none"
          disabled={!connected}
        />
        <button
          onClick={sendMessage}
          disabled={(!input.trim() && !imagePreview) || !connected}
          className="w-10 h-10 rounded-xl bg-navy-600 text-white flex items-center justify-center hover:bg-navy-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
