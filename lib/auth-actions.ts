"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { connectDB } from "./mongodb";
import User from "./models/User";
import Session from "./models/Session";
import Listing from "./models/Listing";
import { normalizePhone } from "./auth-store";
import { generateOtp, verifyOtp } from "./otp-store";
import type { User as UserType } from "./types";

// Convert Mongoose document to plain User type
function toUserType(doc: any): UserType {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    avatar: doc.avatar,
    role: doc.role,
    isVerified: doc.isVerified,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    province: doc.province,
    city: doc.city,
    rating: doc.rating,
    totalSales: doc.totalSales,
    totalPurchases: doc.totalPurchases,
  };
}

// Assert the caller is logged in; returns their user ID or throws
async function assertAuthenticated(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return user._id;
}

// Get current logged-in user from the session cookie
export async function getCurrentUser(): Promise<UserType | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session-token");

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    await connectDB();

    const session = await Session.findOne({ token: sessionCookie.value });
    if (!session) return null;

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return null;
    }

    const user = await User.findById(session.userId);
    if (!user) return null;

    return toUserType(user);
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

// Check if user exists by phone number
export async function checkUserAction(
  phoneInput: string
): Promise<{ success: boolean; exists: boolean; name?: string; error?: string }> {
  try {
    const normalizedPhone = normalizePhone(phoneInput);
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return {
        success: false,
        exists: false,
        error: "شماره موبایل وارد شده معتبر نیست. باید با ۰۹ شروع شده و ۱۱ رقم باشد.",
      };
    }

    await connectDB();

    const user = await User.findOne({ phone: normalizedPhone });
    return { success: true, exists: !!user, name: user?.name };
  } catch (error) {
    console.error("Check user action error:", error);
    return {
      success: false,
      exists: false,
      error: "خطایی در بررسی شماره موبایل رخ داده است.",
    };
  }
}

// Send OTP code to a phone number (dev: logs to console)
export async function sendOtpAction(
  phoneInput: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedPhone = normalizePhone(phoneInput);
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return { success: false, error: "شماره موبایل معتبر نیست." };
    }
    generateOtp(normalizedPhone);
    return { success: true };
  } catch (error) {
    console.error("Send OTP error:", error);
    return { success: false, error: "خطایی در ارسال کد رخ داد." };
  }
}

// Log in user (or create a new one if the phone number doesn't exist)
export async function loginAction(
  phoneInput: string,
  otpCode: string,
  fullName?: string
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  try {
    const normalizedPhone = normalizePhone(phoneInput);

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return {
        success: false,
        error: "شماره موبایل وارد شده معتبر نیست. باید با ۰۹ شروع شده و ۱۱ رقم باشد.",
      };
    }

    // Verify OTP
    if (!verifyOtp(normalizedPhone, otpCode)) {
      return { success: false, error: "کد تایید نادرست یا منقضی شده است." };
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      // Register new user
      user = await User.create({
        name: fullName?.trim() || `کاربر ${normalizedPhone.slice(-4)}`,
        phone: normalizedPhone,
        role: "user",
        isVerified: true,
        rating: 5.0,
        totalSales: 0,
        totalPurchases: 0,
      });
    } else if (fullName) {
      user.name = fullName.trim();
      await user.save();
    }

    // Generate secure session token
    const sessionId = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

    // Save session to DB
    await Session.create({
      token: sessionId,
      userId: user._id,
      expiresAt,
    });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("session-token", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return { success: true, user: toUserType(user) };
  } catch (error) {
    console.error("Login action error:", error);
    return { success: false, error: "خطایی در فرآیند ورود رخ داده است." };
  }
}

// Log out user by deleting session
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session-token");

    if (sessionCookie && sessionCookie.value) {
      await connectDB();
      await Session.deleteOne({ token: sessionCookie.value });
    }

    cookieStore.set("session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return { success: true };
  } catch (error) {
    console.error("Logout action error:", error);
    return { success: false };
  }
}

// Update User Profile Details
export async function updateProfileAction(
  userId: string,
  data: { name: string; email?: string; province?: string; city?: string }
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  try {
    const callerId = await assertAuthenticated();
    if (callerId !== userId) {
      return { success: false, error: "شما اجازه ویرایش این پروفایل را ندارید." };
    }

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "نام و نام خانوادگی الزامی است." };
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: "کاربر یافت نشد." };
    }

    user.name = data.name.trim();
    user.email = data.email?.trim() || "";
    user.province = data.province || "";
    user.city = data.city || "";
    await user.save();

    return { success: true, user: toUserType(user) };
  } catch (error) {
    console.error("Update profile action error:", error);
    return { success: false, error: "خطایی در ویرایش اطلاعات کاربری رخ داد." };
  }
}

// Update Listing Status (e.g. Mark as Sold)
export async function updateListingStatusAction(
  listingId: string,
  status: "active" | "sold" | "reserved" | "expired" | "pending"
): Promise<{ success: boolean; error?: string }> {
  try {
    const callerId = await assertAuthenticated();
    await connectDB();

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return { success: false, error: "آگهی یافت نشد." };
    }
    if (listing.seller.toString() !== callerId) {
      return { success: false, error: "شما اجازه ویرایش این آگهی را ندارید." };
    }

    listing.status = status;
    await listing.save();

    return { success: true };
  } catch (error) {
    console.error("Update listing status error:", error);
    return {
      success: false,
      error: "خطایی در بروزرسانی وضعیت آگهی رخ داد.",
    };
  }
}

// Get seller's listings
export async function getSellerListings(sellerId: string): Promise<any[]> {
  try {
    await connectDB();
    const listings = await Listing.find({ seller: sellerId }).sort({ createdAt: -1 });
    return listings.map((l) => ({
      _id: l._id.toString(),
      book: l.book,
      seller: sellerId,
      price: l.price,
      originalPrice: l.originalPrice,
      condition: l.condition,
      images: l.images,
      description: l.description,
      year: l.year,
      edition: l.edition,
      city: l.city,
      province: l.province,
      shippingAvailable: l.shippingAvailable,
      pickupAvailable: l.pickupAvailable,
      isBundle: l.isBundle,
      bundleBooks: l.bundleBooks,
      priceIndicator: l.priceIndicator,
      views: l.views,
      favorites: l.favorites,
      status: l.status,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt),
      updatedAt: l.updatedAt instanceof Date ? l.updatedAt.toISOString() : String(l.updatedAt),
    }));
  } catch (error) {
    console.error("Get seller listings error:", error);
    return [];
  }
}
