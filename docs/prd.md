# PRD — High-Performance E-Commerce Engine with AI Vector Search

**Program:** Infotact Technical Internship — SDE (MERN Track)
**Project:** Project 2
**Location:** Bengaluru, Karnataka
**Duration:** 4 Weeks
**Status:** `active`

---

## 1. Executive Summary

Traditional e-commerce search systems rely on exact string matching, which fails to capture user intent for complex or conceptual queries. Additionally, querying the database on every product page load causes severe degradation during high-traffic events.

This project addresses both problems:
- **Performance:** Implement a Redis Cache-Aside Pattern to achieve sub-50ms response times and reduce direct MongoDB hits.
- **Intelligence:** Implement MongoDB Native Vector Search to deliver AI-powered, semantic product discovery.

The deliverable is a fully functional E-Commerce REST API paired with a React 19 Admin Dashboard, deployed using Docker and validated via a GitHub Actions CI/CD pipeline.

---

## 2. Problem Statements

| # | Problem | Impact |
|---|---------|--------|
| P1 | Exact-match search fails for queries like "warm winter jackets" | Poor discovery, lost conversions |
| P2 | Every product page triggers a full MongoDB query | High latency, server instability under load |
| P3 | Cache invalidation is absent; stale data is served post-update | Data inconsistency for end customers |
| P4 | No admin interface for inventory and pricing management | Manual DB edits, error-prone operations |

---

## 3. Goals and Non-Goals

### Goals
- Achieve sub-50ms response times for cached product catalog queries
- Reduce direct MongoDB cluster hits by implementing the Cache-Aside Pattern with Redis
- Enable semantic/conceptual product search using MongoDB vector embeddings
- Provide a secure React 19 Admin Dashboard for product and inventory management
- Automate cache invalidation on product updates
- Establish a CI/CD pipeline via GitHub Actions
- Containerize the backend with Docker

### Non-Goals
- Payment gateway integration (Stripe, Razorpay, etc.)
- Customer-facing checkout flow
- Mobile application
- Multi-tenant / multi-store support
- Real-time inventory sync across warehouses

---

## 4. User Personas

### 4.1 End Customer
| Attribute | Detail |
|-----------|--------|
| Primary Need | Fast page loads + smart product discovery |
| Key Workflow | Searches "warm winter jackets" → receives semantically matched results instantly from Redis cache |
| Pain Point | Irrelevant results from exact-match search; slow load times |

### 4.2 Store Admin
| Attribute | Detail |
|-----------|--------|
| Primary Need | Inventory management and accurate cache state |
| Key Workflow | Updates product price via React dashboard → backend auto-invalidates the stale Redis cache key |
| Pain Point | Manual DB edits without a UI; stale data served to customers after updates |

---

## 5. Functional Requirements

### 5.1 Product Catalog API
- `GET /api/products` — Returns paginated product list; checks Redis first, falls back to MongoDB
- `GET /api/products/:id` — Returns single product; Redis-cached per product ID
- `POST /api/products` — Admin only; creates product and invalidates `products:all` cache key
- `PUT /api/products/:id` — Admin only; updates product and invalidates relevant cache keys
- `DELETE /api/products/:id` — Admin only; soft-deletes product and purges cache

### 5.2 Semantic Search API
- `GET /api/products/search?q=<query>` — Performs vector embedding search using MongoDB Atlas Vector Search
- Query is embedded at runtime and compared against stored product embeddings
- Returns ranked results by semantic similarity score

### 5.3 Cart & Order API
- `POST /api/cart/total` — Aggregation pipeline calculates dynamic cart total with discount codes
- `POST /api/orders` — Creates order and decrements inventory atomically

### 5.4 Authentication & Authorization
- `POST /api/auth/register` — Customer registration (JWT issued)
- `POST /api/auth/login` — Login with bcrypt password validation (JWT issued)
- Admin routes protected via RBAC middleware (`role: admin`)

### 5.5 Admin Dashboard (React 19)
- Product listing table with edit/delete actions
- Create/edit product form (name, description, price, category, stock)
- Cache status indicator (cache hit/miss per product)
- Search interface for semantic search testing

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Cached endpoints respond in < 50ms |
| Scalability | Redis decouples DB load; backend is stateless |
| Security | JWT authentication, bcrypt password hashing, CORS configured |
| Reliability | Cache invalidation ensures data consistency post-update |
| Maintainability | TypeScript strict mode across frontend and backend |
| Observability | GitHub Actions CI log provides build and lint history |
| Portability | Backend containerized via Dockerfile with `.dockerignore` |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Cached response time | < 50ms |
| Cache hit rate (after warm-up) | > 80% for repeated product queries |
| MongoDB direct hits (cached routes) | Near-zero after first request |
| GitHub Actions CI | Passes on every push throughout all 4 weeks |
| Commit cadence | 3–5 commits per active development day |

---

## 8. Constraints and Assumptions

- **TypeScript is non-negotiable** across both client and server
- MongoDB Atlas is assumed to support Vector Search (Atlas M10+ cluster or local with mock embeddings)
- Redis is run locally via Docker during development
- Interns may not push directly to `main` — all work occurs on feature branches
- **Evaluation requires 4 continuous weeks of GitHub commits** — monolithic final-week pushes result in disqualification

---

## 9. Out-of-Scope for MVP (Future Iterations)

- Real-time inventory via WebSockets
- Product image upload (S3 / Cloudinary)
- Customer review and rating system
- Multi-currency and localization support
- Elasticsearch as a search alternative
