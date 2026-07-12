# Plan 007: Add Listing Detail Page

**Commit:** `9d48d7a` | **Category:** Correctness | **Effort:** M | **Depends On:** —

## Problem

GridCard and ListCard components link to `/listing/${listing._id}` but no such route exists. Users clicking a listing see a 404.

## Scope

Create `app/listing/[id]/page.tsx` that displays full listing details.

**In scope:**
- New route `app/listing/[id]/page.tsx`
- Server component that fetches listing by ID
- Client component for the detail view

**Out of scope:**
- Image gallery (no upload yet)
- Buy/checkout flow
- Related listings

## Current State

GridCard at `components/marketplace/MarketplacePage.tsx:289`:
```tsx
<Link href={`/listing/${listing._id}`}>
```

ListCard at `components/marketplace/MarketplacePage.tsx:354`:
```tsx
<Link href={`/listing/${listing._id}`}>
```

Data fetcher at `lib/data.ts:129`:
```tsx
export async function getListingById(id: string): Promise<Listing | null> {
  await connectDB();
  const doc = await ListingModel.findById(id).populate("seller").lean();
  if (!doc) return null;
  return toListingType(doc);
}
```

## Steps

1. Create `app/listing/[id]/layout.tsx`:
```tsx
import ShellLayout from "@/components/layout/ShellLayout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShellLayout>{children}</ShellLayout>;
}
```

2. Create `app/listing/[id]/page.tsx` as a server component:
- Import `getListingById` from `@/lib/data`
- Import `notFound` from `next/navigation`
- Call `getListingById(params.id)`, return `notFound()` if null
- Pass listing to a client component `ListingDetailClient`

3. Create `components/listing/ListingDetailClient.tsx`:
- Receive `listing: Listing` as prop
- Display: title, author, publisher, field/grade badges
- Condition badge with description
- Price section (original, selling, discount %)
- Location (city, province)
- Shipping options
- Seller info card (name, rating, city)
- Description section
- Back button to marketplace

## Verification

```bash
npx next build
# Expect: /listing/[id] appears in route table
# Navigate to /listing/<any-id-from-seed> — page renders without error
```

## Maintenance

- When image upload is added, extend the gallery section
- When buy flow is added, add CTA button to the detail page
