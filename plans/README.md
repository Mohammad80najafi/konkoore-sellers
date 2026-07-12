# Improvement Plans

Written against commit `9d48d7a` (2026-07-13).

## Execution Order

| # | Plan | Category | Effort | Depends On |
|---|------|----------|--------|------------|
| 007 | Add listing detail page | Correctness | M | — |
| 008 | Validate prices in createListingAction | Correctness | S | — |
| 009 | Paginate getAllListings | Performance | S | — |
| 010 | Add OTP rate limiting | Security | M | — |
| 011 | Persistent OTP store (MongoDB) | Tech Debt | L | — |
| 012 | Hide seller phone from API responses | Security | S | — |

**Recommended order:** 012 → 008 → 009 → 007 → 010 → 011

Rationale: 012 and 008 are zero-risk single-file fixes. 009 is a small perf win. 007 is the largest feature but safe. 010 and 011 are security hardening that builds on existing OTP code.

## Status

| # | Status |
|---|--------|
| 007 | DONE |
| 008 | DONE |
| 009 | DONE |
| 010 | DONE |
| 011 | DONE |
| 012 | DONE |

## Previous Plans (from 62314dd)

| # | Plan | Status |
|---|------|--------|
| 001 | Authorization guards on server actions | SUPERSEDED |
| 002 | OTP verification (local code store) | SUPERSEDED |
| 003 | Remove mock data from production login | SUPERSEDED |
| 004 | Move prettier-plugin to devDependencies | SUPERSEDED |
| 005 | Remove dead in-memory auth-store code | SUPERSEDED |
| 006 | Deduplicate phone digit normalization | SUPERSEDED |
