# Project Tracker — High-Performance E-Commerce Engine with AI Vector Search

> ⚠️ **This file is modified by AI tooling only.** Do not manually edit task statuses.
> Update progress by closing GitHub Issues or moving cards on the Kanban board.
> AI sync timestamp is appended at each update.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Done |
| `[!]` | Blocked |

---

## Week 1 — Environment Setup and Seed Data Generation

**Branch:** `feature/week-1-setup-and-seed`
**Target Dates:** Day 1–5
**PR:** _pending_

| # | Issue | Status | Commit Ref |
|---|-------|--------|-----------|
| 1 | Initialize monorepo structure (/client and /server) | `[ ]` | — |
| 2 | Configure Express + TypeScript server with ESLint | `[ ]` | — |
| 3 | Configure Vite + React 19 + Tailwind CSS v4 client | `[ ]` | — |
| 4 | Set up MongoDB Atlas connection and Mongoose | `[ ]` | — |
| 5 | Configure ioredis connection singleton | `[ ]` | — |
| 6 | Implement User model and auth routes (register/login) | `[ ]` | — |
| 7 | Write database seeder script (5000 mock products) | `[ ]` | — |
| 8 | Configure .env.example and .gitignore | `[ ]` | — |

**Week 1 Status:** `NOT STARTED`
**CI:** `—`
**PR Merge Date:** `—`

---

## Week 2 — Implementing the Cache-Aside Pattern

**Branch:** `feature/week-2-redis-cache`
**Target Dates:** Day 6–10
**PR:** _pending_

| # | Issue | Status | Commit Ref |
|---|-------|--------|-----------|
| 9  | Implement Product model and CRUD routes | `[ ]` | — |
| 10 | Build cache.service.ts (getCached/setCache/invalidateCache) | `[ ]` | — |
| 11 | Wrap GET /products with Redis Cache-Aside pattern | `[ ]` | — |
| 12 | Implement cache invalidation on product mutations | `[ ]` | — |
| 13 | Add RBAC middleware (admin role enforcement) | `[ ]` | — |
| 14 | Add pagination (page + limit query params) | `[ ]` | — |
| 15 | Write integration tests for cache hit/miss | `[ ]` | — |

**Week 2 Status:** `NOT STARTED`
**CI:** `—`
**PR Merge Date:** `—`

---

## Week 3 — Vector Search and Advanced Mongoose Queries

**Branch:** `feature/week-3-vector-search`
**Target Dates:** Day 11–15
**PR:** _pending_

| # | Issue | Status | Commit Ref |
|---|-------|--------|-----------|
| 16 | Create MongoDB Atlas Vector Search index | `[ ]` | — |
| 17 | Build vector.service.ts (embedding generation) | `[ ]` | — |
| 18 | Implement GET /products/search with $vectorSearch | `[ ]` | — |
| 19 | Cache vector search results in Redis (TTL 120s) | `[ ]` | — |
| 20 | Build cart total aggregation pipeline with discount codes | `[ ]` | — |
| 21 | Implement atomic order creation with inventory decrement | `[ ]` | — |

**Week 3 Status:** `NOT STARTED`
**CI:** `—`
**PR Merge Date:** `—`

---

## Week 4 — React 19 Admin Dashboard and CI/CD

**Branch:** `feature/week-4-dashboard-cicd`
**Target Dates:** Day 16–20
**PR:** _pending_

| # | Issue | Status | Commit Ref |
|---|-------|--------|-----------|
| 22 | Build shell layout (Sidebar + React Router) | `[ ]` | — |
| 23 | Build Dashboard page with stat cards | `[ ]` | — |
| 24 | Build Product List page with CacheBadge | `[ ]` | — |
| 25 | Build Product Form (create + edit with validation) | `[ ]` | — |
| 26 | Build Semantic Search page | `[ ]` | — |
| 27 | Wire TanStack React Query for all API calls | `[ ]` | — |
| 28 | Configure GitHub Actions CI pipeline | `[ ]` | — |
| 29 | Write Dockerfile and .dockerignore | `[ ]` | — |
| 30 | Write README.md with setup instructions | `[ ]` | — |

**Week 4 Status:** `NOT STARTED`
**CI:** `—`
**PR Merge Date:** `—`

---

## Overall Progress

```
Week 1  [░░░░░░░░░░]  0 / 8  issues closed
Week 2  [░░░░░░░░░░]  0 / 7  issues closed
Week 3  [░░░░░░░░░░]  0 / 6  issues closed
Week 4  [░░░░░░░░░░]  0 / 9  issues closed
─────────────────────────────────────────
Total   [░░░░░░░░░░]  0 / 30 issues closed
```

---

## Blockers Log

| Date | Blocker | Resolution | Status |
|------|---------|------------|--------|
| — | — | — | — |

---

## CI Health Log

| Week | Pushes | Passing | Failing | Notes |
|------|--------|---------|---------|-------|
| 1 | 0 | 0 | 0 | — |
| 2 | 0 | 0 | 0 | — |
| 3 | 0 | 0 | 0 | — |
| 4 | 0 | 0 | 0 | — |

---

_Last synced: project initialized — no commits yet_
_Next sync: on first Issue close or PR open_
