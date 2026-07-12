# Plan 005: Remove Dead In-Memory Auth Store Code

**Commit:** 62314dd  
**Category:** Tech debt  
**Effort:** S  
**Risk of fix:** Low — deleting unused code  
**Depends on:** Nothing

## Problem

`lib/auth-store.ts` maintains three in-memory stores (`usersList`, `sessionsMap`, `listingsList`) and `lib/mock-data.ts` exposes sync helper functions (`getRecentListings`, `getBundleListings`, `getListingsByField`, `getListingById`, `getRecommendedListings`, `getSellerListings`). None of these are imported by any server action, page, or component — they are remnants of the pre-MongoDB prototype. Only `normalizePhone` from `auth-store.ts` is actually used.

The dead code is confusing: a reader sees `getSellerListings` in both `auth-store.ts` (sync, mock) and `auth-actions.ts` (async, real DB) and must determine which one matters.

## Current Code

**`lib/auth-store.ts:1-23`** — three unused global stores:
```ts
const globalUsers = globalThis as unknown as { usersList: User[] };
// ...
export const usersList = globalUsers.usersList;
// sessionsMap, listingsList — same pattern
```

**`lib/mock-data.ts:885-911`** — six unused sync functions:
```ts
export function getRecentListings(count = 8): Listing[] { ... }
export function getBundleListings(): Listing[] { ... }
export function getListingsByField(field: string, count = 8): Listing[] { ... }
export function getListingById(id: string): Listing | undefined { ... }
export function getRecommendedListings(count = 8): Listing[] { ... }
export function getSellerListings(sellerId: string): Listing[] { ... }
```

## Plan

### Step 1: Clean up `lib/auth-store.ts`

Remove lines 1-23 (the `mockUsers`, `mockListings` import and the three global stores + exports). Keep only the `normalizePhone` function (lines 26-47).

The file becomes:

```ts
// Helper to normalize Persian/Arabic digits to English digits
export function normalizePhone(phone: string): string {
  const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  
  let normalized = phone.trim();
  
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
  }
  
  // Remove all non-digit characters
  normalized = normalized.replace(/\D/g, "");
  
  // Normalize format (must start with 09)
  if (normalized.startsWith("989") && normalized.length === 12) {
    normalized = "0" + normalized.slice(2);
  } else if (normalized.startsWith("9") && normalized.length === 10) {
    normalized = "0" + normalized;
  }
  
  return normalized;
}
```

### Step 2: Remove sync helpers from `lib/mock-data.ts`

Delete lines 884-911 (the six exported functions at the bottom of the file). Keep the `mockUsers`, `mockBooks`, `mockPublishers`, and `mockListings` data arrays — they may be used by the dev helper on the login page (plan 003 wraps them in `NODE_ENV` check).

### Step 3: Verify

Run:
```bash
npx tsc --noEmit
```

Expected: no type errors. If anything was importing the removed exports, TypeScript will catch it.

Grep to confirm nothing imports the removed items:
```bash
rg "usersList|sessionsMap|listingsList" lib/ app/ components/
rg "from.*mock-data.*getRecentListings|from.*mock-data.*getBundleListings|from.*mock-data.*getSellerListings"
```

Expected: only the `mock-data.ts` file itself and the login page's `import { mockUsers }` should appear.

## Files In Scope

- `lib/auth-store.ts` (strip to just `normalizePhone`)
- `lib/mock-data.ts` (remove bottom 28 lines of sync helpers)

## Files Out of Scope

- `lib/mock-data.ts` data arrays (still used by login page dev helper)
- `lib/data.ts` (the real DB data layer — untouched)

## Maintenance Note

If mock data is needed for testing later, create a `lib/test-utils.ts` with the mock arrays. For now, the login page dev helper is the only consumer.
