import mongoose from "mongoose";
import type { Server, Socket } from "socket.io";
import { connectDB } from "./mongodb";
import Session from "./models/Session";
import User from "./models/User";
import Message from "./models/Message";
import Conversation from "./models/Conversation";
import {
  getConversationUnreadCount,
  getUnreadCount,
} from "./messages-data";
import type {
  ChatMessage,
  SendMessagePayload,
  SocketResult,
} from "./message-types";

const MAX_MESSAGE_LENGTH = 2000;
const UPLOAD_PATH = /^\/uploads\/[a-zA-Z0-9._-]+$/;

type Reply = (result: SocketResult) => void;

async function canAccessConversation(conversationId: string, userId: string) {
  if (!mongoose.isValidObjectId(conversationId)) return false;
  return Boolean(
    await Conversation.exists({ _id: conversationId, participants: userId }),
  );
}

async function emitUnreadState(
  io: Server,
  userId: string,
  conversationId?: string,
) {
  const [total, conversationCount] = await Promise.all([
    getUnreadCount(userId),
    conversationId
      ? getConversationUnreadCount(conversationId, userId)
      : Promise.resolve(0),
  ]);
  io.to(`user:${userId}`).emit("unread-count", total);
  if (conversationId) {
    io.to(`user:${userId}`).emit("conversation-unread", {
      conversationId,
      count: conversationCount,
    });
  }
}

async function markConversationRead(
  io: Server,
  conversationId: string,
  userId: string,
) {
  if (!(await canAccessConversation(conversationId, userId))) return;
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      isRead: false,
    },
    { isRead: true },
  );
  await emitUnreadState(io, userId, conversationId);
}

export function setupSocketServer(io: Server) {
  const onlineSockets = new Map<string, Set<string>>();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== "string" || !token) {
        next(new Error("unauthorized"));
        return;
      }

      await connectDB();
      const session = await Session.findOne({
        token,
        expiresAt: { $gt: new Date() },
      }).select("userId");
      if (!session) {
        next(new Error("unauthorized"));
        return;
      }

      const user = await User.findById(session.userId).select("name avatar");
      if (!user) {
        next(new Error("unauthorized"));
        return;
      }

      socket.data.userId = session.userId.toString();
      socket.data.userName = user.name;
      socket.data.userAvatar = user.avatar || "";
      next();
    } catch (error) {
      console.error("[Socket] Authentication failed:", error);
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    const userSockets = onlineSockets.get(userId) || new Set<string>();
    const wasOffline = userSockets.size === 0;
    userSockets.add(socket.id);
    onlineSockets.set(userId, userSockets);
    if (wasOffline) {
      io.to(`presence:${userId}`).emit("presence", { userId, online: true });
    }

    socket.on(
      "presence:subscribe",
      async (data: { conversationId?: string; userId?: string }) => {
        const conversationId = data?.conversationId;
        const targetUserId = data?.userId;
        if (
          !conversationId ||
          !targetUserId ||
          !mongoose.isValidObjectId(targetUserId) ||
          !(await Conversation.exists({
            _id: conversationId,
            participants: { $all: [userId, targetUserId] },
          }))
        )
          return;

        socket.join(`presence:${targetUserId}`);
        socket.emit("presence", {
          userId: targetUserId,
          online: Boolean(onlineSockets.get(targetUserId)?.size),
        });
      },
    );

    socket.on("presence:unsubscribe", (targetUserId: string) => {
      socket.leave(`presence:${targetUserId}`);
    });

    socket.on("join-conversation", async (conversationId: string) => {
      if (!(await canAccessConversation(conversationId, userId))) return;
      socket.join(`conversation:${conversationId}`);
      await markConversationRead(io, conversationId, userId);
    });

    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "typing",
      (data: { conversationId?: string; isTyping?: boolean }) => {
        const conversationId = data?.conversationId;
        if (
          !conversationId ||
          !socket.rooms.has(`conversation:${conversationId}`)
        )
          return;
        socket.to(`conversation:${conversationId}`).emit("typing", {
          conversationId,
          userId,
          isTyping: Boolean(data.isTyping),
        });
      },
    );

    socket.on(
      "send-message",
      async (payload: SendMessagePayload, reply?: Reply) => {
        const respond = reply || (() => undefined);
        try {
          const conversationId = payload?.conversationId;
          const content = payload?.content?.trim() || "";
          const image = payload?.image || "";

          if (
            !conversationId ||
            (!content && !image) ||
            content.length > MAX_MESSAGE_LENGTH ||
            (image && !UPLOAD_PATH.test(image)) ||
            !(await canAccessConversation(conversationId, userId))
          ) {
            respond({ ok: false, error: "پیام معتبر نیست." });
            return;
          }

          const conversation = await Conversation.findById(conversationId).select(
            "participants",
          );
          if (!conversation) {
            respond({ ok: false, error: "مکالمه پیدا نشد." });
            return;
          }

          const created = await Message.create({
            conversation: conversationId,
            sender: userId,
            content,
            image,
          });
          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: created._id,
            lastMessageAt: created.createdAt,
          });

          const message: ChatMessage = {
            _id: created._id.toString(),
            conversationId,
            sender: {
              _id: userId,
              name: socket.data.userName as string,
              avatar: socket.data.userAvatar as string,
            },
            content,
            image,
            isRead: false,
            createdAt: created.createdAt.toISOString(),
          };

          for (const participant of conversation.participants) {
            io.to(`user:${participant.toString()}`).emit("new-message", message);
          }
          respond({ ok: true, message });

          await Promise.all(
            conversation.participants
              .map((participant) => participant.toString())
              .filter((participantId) => participantId !== userId)
              .map((participantId) =>
                emitUnreadState(io, participantId, conversationId),
              ),
          );
        } catch (error) {
          console.error("[Socket] Send message failed:", error);
          respond({ ok: false, error: "پیام ارسال نشد. دوباره تلاش کنید." });
        }
      },
    );

    socket.on("mark-read", async (data: { conversationId?: string }) => {
      if (!data?.conversationId) return;
      await markConversationRead(io, data.conversationId, userId);
    });

    void emitUnreadState(io, userId).catch((error) => {
      console.error("[Socket] Unread sync failed:", error);
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (!room.startsWith("conversation:")) continue;
        socket.to(room).emit("typing", {
          conversationId: room.slice("conversation:".length),
          userId,
          isTyping: false,
        });
      }
    });

    socket.on("disconnect", () => {
      const remainingSockets = onlineSockets.get(userId);
      remainingSockets?.delete(socket.id);
      if (remainingSockets?.size) return;
      onlineSockets.delete(userId);
      io.to(`presence:${userId}`).emit("presence", { userId, online: false });
    });
  });
}
