# Plan 004: Move prettier-plugin-tailwindcss to devDependencies

**Commit:** 62314dd  
**Category:** Correctness  
**Effort:** S  
**Risk of fix:** None  
**Depends on:** Nothing

## Problem

`prettier-plugin-tailwindcss` is listed in `dependencies` (line 16 of `package.json`) but it's a dev-time formatting tool — it should be in `devDependencies`.

## Current Code

**`package.json:14-18`**:
```json
"dependencies": {
  "mongoose": "^9.7.4",
  "next": "16.2.10",
  "prettier-plugin-tailwindcss": "^0.8.0",
  "react": "19.2.4",
```

## Plan

### Step 1: Move the dependency

Run:
```bash
npm install --save-dev prettier-plugin-tailwindcss
```

This removes it from `dependencies` and adds it to `devDependencies`.

### Step 2: Verify

Run:
```bash
npx tsc --noEmit
npm ls prettier-plugin-tailwindcss
```

Expected: listed under `devDependencies`, not `dependencies`.

## Files In Scope

- `package.json` (auto-modified by npm)
- `package-lock.json` (auto-updated)

## Files Out of Scope

- Nothing — this is a one-command fix.
