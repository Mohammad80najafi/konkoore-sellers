# Plan 003: Remove Mock Data from Production Login Page

**Commit:** 62314dd  
**Category:** Security  
**Effort:** S  
**Risk of fix:** Low — removing UI elements  
**Depends on:** Nothing

## Problem

`app/auth/login/page.tsx` imports `mockUsers` from `lib/mock-data.ts` and renders them in a clickable developer-helper section (lines 499-523). In production, this:
- Leaks test phone numbers (even if partially masked)
- Could assist account enumeration
- Confuses real users

## Current Code

**`app/auth/login/page.tsx:9`**:
```ts
import { mockUsers } from "@/lib/mock-data";
```

**`app/auth/login/page.tsx:499-523`** — the developer helper section:
```tsx
{/* Collapsible Developer Helper */}
<div className="mt-8 w-full max-w-md animate-slide-up">
  <details className="...">
    <summary>🛠️ راهنمای توسعه‌دهنده (تست ورود و ثبت‌نام)</summary>
    <div className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-1">
      {mockUsers.map((user) => (
        <div onClick={() => handleSelectMockUser(user.phone || "")} ...>
```

## Plan

### Step 1: Wrap the developer helper in a dev-only check

Replace the developer helper section (lines 499-523) with:

```tsx
{process.env.NODE_ENV === "development" && (
  <div className="mt-8 w-full max-w-md animate-slide-up">
    <details className="bg-white/80 backdrop-blur-sm border border-surface-200/80 rounded-2xl p-4 shadow-sm cursor-pointer group">
      <summary className="text-xs font-semibold text-surface-600 select-none flex items-center justify-between">
        <span>🛠️ راهنمای توسعه‌دهنده (تست ورود و ثبت‌نام)</span>
        <span className="text-[10px] text-surface-400 transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="mt-4 space-y-2 max-h-44 overflow-y-auto pr-1">
        <p className="text-[11px] text-surface-500 leading-relaxed mb-2">
          <strong>تست ورود:</strong> روی یکی از کاربران زیر کلیک کنید تا شماره آن‌ها وارد شده و فرآیند ورود شبیه‌سازی شود.<br />
          <strong>تست ثبت‌نام:</strong> یک شماره جدید فرضی وارد کنید.
        </p>
        {mockUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleSelectMockUser(user.phone || "")}
            className="p-2.5 bg-surface-50 hover:bg-navy-50/50 border border-surface-100 hover:border-navy-200/50 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer"
          >
            <span className="font-semibold text-surface-700">{user.name}</span>
            <span className="font-mono text-surface-500 font-semibold">{user.phone}</span>
          </div>
        ))}
      </div>
    </details>
  </div>
)}
```

The `import { mockUsers }` stays — it's only used inside the dev guard now. Tree-shaking will strip it from production builds.

### Step 2: Verify

Run:
```bash
npx tsc --noEmit
npx next build
```

Expected: no errors. In the production build output, confirm the mock user section is not included in the bundle.

Manual test:
- `NODE_ENV=development` → developer helper visible
- `NODE_ENV=production` → developer helper hidden

## Files In Scope

- `app/auth/login/page.tsx` (wrap existing section in `NODE_ENV` check)

## Files Out of Scope

- `lib/mock-data.ts` (still used by other dev tooling if any; plan 005 addresses dead code separately)

## Maintenance Note

If the dev helper needs to be available in preview/staging environments, change the condition to check for a custom env var like `NEXT_PUBLIC_SHOW_DEV_HELPER` instead of `NODE_ENV`.
