"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { connectDB } from "./mongodb";
import User from "./models/User";
import type { IUser } from "./models/User";
import Session from "./models/Session";
import Listing from "./models/Listing";
import { normalizePhone } from "./auth-store";
import { generateOtp, verifyOtp, canSendOtp, canVerifyOtp } from "./otp-store";
import type { SellerListing, User as UserType } from "./types";
import type { FieldOfStudy, Grade, BookConditionId } from "./constants";

// Convert Mongoose document to plain User type
function toUserType(doc: IUser): UserType {
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
    if (!canSendOtp(normalizedPhone)) {
      return { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ۵ دقیقه صبر کنید." };
    }
    await generateOtp(normalizedPhone);
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

    // Check verify rate limit
    if (!canVerifyOtp(normalizedPhone)) {
      return { success: false, error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً ۵ دقیقه صبر کنید." };
    }

    // Verify OTP
    if (!await verifyOtp(normalizedPhone, otpCode)) {
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

    // Non-httpOnly cookie for Socket.IO client auth
    cookieStore.set("socket-token", sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
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

    cookieStore.set("socket-token", "", {
      httpOnly: false,
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
export async function getSellerListings(sellerId: string): Promise<SellerListing[]> {
  try {
    await connectDB();
    const listings = await Listing.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(listings)) as SellerListing[];
  } catch (error) {
    console.error("Get seller listings error:", error);
    return [];
  }
}

// Create a new listing
export async function createListingAction(data: {
  title: string;
  author: string;
  publisher: string;
  field: string;
  grade: string;
  subject: string;
  originalPrice: number;
  price: number;
  condition: string;
  year: number;
  edition?: number;
  city: string;
  province: string;
  shippingAvailable: boolean;
  pickupAvailable: boolean;
  description?: string;
  highlighting?: boolean;
  handwrittenNotes?: boolean;
  tornPages?: boolean;
  missingPages?: boolean;
  answersCompleted?: boolean;
  coverDamaged?: boolean;
  hasCd?: boolean;
  hasSupplement?: boolean;
  images?: { url: string; alt: string; isPrimary: boolean }[];
}): Promise<{ success: boolean; listingId?: string; error?: string }> {
  try {
    const sellerId = await assertAuthenticated();

    // Validate prices
    if (!data.price || data.price < 1000) {
      return { success: false, error: "قیمت فروش باید حداقل ۱,۰۰۰ تومان باشد." };
    }
    if (data.price > 50000000) {
      return { success: false, error: "قیمت فروش نمی‌تواند بیش از ۵۰ میلیون تومان باشد." };
    }
    if (!data.originalPrice || data.originalPrice < 1000) {
      return { success: false, error: "قیمت نو کتاب باید حداقل ۱,۰۰۰ تومان باشد." };
    }
    if (data.price > data.originalPrice) {
      return { success: false, error: "قیمت فروش نمی‌تواند بیشتر از قیمت نو باشد." };
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    const iranYear = currentYear - 621;
    if (data.year < 1380 || data.year > iranYear + 1) {
      return { success: false, error: "سال چاپ معتبر نیست." };
    }

    await connectDB();

    const listing = await Listing.create({
      book: {
        title: data.title,
        author: data.author,
        publisher: {
          name: data.publisher,
          slug: data.publisher.replace(/\s+/g, "-").toLowerCase(),
        },
        field: data.field as FieldOfStudy,
        grade: data.grade as Grade,
        subject: data.subject,
        originalPrice: data.originalPrice,
      },
      seller: sellerId,
      price: data.price,
      originalPrice: data.originalPrice,
      condition: {
        grade: data.condition as BookConditionId,
        highlighting: data.highlighting || false,
        handwrittenNotes: data.handwrittenNotes || false,
        tornPages: data.tornPages || false,
        missingPages: data.missingPages || false,
        answersCompleted: data.answersCompleted || false,
        coverDamaged: data.coverDamaged || false,
        hasCd: data.hasCd || false,
        hasSupplement: data.hasSupplement || false,
      },
      images: data.images?.map((img, i) => ({
        url: img.url,
        alt: img.alt || "",
        isPrimary: i === 0,
      })) || [],
      description: data.description || "",
      year: data.year,
      edition: data.edition || 0,
      city: data.city,
      province: data.province,
      shippingAvailable: data.shippingAvailable,
      pickupAvailable: data.pickupAvailable,
      isBundle: false,
      priceIndicator: data.price > data.originalPrice * 0.5 ? "fair" : "great",
      views: 0,
      favorites: 0,
      status: "active",
    });

    return { success: true, listingId: listing._id.toString() };
  } catch (error) {
    console.error("Create listing error:", error);
    return { success: false, error: "خطایی در ایجاد آگهی رخ داد." };
  }
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session-token")?.value || null;
}
