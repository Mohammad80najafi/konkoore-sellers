# Plan 013: Save Images in createListingAction

**Commit:** `01da541` | **Category:** Correctness | **Effort:** S | **Depends On:** —

## Problem

The create-listing form collects up to 8 images as base64 data URLs, but `createListingAction` doesn't accept or save them. Images are silently lost after submission. Users think they uploaded photos but the listing has none.

## Scope

Pass images from the form to the server action and save them in the listing document.

**In scope:**
- Add `images` parameter to `createListingAction`
- Save images array in the Listing document
- Pass images from form to action

**Out of scope:**
- Image upload to external storage (S3/Cloudinary) — base64 is fine for now
- Image compression/resizing
- Image validation (size, type) — already handled client-side

## Current State

`components/create-listing/CreateListingForm.tsx:82-107`:
```tsx
const result = await createListingAction({
  title: title.trim(),
  author: author.trim(),
  // ... other fields
  // images NOT passed
});
```

`lib/auth-actions.ts:375-399`:
```tsx
const listing = await Listing.create({
  book: { ... },
  seller: sellerId,
  // images array not included
  images: [],  // always empty
});
```

## Steps

1. Add `images` to the `createListingAction` parameter type in `lib/auth-actions.ts`:
```tsx
images?: { url: string; alt: string; isPrimary: boolean }[];
```

2. Include images in the `Listing.create()` call:
```tsx
images: data.images?.map((img, i) => ({
  url: img.url,
  alt: img.alt || "",
  isPrimary: i === 0,
})) || [],
```

3. Pass images in `CreateListingForm.tsx` `handleSubmit`:
```tsx
const result = await createListingAction({
  // ... existing fields
  images: images.map((url, i) => ({ url, alt: `${title} - ${i + 1}`, isPrimary: i === 0 })),
});
```

4. Add `title` to the dependency for alt text (already available in scope).

## Verification

```bash
npx next build
# Create a listing with 3 images → check MongoDB → images array has 3 entries
# View listing detail page → images display in gallery
```

## Maintenance

- When image storage moves to S3, replace base64 URLs with S3 URLs
- Consider adding image count limit in DB schema validation
