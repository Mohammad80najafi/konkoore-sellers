// OTP store backed by MongoDB with in-memory rate limits

import { connectDB } from "./mongodb";
import OtpCode from "./models/OtpCode";

const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const sendLimits = new Map<string, RateLimitEntry>();
const verifyLimits = new Map<string, RateLimitEntry>();

const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SENDS = 3;
const MAX_VERIFIES = 10;

export function canSendOtp(phone: string): boolean {
  const entry = sendLimits.get(phone);
  if (!entry || Date.now() > entry.resetAt) {
    sendLimits.set(phone, { count: 1, resetAt: Date.now() + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_SENDS) return false;
  entry.count++;
  return true;
}

export function canVerifyOtp(phone: string): boolean {
  const entry = verifyLimits.get(phone);
  if (!entry || Date.now() > entry.resetAt) {
    verifyLimits.set(phone, { count: 1, resetAt: Date.now() + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_VERIFIES) return false;
  entry.count++;
  return true;
}

export async function generateOtp(phone: string): Promise<string> {
  await connectDB();
  const code = String(Math.floor(1000 + Math.random() * 9000));
  await OtpCode.deleteMany({ phone }); // clear old codes
  await OtpCode.create({
    phone,
    code,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  console.log(`[DEV] OTP for ${phone}: ${code}`);
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  await connectDB();
  const entry = await OtpCode.findOne({ phone, code });
  if (!entry) return false;
  if (entry.expiresAt < new Date()) {
    await OtpCode.deleteOne({ _id: entry._id });
    return false;
  }
  await OtpCode.deleteOne({ _id: entry._id }); // one-time use
  return true;
}
