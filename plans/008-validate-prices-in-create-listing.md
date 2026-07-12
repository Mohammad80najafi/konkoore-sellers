# Plan 008: Validate Prices in createListingAction

**Commit:** `9d48d7a` | **Category:** Correctness | **Effort:** S | **Depends On:** —

## Problem

`createListingAction` accepts any numeric price without validation:
- Price can be negative
- Price can exceed originalPrice (illogical)
- Price can be unreasonably high (data entry error)
- No minimum price (free listings aren't allowed but not enforced)

## Scope

Add server-side validation in `lib/auth-actions.ts` inside `createListingAction`.

**In scope:**
- Price range validation (1,000 – 50,000,000 tomans)
- Price vs originalPrice comparison
- Clear Persian error messages

**Out of scope:**
- Client-side validation (already has input type=number)
- Auto price suggestion feature

## Current State

`lib/auth-actions.ts:318-325`:
```tsx
const listing = await Listing.create({
  // ...
  price: data.price,
  originalPrice: data.originalPrice,
  // ...
});
```

No validation before the create call.

## Steps

1. Add validation after `const sellerId = await assertAuthenticated();` and before `const listing = await Listing.create(...)`:

```tsx
if (!data.price || data.price < 1000) {
  return { success: false, error: "قیمت فروش باید حداقل ۱,۰۰۰ تومان باشد." };
}
if (data.price > 50000000) {
  return { success: false, error: "قیمت فروش نمی‌تواند بیش از ۵۰ میلیون تومان باشد." };
}
if (!data.originalPrice || data.originalPrice < 1000) {
  return { success: false, error: "قیمت نو کتاب باید حداقل ۱,۰۰۰ تومان باشد." };
}
if (data.price > data.originalPrice) {
  return { success: false, error: "قیمت فروش نمی‌تواند بیشتر از قیمت نو باشد." };
}
```

2. Add validation for year:
```tsx
const currentYear = new Date().getFullYear();
const iranYear = currentYear - 621; // approximate solar year
if (data.year < 1380 || data.year > iranYear + 1) {
  return { success: false, error: "سال چاپ معتبر نیست." };
}
```

## Verification

```bash
npx next build
# Test with curl or client: submit price=-100 → error
# Submit price=999999999 → error
# Submit price=originalPrice+1 → error
```

## Maintenance

- If free listings are ever allowed, adjust the minimum
- If currency changes, update the limits
