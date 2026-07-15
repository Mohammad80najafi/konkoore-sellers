import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { io, type Socket } from "socket.io-client";
import { connectDB } from "../lib/mongodb";
import Conversation from "../lib/models/Conversation";
import Session from "../lib/models/Session";
import User from "../lib/models/User";

function waitFor<T>(
  socket: Socket,
  event: string,
  accepts: (data: T) => boolean,
) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, handler);
      reject(new Error(`Timed out waiting for ${event}`));
    }, 5000);
    const handler = (data: T) => {
      if (!accepts(data)) return;
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(data);
    };
    socket.on(event, handler);
  });
}

async function main() {
  await connectDB();
  const primaryUser = await User.findOne({ phone: "09120004567" }).select("_id");
  const conversation = await Conversation.findOne(
    primaryUser ? { participants: { $nin: [primaryUser._id] } } : {},
  ).select("participants");
  if (!conversation || conversation.participants.length < 2)
    throw new Error("A two-person conversation is required");

  const conversationId = conversation._id.toString();
  const [userA, userB] = conversation.participants.map(String);
  const tokens = [`presence-a-${randomUUID()}`, `presence-b-${randomUUID()}`];
  await Session.create([
    { token: tokens[0], userId: userA, expiresAt: new Date(Date.now() + 60_000) },
    { token: tokens[1], userId: userB, expiresAt: new Date(Date.now() + 60_000) },
  ]);

  const sockets = tokens.map((token) =>
    io("http://localhost:3000", {
      path: "/api/socketio",
      auth: { token },
      autoConnect: false,
      transports: ["websocket"],
    }),
  );
  const [socketA, socketB] = sockets;

  try {
    const connected = sockets.map((socket) =>
      waitFor<void>(socket, "connect", () => true),
    );
    sockets.forEach((socket) => socket.connect());
    await Promise.all(connected);

    const joined = sockets.map((socket) =>
      waitFor<{ conversationId: string }>(
        socket,
        "conversation-unread",
        (data) => data.conversationId === conversationId,
      ),
    );
    sockets.forEach((socket) => socket.emit("join-conversation", conversationId));
    await Promise.all(joined);

    const online = waitFor<{ userId: string; online: boolean }>(
      socketA,
      "presence",
      (data) => data.userId === userB && data.online,
    );
    socketA.emit("presence:subscribe", { conversationId, userId: userB });
    await online;

    const typing = waitFor<{ userId: string; isTyping: boolean }>(
      socketA,
      "typing",
      (data) => data.userId === userB && data.isTyping,
    );
    socketB.emit("typing", { conversationId, isTyping: true });
    await typing;

    const offline = waitFor<{ userId: string; online: boolean }>(
      socketA,
      "presence",
      (data) => data.userId === userB && !data.online,
    );
    socketB.disconnect();
    await offline;
    console.log("Presence and typing checks passed.");
  } finally {
    sockets.forEach((socket) => socket.disconnect());
    await Session.deleteMany({ token: { $in: tokens } });
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
