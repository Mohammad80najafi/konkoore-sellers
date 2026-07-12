# Plan 015: Custom 404 Page

**Commit:** `01da541` | **Category:** DX | **Effort:** S | **Depends On:** —

## Problem

The app uses Next.js default 404 page — plain white with black text "404". No branding, no navigation, no helpful links. Users who hit a dead end leave the site.

## Scope

Create a custom `not-found.tsx` in the app directory with the site's design system.

**In scope:**
- `app/not-found.tsx` with branded 404 content
- Links back to home and marketplace

**Out of scope:**
- Search functionality on 404 page
- Animated illustrations

## Current State

No `not-found.tsx` exists. Next.js renders its default:
```
404
This page could not be found.
```

## Steps

1. Create `app/not-found.tsx`:
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-100 flex items-center justify-center">
          <span className="text-4xl">📚</span>
        </div>
        <h1 className="text-4xl font-black text-navy-800 mb-3">۴۰۴</h1>
        <h2 className="text-lg font-bold text-surface-700 mb-2">صفحه یافت نشد</h2>
        <p className="text-sm text-surface-500 mb-6">
          صفحه مورد نظر شما وجود ندارد یا منتقل شده است.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-navy-700 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
          >
            صفحه اصلی
          </Link>
          <Link
            href="/marketplace"
            className="px-5 py-2.5 border border-navy-200 text-navy-700 text-sm font-semibold rounded-xl hover:bg-navy-50 transition-colors"
          >
            بازار کتاب
          </Link>
        </div>
      </div>
    </div>
  );
}
```

2. Wrap with ShellLayout in a layout or include header/footer directly. Since `app/layout.tsx` already wraps children, the 404 page inherits the root layout. The ShellLayout approach requires a nested layout — simpler to just include minimal header/footer in the 404 page itself, or rely on the root layout's body styling.

## Verification

```bash
npx next build
# Navigate to /nonexistent-page → custom 404 with branding appears
# Click "صفحه اصلی" → navigates to home
# Click "بازار کتاب" → navigates to marketplace
```

## Maintenance

- If ShellLayout is added to root layout, the 404 page will inherit header/footer automatically
- Update the illustration/text if the brand changes
