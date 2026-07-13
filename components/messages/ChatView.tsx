"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { connectSocket, getSocket } from "@/lib/socket-client";

interface Message {
  _id: string;
  conversationId: string;
  sender: { _id: string; name: string; avatar: string };
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get session token from cookie
    const cookies = document.cookie.split(";");
    const sessionCookie = cookies.find((c) => c.trim().startsWith("session-token="));
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

  const sendMessage = () => {
    if (!input.trim() || !connected) return;
    const socket = getSocket();
    socket.emit("send-message", { conversationId, content: input.trim() });
    setInput("");
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
                className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                  isMine
                    ? "bg-navy-600 text-white rounded-br-md"
                    : "bg-surface-100 text-surface-800 rounded-bl-md"
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
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
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-100 shrink-0">
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
          disabled={!input.trim() || !connected}
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
