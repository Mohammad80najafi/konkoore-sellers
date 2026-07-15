import mongoose from "mongoose";
import { connectDB } from "./mongodb";
import Conversation from "./models/Conversation";
import Message from "./models/Message";
import type {
  ChatMessage,
  ConversationSummary,
  MessageUser,
} from "./message-types";

interface PopulatedUser {
  _id: { toString(): string };
  name?: string;
  avatar?: string;
}

interface PopulatedListing {
  _id: { toString(): string };
  book?: { title?: string; author?: string };
  images?: { url?: string; isPrimary?: boolean }[];
}

interface PopulatedMessage {
  _id: { toString(): string };
  conversation: { toString(): string } | string;
  sender: PopulatedUser;
  content?: string;
  image?: string;
  isRead?: boolean;
  createdAt: Date | string;
}

interface PopulatedConversation {
  _id: { toString(): string };
  participants: PopulatedUser[];
  listing?: PopulatedListing;
  lastMessage?: PopulatedMessage;
  lastMessageAt?: Date | string;
  updatedAt: Date | string;
}

function serializeUser(user: PopulatedUser): MessageUser {
  return {
    _id: user._id.toString(),
    name: user.name?.trim() || "کاربر کنکورباز",
    avatar: user.avatar || "",
  };
}

function serializeMessage(
  message: PopulatedMessage,
  conversationId: string,
): ChatMessage {
  return {
    _id: message._id.toString(),
    conversationId,
    sender: serializeUser(message.sender),
    content: message.content || "",
    image: message.image || "",
    isRead: Boolean(message.isRead),
    createdAt: new Date(message.createdAt).toISOString(),
  };
}

export async function getConversations(
  userId: string,
): Promise<ConversationSummary[]> {
  await connectDB();
  const rows = (await Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name avatar")
    .populate("listing", "book.title book.author images")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatar" },
    })
    .lean()) as unknown as PopulatedConversation[];

  return rows.map((conversation) => {
    const id = conversation._id.toString();
    const otherUser = conversation.participants.find(
      (participant) => participant._id.toString() !== userId,
    );
    const images = conversation.listing?.images || [];
    const cover = images.find((image) => image.isPrimary) || images[0];

    return {
      _id: id,
      otherUser: otherUser ? serializeUser(otherUser) : undefined,
      listing: conversation.listing
        ? {
            _id: conversation.listing._id.toString(),
            title: conversation.listing.book?.title || "آگهی کتاب",
            author: conversation.listing.book?.author || "",
            coverUrl: cover?.url || "",
          }
        : undefined,
      lastMessage: conversation.lastMessage
        ? serializeMessage(conversation.lastMessage, id)
        : undefined,
      updatedAt: new Date(
        conversation.lastMessageAt || conversation.updatedAt,
      ).toISOString(),
    };
  });
}

export async function getMessages(
  conversationId: string,
  userId: string,
): Promise<ChatMessage[]> {
  if (!mongoose.isValidObjectId(conversationId)) return [];

  await connectDB();
  const canAccess = await Conversation.exists({
    _id: conversationId,
    participants: userId,
  });
  if (!canAccess) return [];

  const rows = (await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("sender", "name avatar")
    .lean()) as unknown as PopulatedMessage[];

  return rows.reverse().map((message) => serializeMessage(message, conversationId));
}

export async function getUnreadCount(userId: string): Promise<number> {
  if (!mongoose.isValidObjectId(userId)) return 0;

  await connectDB();
  const conversations = await Conversation.find({ participants: userId }).select("_id");
  const result = await Message.aggregate<{ total: number }>([
    {
      $match: {
        conversation: { $in: conversations.map((conversation) => conversation._id) },
        sender: { $ne: new mongoose.Types.ObjectId(userId) },
        isRead: false,
      },
    },
    { $group: { _id: "$conversation" } },
    { $count: "total" },
  ]);
  return result[0]?.total || 0;
}

export async function getUnreadCountsByConversation(
  userId: string,
): Promise<Record<string, number>> {
  if (!mongoose.isValidObjectId(userId)) return {};

  await connectDB();
  const conversations = await Conversation.find({ participants: userId }).select("_id");
  const results = await Message.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
    {
      $match: {
        conversation: { $in: conversations.map((conversation) => conversation._id) },
        sender: { $ne: new mongoose.Types.ObjectId(userId) },
        isRead: false,
      },
    },
    { $group: { _id: "$conversation", count: { $sum: 1 } } },
  ]);

  return Object.fromEntries(
    results.map((result) => [result._id.toString(), result.count]),
  );
}

export async function getConversationUnreadCount(
  conversationId: string,
  userId: string,
): Promise<number> {
  if (!mongoose.isValidObjectId(conversationId) || !mongoose.isValidObjectId(userId)) {
    return 0;
  }

  await connectDB();
  return Message.countDocuments({
    conversation: conversationId,
    sender: { $ne: new mongoose.Types.ObjectId(userId) },
    isRead: false,
  });
}
