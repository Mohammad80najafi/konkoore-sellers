"use server";

import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "./mongodb";
import Conversation from "./models/Conversation";
import Listing from "./models/Listing";
import Session from "./models/Session";
import User from "./models/User";

async function getAuthenticatedUserId(): Promise<string> {
  const token = (await cookies()).get("session-token")?.value;
  if (!token) throw new Error("NOT_AUTHENTICATED");

  await connectDB();
  const session = await Session.findOne({
    token,
    expiresAt: { $gt: new Date() },
  }).select("userId");
  if (!session) throw new Error("NOT_AUTHENTICATED");
  return session.userId.toString();
}

export async function searchMessageUsers(query: string) {
  try {
    const userId = await getAuthenticatedUserId();
    const value = query.trim().slice(0, 50);
    if (value.length < 2) return [];
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const users = await User.find({
      _id: { $ne: userId },
      name: { $regex: escaped, $options: "i" },
    })
      .limit(8)
      .select("name phone avatar")
      .lean();

    return users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      phone: user.phone || "",
      avatar: user.avatar || "",
    }));
  } catch {
    return [];
  }
}

export async function createMessageConversation(
  participantId: string,
  listingId?: string,
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    const userId = await getAuthenticatedUserId();
    if (
      !mongoose.isValidObjectId(participantId) ||
      participantId === userId ||
      (listingId && !mongoose.isValidObjectId(listingId))
    ) {
      return { success: false, error: "اطلاعات مکالمه معتبر نیست." };
    }

    const participantExists = await User.exists({ _id: participantId });
    if (!participantExists) {
      return { success: false, error: "کاربر پیدا نشد." };
    }

    if (listingId) {
      const listing = await Listing.exists({ _id: listingId, seller: participantId });
      if (!listing) {
        return { success: false, error: "آگهی انتخاب‌شده معتبر نیست." };
      }
    }

    const query = {
      participants: { $all: [userId, participantId], $size: 2 },
      ...(listingId ? { listing: listingId } : { listing: { $exists: false } }),
    };
    const existing = await Conversation.findOne(query).select("_id");
    if (existing) {
      return { success: true, conversationId: existing._id.toString() };
    }

    const conversation = await Conversation.create({
      participants: [userId, participantId],
      listing: listingId || undefined,
      lastMessageAt: new Date(),
    });
    return { success: true, conversationId: conversation._id.toString() };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_AUTHENTICATED") {
      return { success: false, error: "برای ارسال پیام وارد حساب شوید." };
    }
    console.error("Create message conversation error:", error);
    return { success: false, error: "مکالمه ایجاد نشد. دوباره تلاش کنید." };
  }
}
