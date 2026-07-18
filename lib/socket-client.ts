"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socketio",
      addTrailingSlash: false,
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function connectSocket(token: string): Socket {
  const activeSocket = getSocket();
  activeSocket.auth = { token };
  if (!activeSocket.connected) activeSocket.connect();
  return activeSocket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
