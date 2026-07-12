# Plan 009: Paginate getAllListings

**Commit:** `9d48d7a` | **Category:** Performance | **Effort:** S | **Depends On:** —

## Problem

`getAllListings()` at `lib/data.ts:136-143` loads ALL active listings with no limit. With 1000+ listings this causes:
- High memory usage on server
- Slow initial page load
- MarketplacePage client already paginates (12/page) but receives all data

## Scope

Add pagination to the data fetcher and pass count to marketplace.

**In scope:**
- Modify `getAllListings()` to accept `limit` and `skip` params
- Add a `getListingCount()` function for total count
- Update MarketplacePage to use server-side pagination

**Out of scope:**
- Cursor-based pagination (current offset is fine for this scale)
- Infinite scroll

## Current State

`lib/data.ts:136-143`:
```tsx
export async function getAllListings(): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({ status: "active" })
    .sort({ createdAt: -1 })
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}
```

`app/marketplace/page.tsx`:
```tsx
const listings = await getAllListings();
// passes all to MarketplacePage which client-side filters and paginates
```

## Steps

1. Update `getAllListings` in `lib/data.ts`:
```tsx
export async function getAllListings(limit = 100, skip = 0): Promise<Listing[]> {
  await connectDB();
  const docs = await ListingModel.find({ status: "active" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("seller")
    .lean();
  return docs.map(toListingType);
}

export async function getActiveListingCount(): Promise<number> {
  await connectDB();
  return ListingModel.countDocuments({ status: "active" });
}
```

2. Update `app/marketplace/page.tsx` to fetch first page:
```tsx
const [listings, totalCount] = await Promise.all([
  getAllListings(100),
  getActiveListingCount(),
]);
```

3. Pass `totalCount` to `MarketplacePage` so the client knows the total.

## Verification

```bash
npx next build
# Verify marketplace loads and pagination works
# Check network tab: initial load should be faster
```

## Maintenance

- When filters move server-side, this becomes the foundation
- Adjust the 100 limit based on typical usage
