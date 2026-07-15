import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { setupSocketServer } from "./lib/socket-server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port, webpack: dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socketio",
    cors: { origin: "*" },
  });

  setupSocketServer(io);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
