# Plan 012: Hide Seller Phone from API Responses

**Commit:** `9d48d7a` | **Category:** Security | **Effort:** S | **Depends On:** —

## Problem

`lib/data.ts:32` returns `sellerDoc.phone` in listing API responses. Phone numbers are PII and should not be exposed to buyers browsing the marketplace. Only the seller themselves (or an admin) should see their phone.

## Scope

Strip phone from seller data in the `toListingType` converter.

**In scope:**
- Remove `phone` from the seller object in `toListingType`
- Ensure no other endpoints leak phone numbers

**Out of scope:**
- Messaging system (for contact between buyer/seller)
- Phone display on dashboard (seller sees their own phone — that's fine)

## Current State

`lib/data.ts:28-55`:
```tsx
seller: isPopulated
  ? {
      _id: sellerDoc._id.toString(),
      name: sellerDoc.name,
      phone: sellerDoc.phone,  // ← EXPOSED
      avatar: sellerDoc.avatar,
      role: sellerDoc.role,
      // ...
    }
  : {
      _id: String(sellerDoc),
      name: "فروشنده",
      // ...
    },
```

## Steps

1. Remove `phone: sellerDoc.phone` from the populated seller branch in `lib/data.ts`:
```tsx
seller: isPopulated
  ? {
      _id: sellerDoc._id.toString(),
      name: sellerDoc.name,
      // phone removed — PII not exposed to buyers
      avatar: sellerDoc.avatar,
      role: sellerDoc.role,
      isVerified: sellerDoc.isVerified,
      createdAt: sellerDoc.createdAt instanceof Date
        ? sellerDoc.createdAt.toISOString()
        : String(sellerDoc.createdAt),
      province: sellerDoc.province,
      city: sellerDoc.city,
      rating: sellerDoc.rating,
      totalSales: sellerDoc.totalSales,
      totalPurchases: sellerDoc.totalPurchases,
    }
  : { /* unchanged */ },
```

2. Verify `User` type in `lib/types.ts` — `phone` should remain optional (it is: `phone?: string`). No type change needed.

3. Check `getSellerListings` in `lib/auth-actions.ts:279-311` — this is used by the seller's own dashboard, so phone should stay there. No change needed (it already returns the raw doc, not through `toListingType`).

## Verification

```bash
npx next build
# Browse marketplace → check network tab → seller objects should have no "phone" field
# Dashboard → seller's own listings → phone visible (own data, fine)
```

## Maintenance

- When messaging is added, contact happens through the app, not by exposing phone
- If phone is needed for a specific feature, add a dedicated endpoint with auth check
