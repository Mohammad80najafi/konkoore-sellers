# Plan 001: Add Authorization Guards to Server Actions

**Commit:** 62314dd  
**Category:** Security  
**Effort:** S  
**Risk of fix:** Low — additive guards, no logic changes  
**Depends on:** Nothing

## Problem

`updateProfileAction` and `updateListingStatusAction` in `lib/auth-actions.ts` accept a user ID or listing ID from the caller but never verify that the authenticated user owns that resource. Any logged-in user can:
- Edit any user's profile (name, email, location)
- Mark any listing as sold

## Current Code

**`lib/auth-actions.ts:181-208`** — `updateProfileAction`:
```ts
export async function updateProfileAction(
  userId: string,
  data: { name: string; email?: string; province?: string; city?: string }
): Promise<{ success: boolean; user?: UserType; error?: string }> {
  // ...
  const user = await User.findById(userId);
  // No check: is the caller the same user as `userId`?
```

**`lib/auth-actions.ts:211-234`** — `updateListingStatusAction`:
```ts
export async function updateListingStatusAction(
  listingId: string,
  status: "active" | "sold" | "reserved" | "expired" | "pending"
): Promise<{ success: boolean; error?: string }> {
  // ...
  const listing = await Listing.findById(listingId);
  // No check: does listing.seller match the caller?
```

## Plan

### Step 1: Add an `assertAuthenticated` helper

In `lib/auth-actions.ts`, add a helper near the top (after imports) that reads the session cookie and returns the current user ID or throws:

```ts
async function assertAuthenticated(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return user._id;
}
```

### Step 2: Guard `updateProfileAction`

At the start of the function body (after the `name` validation), add:

```ts
const callerId = await assertAuthenticated();
if (callerId !== userId) {
  return { success: false, error: "شما اجازه ویرایش این پروفایل را ندارید." };
}
```

### Step 3: Guard `updateListingStatusAction`

At the start of the function body, add:

```ts
const callerId = await assertAuthenticated();
const listing = await Listing.findById(listingId);
if (!listing) {
  return { success: false, error: "آگهی یافت نشد." };
}
if (listing.seller.toString() !== callerId) {
  return { success: false, error: "شما اجازه ویرایش این آگهی را ندارید." };
}
```

Note: this also removes the duplicate `Listing.findById` call that was further down.

### Step 4: Verify

Run:
```bash
npx tsc --noEmit
```

Expected: no type errors.

Manually test:
1. Log in as user A, try to call `updateProfileAction` with user B's ID → should fail
2. Log in as user A, try to call `updateListingStatusAction` on user B's listing → should fail
3. Log in as user A, update own profile → should succeed
4. Log in as user A, mark own listing as sold → should succeed

## Files In Scope

- `lib/auth-actions.ts` (only file modified)

## Files Out of Scope

- Client components (`DashboardClient.tsx`, `login/page.tsx`) — they already call with the correct IDs
- Other server actions (none exist that are unguarded)

## Maintenance Note

Any future server actions that mutate user or listing data must call `assertAuthenticated()` and verify ownership. Consider extracting this into a middleware pattern if more actions are added.

## Escape Hatch

If `getCurrentUser()` fails unexpectedly (e.g. DB connection issue), the `assertAuthenticated` helper throws and the action returns a generic error. This is acceptable — the catch block already handles it.
