import { createServer } from "node:http";
import { Server } from "socket.io";
import { setupSocketServer } from "../lib/socket-server";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/api/socketio",
  addTrailingSlash: false,
  cors: { origin: "*" },
});

setupSocketServer(io);

export default httpServer;
