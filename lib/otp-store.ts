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
