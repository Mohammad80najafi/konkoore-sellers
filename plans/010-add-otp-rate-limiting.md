# Plan 010: Add OTP Rate Limiting

**Commit:** `9d48d7a` | **Category:** Security | **Effort:** M | **Depends On:** —

## Problem

No rate limiting on OTP generation. An attacker can:
- Spam `sendOtpAction` to flood a phone number with codes
- Brute-force the 4-digit OTP (10,000 possibilities)

## Scope

Add in-memory rate limiting to OTP operations.

**In scope:**
- Max 3 OTP requests per phone per 5 minutes
- Max 10 failed OTP verifications per phone per 5 minutes
- Clear error messages in Persian

**Out of scope:**
- IP-based rate limiting (requires middleware)
- SMS provider integration (already marked ponytail)

## Current State

`lib/otp-store.ts`:
```tsx
const store = new Map<string, OtpEntry>();
// No rate limiting, no attempt tracking
```

`lib/auth-actions.ts:101-116`:
```tsx
export async function sendOtpAction(phoneInput: string) {
  // No rate check
  generateOtp(normalizedPhone);
  return { success: true };
}
```

## Steps

1. Add rate limit state to `lib/otp-store.ts`:
```tsx
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const sendLimits = new Map<string, RateLimitEntry>();
const verifyLimits = new Map<string, RateLimitEntry>();
const SEND_WINDOW_MS = 5 * 60 * 1000;
const MAX_SENDS = 3;
const MAX_VERIFIES = 10;

export function canSendOtp(phone: string): boolean {
  const entry = sendLimits.get(phone);
  if (!entry || Date.now() > entry.resetAt) {
    sendLimits.set(phone, { count: 1, resetAt: Date.now() + SEND_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_SENDS) return false;
  entry.count++;
  return true;
}

export function canVerifyOtp(phone: string): boolean {
  const entry = verifyLimits.get(phone);
  if (!entry || Date.now() > entry.resetAt) {
    verifyLimits.set(phone, { count: 1, resetAt: Date.now() + SEND_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_VERIFIES) return false;
  entry.count++;
  return true;
}
```

2. Update `sendOtpAction` in `lib/auth-actions.ts`:
```tsx
import { generateOtp, verifyOtp, canSendOtp } from "./otp-store";

export async function sendOtpAction(phoneInput: string) {
  const normalizedPhone = normalizePhone(phoneInput);
  // ... validation ...
  if (!canSendOtp(normalizedPhone)) {
    return { success: false, error: "تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ۵ دقیقه صبر کنید." };
  }
  generateOtp(normalizedPhone);
  return { success: true };
}
```

3. Update `loginAction` to check verify rate:
```tsx
import { verifyOtp, canVerifyOtp } from "./otp-store";

// In loginAction, before verifyOtp:
if (!canVerifyOtp(normalizedPhone)) {
  return { success: false, error: "تعداد تلاش‌ها بیش از حد مجاز است. لطفاً ۵ دقیقه صبر کنید." };
}
```

## Verification

```bash
npx next build
# Send OTP 4 times rapidly → 4th should fail with rate limit error
# Try 11 wrong OTP codes → 11th should fail
```

## Maintenance

- When SMS provider is added, rate limits prevent cost abuse
- In-memory limits reset on server restart (acceptable for dev)
- For production, move to Redis-backed rate limiting
