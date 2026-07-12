# Improvement Plans

Written against commit `01da541` (2026-07-13).

## Execution Order

| # | Plan | Category | Effort | Depends On |
|---|------|----------|--------|------------|
| 013 | Save images in createListingAction | Correctness | S | — |
| 014 | Deduplicate province/city data | Tech Debt | S | — |
| 015 | Custom 404 page | DX | S | — |

**Recommended order:** 013 → 014 → 015

Rationale: 013 is a critical bug fix (images lost). 014 is a quick cleanup. 015 is a nice-to-have polish.

## Status

| # | Status |
|---|--------|
| 013 | DONE |
| 014 | DONE |
| 015 | DONE |

## Previous Plans

| # | Plan | Status |
|---|------|--------|
| 007 | Add listing detail page | DONE |
| 008 | Validate prices in createListingAction | DONE |
| 009 | Paginate getAllListings | DONE |
| 010 | Add OTP rate limiting | DONE |
| 011 | Persistent OTP store (MongoDB) | DONE |
| 012 | Hide seller phone from API responses | DONE |

## Considered and Rejected

| Finding | Reason |
|---------|--------|
| generateMetadata double-fetch | Low impact, Next.js caching handles this |
| Year validation approximate conversion | Off by ~1 day at most, acceptable for book listings |
| No input length validation | Client-side limits sufficient for this scale |
