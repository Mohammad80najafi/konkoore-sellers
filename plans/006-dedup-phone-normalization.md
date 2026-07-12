# Plan 006: Deduplicate Phone Digit Normalization

**Commit:** 62314dd  
**Category:** Tech debt  
**Effort:** S  
**Risk of fix:** Low — replacing inline code with function calls  
**Depends on:** Plan 005 (keeps `normalizePhone` as the single source)

## Problem

The Persian/Arabic digit → English digit normalization is implemented inline in three places in `app/auth/login/page.tsx`:
1. `handlePhoneChange` (lines 48-52)
2. `handleOtpChange` (lines 128-132)

Additionally, `handlePhoneChange` only normalizes digits — it doesn't handle the `989→09` or `9→09` prefix normalization that `normalizePhone` in `auth-store.ts` does. This means a user pasting `+98912345678` gets different results depending on which handler processes it.

## Current Code

**`app/auth/login/page.tsx:48-52`** (in `handlePhoneChange`):
```ts
const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
for (let i = 0; i < 10; i++) {
  val = val.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
}
```

**`app/auth/login/page.tsx:128-132`** (in `handleOtpChange`):
```ts
// Same exact regex arrays and loop — copy-pasted
```

## Plan

### Step 1: Add a pure digit-normalization helper

In `lib/utils.ts` (or keep it in `auth-store.ts`), add a lightweight helper that only normalizes digits without the phone prefix logic:

```ts
export function normalizeDigits(str: string): string {
  const persian = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];
  const arabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(persian[i], String(i)).replaceAll(arabic[i], String(i));
  }
  return result;
}
```

Place this in `lib/utils.ts` since it's a general utility, not phone-specific.

### Step 2: Replace inline code in login page

In `app/auth/login/page.tsx`:

1. Add import:
```ts
import { normalizeDigits } from "@/lib/utils";
```

2. In `handlePhoneChange`, replace the 5-line digit normalization block with:
```ts
let val = normalizeDigits(e.target.value);
```

3. In `handleOtpChange`, replace the 5-line digit normalization block with:
```ts
let val = normalizeDigits(value);
```

4. Remove the now-unused `handleSelectMockUser` function's unmasking logic (it does `maskedPhone.replace(/\*\*\*/, "000")` — that's fine, it's different from digit normalization).

### Step 3: Verify

Run:
```bash
npx tsc --noEmit
```

Expected: no type errors.

Manual test:
1. Type Persian digits (۰۹۱۲۳۴۵۶۷۸۹) in phone input → converts to `09123456789`
2. Type Arabic digits (٠٩١٢٣٤٥٦٧٨٩) → converts to `09123456789`
3. Paste mixed digits → all normalized
4. OTP input accepts and normalizes pasted Persian/Arabic digits

## Files In Scope

- `lib/utils.ts` (add `normalizeDigits`)
- `app/auth/login/page.tsx` (replace inline normalization)

## Files Out of Scope

- `lib/auth-store.ts` (`normalizePhone` stays as-is — it's a higher-level function that uses digit normalization internally; could be refactored to call `normalizeDigits` but that's optional)
- `lib/auth-actions.ts` (uses `normalizePhone`, not raw digit normalization)

## Maintenance Note

Any future component that needs to display or accept Persian/Arabic digits should use `normalizeDigits` from `lib/utils.ts`.
