import type { Server, Socket } from "socket.io";
import { connectDB } from "./mongodb";
import Session from "./models/Session";
import User from "./models/User";
import Message from "./models/Message";
import Conversation from "./models/Conversation";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocketServer(io: Server) {
  io.on("connection", async (socket: AuthenticatedSocket) => {
    const sessionToken = socket.handshake.auth?.token;

    if (!sessionToken) {
      socket.disconnect();
      return;
    }

    try {
      await connectDB();
      const session = await Session.findOne({ token: sessionToken });
      if (!session || session.expiresAt < new Date()) {
        socket.disconnect();
        return;
      }

      const user = await User.findById(session.userId);
      if (!user) {
        socket.disconnect();
        return;
      }

      socket.userId = user._id.toString();
      socket.join(`user:${socket.userId}`);
    } catch (err) {
      console.error("[Socket] Auth error:", err);
      socket.disconnect();
      return;
    }

    socket.on("join-conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "send-message",
      async (data: { conversationId: string; content: string }) => {
        if (!socket.userId || !data.content?.trim()) return;

        try {
          await connectDB();

          const conversation = await Conversation.findById(data.conversationId);
          if (!conversation) return;
          if (
            !conversation.participants.some(
              (p) => p.toString() === socket.userId,
            )
          )
            return;

          const message = await Message.create({
            conversation: data.conversationId,
            sender: socket.userId,
            content: data.content.trim(),
          });

          await Conversation.findByIdAndUpdate(data.conversationId, {
            lastMessage: message._id,
            lastMessageAt: new Date(),
          });

          const populated = await Message.findById(message._id).populate(
            "sender",
            "name avatar",
          );

          const msgObj = {
            _id: populated!._id.toString(),
            conversationId: data.conversationId,
            sender: {
              _id: populated!.sender._id.toString(),
              name: (populated!.sender as any).name,
              avatar: (populated!.sender as any).avatar || "",
            },
            content: populated!.content,
            isRead: false,
            createdAt: populated!.createdAt.toISOString(),
          };

          for (const participantId of conversation.participants) {
            io.to(`user:${participantId.toString()}`).emit(
              "new-message",
              msgObj,
            );
          }
        } catch (err) {
          console.error("[Socket] Send message error:", err);
        }
      },
    );

    socket.on("typing", (data: { conversationId: string }) => {
      if (!socket.userId) return;
      socket.to(`conversation:${data.conversationId}`).emit("user-typing", {
        conversationId: data.conversationId,
        userId: socket.userId,
      });
    });

    socket.on("mark-read", async (data: { conversationId: string }) => {
      if (!socket.userId) return;

      try {
        await connectDB();
        await Message.updateMany(
          {
            conversation: data.conversationId,
            sender: { $ne: socket.userId },
            isRead: false,
          },
          { isRead: true },
        );
      } catch (err) {
        console.error("[Socket] Mark read error:", err);
      }
    });

    socket.on("disconnect", () => {
      // cleanup if needed
    });
  });
}
