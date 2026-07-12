# Plan 014: Deduplicate Province/City Data

**Commit:** `01da541` | **Category:** Tech Debt | **Effort:** S | **Depends On:** —

## Problem

`DashboardClient.tsx` hardcodes a `PROVINCE_CITIES` object with different city lists than `lib/constants.ts`. This creates two sources of truth — cities in the dashboard don't match cities in the marketplace filters or create-listing form.

## Scope

Import provinces/cities from `lib/constants.ts` in DashboardClient and remove the hardcoded duplicate.

**In scope:**
- Remove `PROVINCE_CITIES` from DashboardClient
- Import `PROVINCES` from constants
- Build city list dynamically from the selected province

**Out of scope:**
- Adding more cities to constants
- Restructuring the province data model

## Current State

`app/dashboard/DashboardClient.tsx:14-23`:
```tsx
const PROVINCE_CITIES: Record<string, string[]> = {
  "تهران": ["تهران", "ری", "کرج", "ورامین", "شهریار", "قدس", "پاکدشت"],
  "اصفهان": ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر", "فولادشهر"],
  // ... 8 provinces with different cities than constants
};
```

`lib/constants.ts:166-227`:
```tsx
export const PROVINCES = [
  { id: "tehran", name: "تهران", cities: ["تهران", "شهریار", "اسلامشهر", "ورامین", "پاکدشت", "ری"] },
  { id: "isfahan", name: "اصفهان", cities: ["اصفهان", "کاشان", "نجف‌آباد", "خمینی‌شهر"] },
  // ... 12 provinces with canonical city lists
];
```

## Steps

1. Remove the `PROVINCE_CITIES` constant from `DashboardClient.tsx` (lines 14-23).

2. Add import at the top of `DashboardClient.tsx`:
```tsx
import { PROVINCES } from "@/lib/constants";
```

3. Add a derived cities variable inside the component:
```tsx
const selectedProvinceData = PROVINCES.find((p) => p.name === selectedProvince);
const cities = selectedProvinceData?.cities || [];
```

4. Update the city select options to use the dynamic `cities` variable (already does — just need to remove the old constant).

## Verification

```bash
npx next build
# Dashboard profile edit → select province → cities dropdown updates
# Create listing → select same province → same cities appear
# Marketplace filter → select same province → same cities appear
```

## Maintenance

- All province/city data now lives in one place (`lib/constants.ts`)
- Adding cities only requires editing constants
