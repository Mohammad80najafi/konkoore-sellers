"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { usersList, sessionsMap, normalizePhone } from "./auth-store";
import type { User } from "./types";

// Get current logged-in user from the session cookie
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__Secure-session");
    
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    
    const userId = sessionsMap.get(sessionCookie.value);
    if (!userId) {
      return null;
    }
    
    const user = usersList.find((u) => u._id === userId);
    return user || null;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

// Check if user exists by phone number
export async function checkUserAction(phoneInput: string): Promise<{ success: boolean; exists: boolean; name?: string; error?: string }> {
  try {
    const normalizedPhone = normalizePhone(phoneInput);
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return { success: false, exists: false, error: "شماره موبایل وارد شده معتبر نیست. باید با ۰۹ شروع شده و ۱۱ رقم باشد." };
    }

    const user = usersList.find((u) => {
      if (!u.phone) return false;
      if (u.phone.includes("*")) {
        const parts = u.phone.split("***");
        if (parts.length === 2) {
          const prefix = parts[0];
          const suffix = parts[1];
          return normalizedPhone.startsWith(prefix) && normalizedPhone.endsWith(suffix);
        }
      }
      return u.phone.replace(/\D/g, "") === normalizedPhone;
    });

    return { success: true, exists: !!user, name: user?.name };
  } catch (error) {
    console.error("Check user action error:", error);
    return { success: false, exists: false, error: "خطایی در بررسی شماره موبایل رخ داده است." };
  }
}

// Log in user (or create a new one if the phone number doesn't exist)
export async function loginAction(
  phoneInput: string,
  fullName?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const normalizedPhone = normalizePhone(phoneInput);
    
    // Simple validation
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      return { success: false, error: "شماره موبایل وارد شده معتبر نیست. باید با ۰۹ شروع شده و ۱۱ رقم باشد." };
    }
    
    // Find matching user
    let user = usersList.find((u) => {
      if (!u.phone) return false;
      if (u.phone.includes("*")) {
        const parts = u.phone.split("***");
        if (parts.length === 2) {
          const prefix = parts[0];
          const suffix = parts[1];
          return normalizedPhone.startsWith(prefix) && normalizedPhone.endsWith(suffix);
        }
      }
      return u.phone.replace(/\D/g, "") === normalizedPhone;
    });
    
    // If no user exists, create a new mock user (Register)
    if (!user) {
      user = {
        _id: "u_" + Math.random().toString(36).substring(2, 9),
        name: fullName?.trim() || `کاربر ${normalizedPhone.slice(-4)}`,
        phone: normalizedPhone,
        role: "user",
        isVerified: true,
        createdAt: new Date().toISOString(),
        rating: 5.0,
        totalSales: 0,
        totalPurchases: 0,
      };
      usersList.push(user);
    } else if (fullName) {
      // Update name if registering/editing name
      user.name = fullName.trim();
    }
    
    // Generate secure session token
    const sessionId = randomBytes(32).toString("hex");
    
    // Map token to user ID
    sessionsMap.set(sessionId, user._id);
    
    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("__Secure-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return { success: true, user };
  } catch (error) {
    console.error("Login action error:", error);
    return { success: false, error: "خطایی در فرآیند ورود رخ داده است." };
  }
}

// Log out user by deleting session cookie
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__Secure-session");
    
    if (sessionCookie && sessionCookie.value) {
      sessionsMap.delete(sessionCookie.value);
    }
    
    cookieStore.set("__Secure-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Invalidate immediately
    });
    
    return { success: true };
  } catch (error) {
    console.error("Logout action error:", error);
    return { success: false };
  }
}
