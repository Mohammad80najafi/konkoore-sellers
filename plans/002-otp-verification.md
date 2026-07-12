# Plan 002: Implement OTP Verification

**Commit:** 62314dd  
**Category:** Security  
**Effort:** M  
**Risk of fix:** Medium — new flow, touches auth system  
**Depends on:** Nothing

## Problem

The login flow presents a 4-digit OTP input but `loginAction` in `lib/auth-actions.ts` creates a session unconditionally without checking the submitted code. Any 4-digit string grants access. This is a critical auth bypass.

## Current Code

**`app/auth/login/page.tsx:172-198`** — OTP submit handler:
```ts
const handleVerifySubmit = async (e: React.FormEvent) => {
  // ...
  const result = await loginAction(phoneNumber, isRegistering ? fullName : undefined);
  // loginAction creates session regardless of OTP code
```

**`lib/auth-actions.ts:91-152`** — `loginAction`:
```ts
export async function loginAction(
  phoneInput: string,
  fullName?: string
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  // Finds or creates user, then creates session + cookie
  // Never receives or checks an OTP code
```

## Plan

Since no SMS provider is configured yet, implement a **local code store** that:
- Generates a random 4-digit code per phone number
- Stores it in memory (with TTL) on the server
- Validates it on login

This is a temporary solution — swap the code store for an SMS API later.

### Step 1: Create `lib/otp-store.ts`

```ts
// ponytail: in-memory OTP store, replace with SMS provider when ready

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const store = new Map<string, OtpEntry>();
const TTL_MS = 2 * 60 * 1000; // 2 minutes

export function generateOtp(phone: string): string {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  store.set(phone, { code, expiresAt: Date.now() + TTL_MS });
  // In production, send via SMS here
  console.log(`[DEV] OTP for ${phone}: ${code}`);
  return code;
}

export function verifyOtp(phone: string, code: string): boolean {
  const entry = store.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  store.delete(phone); // one-time use
  return true;
}
```

### Step 2: Add `sendOtpAction` server action

In `lib/auth-actions.ts`, add:

```ts
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
```

### Step 3: Modify `loginAction` to accept and verify OTP

Change the signature to accept an OTP code:

```ts
export async function loginAction(
  phoneInput: string,
  otpCode: string,
  fullName?: string
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  // ...existing phone validation...
  
  // Verify OTP
  if (!verifyOtp(normalizedPhone, otpCode)) {
    return { success: false, error: "کد تایید نادرست یا منقضی شده است." };
  }
  
  // ...rest of existing logic (find/create user, create session, set cookie)...
}
```

### Step 4: Update login page client

In `app/auth/login/page.tsx`:

1. Import `sendOtpAction`:
```ts
import { loginAction, checkUserAction, sendOtpAction } from "@/lib/auth-actions";
```

2. In `handlePhoneSubmit`, after `checkUserAction` succeeds and `setStep(2)` is called, trigger OTP send:
```ts
await sendOtpAction(phoneNumber);
```

3. In `handleVerifySubmit`, pass the OTP code to `loginAction`:
```ts
const code = otpCode.join("");
const result = await loginAction(phoneNumber, code, isRegistering ? fullName : undefined);
```

4. In `handleResendCode`, call `sendOtpAction`:
```ts
const handleResendCode = async () => {
  if (!canResend) return;
  setIsLoading(true);
  setError(null);
  await sendOtpAction(phoneNumber);
  setIsLoading(false);
  setTimer(120);
  setOtpCode(["", "", "", ""]);
  otpRefs[0].current?.focus();
};
```

### Step 5: Verify

Run:
```bash
npx tsc --noEmit
```

Expected: no type errors.

Manual test:
1. Enter phone number → see OTP code logged in server console
2. Enter wrong code → error message shown
3. Enter correct code → login succeeds
4. Wait 2+ minutes → code expires, error shown
5. Resend → new code generated, old code invalidated

## Files In Scope

- `lib/otp-store.ts` (new file)
- `lib/auth-actions.ts` (modify `loginAction`, add `sendOtpAction`)
- `app/auth/login/page.tsx` (wire up OTP send/verify)

## Files Out of Scope

- SMS provider integration (out of scope — console.log for now)
- Rate limiting on OTP generation (add when SMS provider is live)

## Maintenance Note

When adding an SMS provider:
1. Replace `console.log` in `generateOtp` with the provider's API call
2. Move the code store to Redis or similar (current in-memory store resets on server restart)
3. Add rate limiting (max 3 OTP requests per phone per 10 minutes)

## Escape Hatch

If the in-memory store causes issues in production (e.g. serverless cold starts), fall back to the current behavior temporarily by making `verifyOtp` always return `true` — but flag it as a security regression and fix immediately.
