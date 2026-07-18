"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/_socketio.ts
var socketio_exports = {};
__export(socketio_exports, {
  default: () => socketio_default
});
module.exports = __toCommonJS(socketio_exports);
var import_node_http = require("node:http");
var import_socket = require("socket.io");

// lib/socket-server.ts
var import_mongoose7 = __toESM(require("mongoose"));

// lib/mongodb.ts
var import_node_dns = require("node:dns");
var import_mongoose = __toESM(require("mongoose"));
var MONGODB_URI = process.env.MONGODB_URI;
var MONGODB_DB = process.env.MONGODB_DB || "konkoorbaz";
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}
if (process.platform === "win32" && MONGODB_URI.startsWith("mongodb+srv://")) {
  (0, import_node_dns.setServers)(["1.1.1.1", "8.8.8.8"]);
}
var cached = global.mongooseCache ?? { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}
async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = import_mongoose.default.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: MONGODB_DB
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// lib/models/Session.ts
var import_mongoose2 = __toESM(require("mongoose"));
var SessionSchema = new import_mongoose2.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: {
      type: import_mongoose2.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
var Session = import_mongoose2.default.models.Session || import_mongoose2.default.model("Session", SessionSchema);
var Session_default = Session;

// lib/models/User.ts
var import_mongoose3 = __toESM(require("mongoose"));
var UserSchema = new import_mongoose3.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user"
    },
    isVerified: { type: Boolean, default: false },
    province: { type: String, default: "" },
    city: { type: String, default: "" },
    rating: { type: Number, default: 5 },
    totalSales: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 }
  },
  { timestamps: true }
);
var User = import_mongoose3.default.models.User || import_mongoose3.default.model("User", UserSchema);
var User_default = User;

// lib/models/Message.ts
var import_mongoose4 = __toESM(require("mongoose"));
var MessageSchema = new import_mongoose4.Schema(
  {
    conversation: {
      type: import_mongoose4.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true
    },
    sender: {
      type: import_mongoose4.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      default: "",
      trim: true
    },
    image: {
      type: String,
      default: ""
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
MessageSchema.index({ conversation: 1, createdAt: -1 });
var Message = import_mongoose4.default.models.Message || import_mongoose4.default.model("Message", MessageSchema);
var Message_default = Message;

// lib/models/Conversation.ts
var import_mongoose5 = __toESM(require("mongoose"));
var ConversationSchema = new import_mongoose5.Schema(
  {
    participants: [
      {
        type: import_mongoose5.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    listing: {
      type: import_mongoose5.Schema.Types.ObjectId,
      ref: "Listing"
    },
    lastMessage: {
      type: import_mongoose5.Schema.Types.ObjectId,
      ref: "Message"
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);
ConversationSchema.index({ participants: 1 });
var Conversation = import_mongoose5.default.models.Conversation || import_mongoose5.default.model("Conversation", ConversationSchema);
var Conversation_default = Conversation;

// lib/messages-data.ts
var import_mongoose6 = __toESM(require("mongoose"));
async function getUnreadCount(userId) {
  if (!import_mongoose6.default.isValidObjectId(userId)) return 0;
  await connectDB();
  const conversations = await Conversation_default.find({ participants: userId }).select("_id");
  const result = await Message_default.aggregate([
    {
      $match: {
        conversation: { $in: conversations.map((conversation) => conversation._id) },
        sender: { $ne: new import_mongoose6.default.Types.ObjectId(userId) },
        isRead: false
      }
    },
    { $group: { _id: "$conversation" } },
    { $count: "total" }
  ]);
  return result[0]?.total || 0;
}
async function getConversationUnreadCount(conversationId, userId) {
  if (!import_mongoose6.default.isValidObjectId(conversationId) || !import_mongoose6.default.isValidObjectId(userId)) {
    return 0;
  }
  await connectDB();
  return Message_default.countDocuments({
    conversation: conversationId,
    sender: { $ne: new import_mongoose6.default.Types.ObjectId(userId) },
    isRead: false
  });
}

// lib/socket-server.ts
var MAX_MESSAGE_LENGTH = 2e3;
var UPLOAD_PATH = /^(?:\/uploads\/[a-zA-Z0-9._-]+|https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/uploads\/[^?#]+)$/;
async function canAccessConversation(conversationId, userId) {
  if (!import_mongoose7.default.isValidObjectId(conversationId)) return false;
  return Boolean(
    await Conversation_default.exists({ _id: conversationId, participants: userId })
  );
}
async function emitUnreadState(io2, userId, conversationId) {
  const [total, conversationCount] = await Promise.all([
    getUnreadCount(userId),
    conversationId ? getConversationUnreadCount(conversationId, userId) : Promise.resolve(0)
  ]);
  io2.to(`user:${userId}`).emit("unread-count", total);
  if (conversationId) {
    io2.to(`user:${userId}`).emit("conversation-unread", {
      conversationId,
      count: conversationCount
    });
  }
}
async function markConversationRead(io2, conversationId, userId) {
  if (!await canAccessConversation(conversationId, userId)) return;
  await Message_default.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      isRead: false
    },
    { isRead: true }
  );
  await emitUnreadState(io2, userId, conversationId);
}
function setupSocketServer(io2) {
  const onlineSockets = /* @__PURE__ */ new Map();
  io2.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== "string" || !token) {
        next(new Error("unauthorized"));
        return;
      }
      await connectDB();
      const session = await Session_default.findOne({
        token,
        expiresAt: { $gt: /* @__PURE__ */ new Date() }
      }).select("userId");
      if (!session) {
        next(new Error("unauthorized"));
        return;
      }
      const user = await User_default.findById(session.userId).select("name avatar");
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
  io2.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
    const userSockets = onlineSockets.get(userId) || /* @__PURE__ */ new Set();
    const wasOffline = userSockets.size === 0;
    userSockets.add(socket.id);
    onlineSockets.set(userId, userSockets);
    if (wasOffline) {
      io2.to(`presence:${userId}`).emit("presence", { userId, online: true });
    }
    socket.on(
      "presence:subscribe",
      async (data) => {
        const conversationId = data?.conversationId;
        const targetUserId = data?.userId;
        if (!conversationId || !targetUserId || !import_mongoose7.default.isValidObjectId(targetUserId) || !await Conversation_default.exists({
          _id: conversationId,
          participants: { $all: [userId, targetUserId] }
        }))
          return;
        socket.join(`presence:${targetUserId}`);
        socket.emit("presence", {
          userId: targetUserId,
          online: Boolean(onlineSockets.get(targetUserId)?.size)
        });
      }
    );
    socket.on("presence:unsubscribe", (targetUserId) => {
      socket.leave(`presence:${targetUserId}`);
    });
    socket.on("join-conversation", async (conversationId) => {
      if (!await canAccessConversation(conversationId, userId)) return;
      socket.join(`conversation:${conversationId}`);
      await markConversationRead(io2, conversationId, userId);
    });
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });
    socket.on(
      "typing",
      (data) => {
        const conversationId = data?.conversationId;
        if (!conversationId || !socket.rooms.has(`conversation:${conversationId}`))
          return;
        socket.to(`conversation:${conversationId}`).emit("typing", {
          conversationId,
          userId,
          isTyping: Boolean(data.isTyping)
        });
      }
    );
    socket.on(
      "send-message",
      async (payload, reply) => {
        const respond = reply || (() => void 0);
        try {
          const conversationId = payload?.conversationId;
          const content = payload?.content?.trim() || "";
          const image = payload?.image || "";
          if (!conversationId || !content && !image || content.length > MAX_MESSAGE_LENGTH || image && !UPLOAD_PATH.test(image) || !await canAccessConversation(conversationId, userId)) {
            respond({ ok: false, error: "\u067E\u06CC\u0627\u0645 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." });
            return;
          }
          const conversation = await Conversation_default.findById(conversationId).select(
            "participants"
          );
          if (!conversation) {
            respond({ ok: false, error: "\u0645\u06A9\u0627\u0644\u0645\u0647 \u067E\u06CC\u062F\u0627 \u0646\u0634\u062F." });
            return;
          }
          const created = await Message_default.create({
            conversation: conversationId,
            sender: userId,
            content,
            image
          });
          await Conversation_default.findByIdAndUpdate(conversationId, {
            lastMessage: created._id,
            lastMessageAt: created.createdAt
          });
          const message = {
            _id: created._id.toString(),
            conversationId,
            sender: {
              _id: userId,
              name: socket.data.userName,
              avatar: socket.data.userAvatar
            },
            content,
            image,
            isRead: false,
            createdAt: created.createdAt.toISOString()
          };
          for (const participant of conversation.participants) {
            io2.to(`user:${participant.toString()}`).emit("new-message", message);
          }
          respond({ ok: true, message });
          await Promise.all(
            conversation.participants.map((participant) => participant.toString()).filter((participantId) => participantId !== userId).map(
              (participantId) => emitUnreadState(io2, participantId, conversationId)
            )
          );
        } catch (error) {
          console.error("[Socket] Send message failed:", error);
          respond({ ok: false, error: "\u067E\u06CC\u0627\u0645 \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F. \u062F\u0648\u0628\u0627\u0631\u0647 \u062A\u0644\u0627\u0634 \u06A9\u0646\u06CC\u062F." });
        }
      }
    );
    socket.on("mark-read", async (data) => {
      if (!data?.conversationId) return;
      await markConversationRead(io2, data.conversationId, userId);
    });
    void emitUnreadState(io2, userId).catch((error) => {
      console.error("[Socket] Unread sync failed:", error);
    });
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (!room.startsWith("conversation:")) continue;
        socket.to(room).emit("typing", {
          conversationId: room.slice("conversation:".length),
          userId,
          isTyping: false
        });
      }
    });
    socket.on("disconnect", () => {
      const remainingSockets = onlineSockets.get(userId);
      remainingSockets?.delete(socket.id);
      if (remainingSockets?.size) return;
      onlineSockets.delete(userId);
      io2.to(`presence:${userId}`).emit("presence", { userId, online: false });
    });
  });
}

// api/_socketio.ts
var httpServer = (0, import_node_http.createServer)();
var io = new import_socket.Server(httpServer, {
  path: "/api/socketio",
  addTrailingSlash: false,
  cors: { origin: "*" }
});
setupSocketServer(io);
var socketio_default = httpServer;
