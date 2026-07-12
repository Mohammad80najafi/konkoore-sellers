# Plan 011: Persistent OTP Store (MongoDB)

**Commit:** `9d48d7a` | **Category:** Tech Debt | **Effort:** L | **Depends On:** —

## Problem

OTP store uses an in-memory `Map` (`lib/otp-store.ts:8`). Data is lost on server restart. During development with hot reload, OTPs vanish between requests. This is already flagged with a ponytail comment.

## Scope

Replace in-memory Map with MongoDB collection for OTP storage.

**In scope:**
- New `OtpCode` Mongoose model
- TTL index for auto-expiry
- Replace `generateOtp`/`verifyOtp` to use DB

**Out of scope:**
- Actual SMS delivery (still console.log in dev)
- Redis migration (future optimization)

## Current State

`lib/otp-store.ts`:
```tsx
// ponytail: in-memory OTP store, replace with SMS provider when ready
const store = new Map<string, OtpEntry>();
const TTL_MS = 2 * 60 * 1000;

export function generateOtp(phone: string): string {
  const code = String(Math.floor(1000 + Math.random() * 9000));
  store.set(phone, { code, expiresAt: Date.now() + TTL_MS });
  console.log(`[DEV] OTP for ${phone}: ${code}`);
  return code;
}

export function verifyOtp(phone: string, code: string): boolean {
  const entry = store.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { store.delete(phone); return false; }
  if (entry.code !== code) return false;
  store.delete(phone);
  return true;
}
```

## Steps

1. Create `lib/models/OtpCode.ts`:
```tsx
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtpCode extends Document {
  phone: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpCodeSchema = new Schema<IOtpCode>({
  phone: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpCode: Model<IOtpCode> =
  mongoose.models.OtpCode || mongoose.model<IOtpCode>("OtpCode", OtpCodeSchema);

export default OtpCode;
```

2. Rewrite `lib/otp-store.ts`:
```tsx
import { connectDB } from "./mongodb";
import OtpCode from "./models/OtpCode";

const OTP_TTL_MS = 2 * 60 * 1000;

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
```

3. Update callers in `lib/auth-actions.ts` — `generateOtp` and `verifyOtp` are now async:
```tsx
// sendOtpAction:
await generateOtp(normalizedPhone);

// loginAction:
if (!await verifyOtp(normalizedPhone, otpCode)) {
```

## Verification

```bash
npx tsx scripts/seed.ts  # ensure MongoDB is running
npx next build
# Login flow: send OTP → verify → succeeds
# Restart dev server → OTP still works (persisted in DB)
```

## Maintenance

- The TTL index auto-cleans expired codes
- When SMS provider is added, integrate here
- For high traffic, add composite index on {phone, code}
