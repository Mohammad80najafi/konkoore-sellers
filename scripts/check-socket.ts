import mongoose from "mongoose";
import { io } from "socket.io-client";
import { connectDB } from "../lib/mongodb";
import Session from "../lib/models/Session";

const origin = process.env.SOCKET_ORIGIN ?? "http://localhost:3000";

async function main() {
  await connectDB();
  const session = await Session.findOne({ expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .lean();

  if (!session) throw new Error("No active session is available for the check");

  const socket = io(origin, {
    path: "/api/socketio",
    addTrailingSlash: false,
    transports: ["websocket"],
    auth: { token: session.token },
    reconnection: false,
    timeout: 8000,
  });

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Socket connection timed out")),
        10000,
      );
      socket.once("connect", () => {
        clearTimeout(timeout);
        resolve();
      });
      socket.once("connect_error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
    console.log(`Socket connected to ${origin}`);
  } finally {
    socket.close();
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
