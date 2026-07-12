# Improvement Plans

Written against commit `62314dd` (2026-07-13).

## Execution Order

| # | Plan | Category | Effort | Depends On |
|---|------|----------|--------|------------|
| 001 | Authorization guards on server actions | Security | S | — |
| 002 | OTP verification (local code store) | Security | M | — |
| 003 | Remove mock data from production login | Security | S | — |
| 004 | Move prettier-plugin to devDependencies | Correctness | S | — |
| 005 | Remove dead in-memory auth-store code | Tech debt | S | — |
| 006 | Deduplicate phone digit normalization | Tech debt | S | 005 |

**Recommended order:** 004 → 005 → 006 → 003 → 001 → 002

Rationale: 004 and 005 are zero-risk cleanups that reduce noise. 006 depends on 005 (since we keep `normalizePhone` from `auth-store.ts`). 003 is a quick security fix. 001 is the highest-impact security fix. 002 is the largest change and stands alone.

## Status

| # | Status |
|---|--------|
| 001 | TODO |
| 002 | TODO |
| 003 | TODO |
| 004 | TODO |
| 005 | TODO |
| 006 | TODO |
