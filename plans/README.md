# Improvement Plans

Written against commit `d7c6fad` (2026-07-13).

## Execution Order

| # | Plan | Category | Effort | Depends On |
|---|------|----------|--------|------------|
| 016 | Add quick search to messages page | Feature | S | — |

**Recommended order:** 016

Rationale: Single feature addition, no dependencies.

## Status

| # | Status |
|---|--------|
| 016 | DONE |

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
