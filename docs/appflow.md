# Application Flow — High-Performance E-Commerce Engine with AI Vector Search

**Project:** Infotact Internship — Project 2

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│              React 19 + Vite + Tailwind CSS v4                  │
│         Admin Dashboard │ Product Search │ Auth Pages           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS / REST (Axios)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                            │
│              Node.js + Express.js + TypeScript                  │
│     Auth Middleware → RBAC Middleware → Route Controllers       │
└──────────┬─────────────────────────────────────┬───────────────┘
           │                                     │
           ▼                                     ▼
┌──────────────────┐                  ┌──────────────────────────┐
│   REDIS LAYER    │                  │      MONGODB LAYER       │
│  Cache-Aside     │                  │  Mongoose + Atlas        │
│  Session Store   │                  │  Vector Search Index     │
│  TTL Management  │                  │  Aggregation Pipelines   │
└──────────────────┘                  └──────────────────────────┘
```

---

## 2. Authentication Flow

```
User Submits Login Form
         │
         ▼
POST /api/auth/login
         │
         ▼
Validate email exists in MongoDB
         │
    ┌────┴────┐
  NOT FOUND  FOUND
    │          │
    ▼          ▼
  401        bcrypt.compare(password, hash)
               │
         ┌─────┴──────┐
       MISMATCH     MATCH
         │             │
         ▼             ▼
        401       Sign JWT (payload: { id, role })
                       │
                       ▼
                 Return { token, user }
                       │
                       ▼
          Client stores token in localStorage
                       │
                       ▼
          Axios interceptor attaches Bearer token
          to all subsequent requests
```

---

## 3. Product Catalog Flow (Cache-Aside Pattern)

```
GET /api/products
         │
         ▼
auth.middleware.ts (public route — skip auth)
         │
         ▼
product.controller.ts
         │
         ▼
cache.service.ts → Redis GET "products:all"
         │
    ┌────┴─────┐
  HIT          MISS
    │             │
    ▼             ▼
Return JSON    MongoDB.find() with Mongoose
(< 5ms)             │
                    ▼
              Redis SET "products:all"
              TTL = 300 seconds
                    │
                    ▼
              Return JSON to client
```

---

## 4. Admin Product Update Flow (Cache Invalidation)

```
Admin submits edit form in React Dashboard
         │
         ▼
PUT /api/products/:id
         │
         ▼
auth.middleware.ts → verify JWT
         │
         ▼
rbac.middleware.ts → check role === "admin"
         │
    ┌────┴────┐
  FAIL       PASS
    │           │
    ▼           ▼
   403     Validate request body
               │
               ▼
          MongoDB findByIdAndUpdate()
               │
               ▼
          Redis DEL "products:<id>"
          Redis DEL "products:all"
               │
               ▼
          Return updated product
               │
               ▼
    React Query invalidates cache
    → Dashboard table auto-refreshes
```

---

## 5. Semantic Search Flow (Vector Search)

```
User types "warm winter jackets" in search bar
         │
         ▼
GET /api/products/search?q=warm+winter+jackets
         │
         ▼
Check Redis for "search:<md5_of_query>"
         │
    ┌────┴─────┐
  HIT          MISS
    │             │
    ▼             ▼
Return cached  vector.service.ts
results             │
                    ▼
          Generate embedding vector
          via OpenAI text-embedding-3-small
          (or mock embedding for dev)
                    │
                    ▼
          MongoDB $vectorSearch aggregation
          {
            index: "product_vector_index",
            path: "embedding",
            queryVector: [...],
            numCandidates: 100,
            limit: 10
          }
                    │
                    ▼
          Ranked results by cosine similarity
                    │
                    ▼
          Redis SET "search:<hash>" TTL=120s
                    │
                    ▼
          Return results to client
```

---

## 6. Cart Total Calculation Flow

```
POST /api/cart/total
Body: { items: [{ productId, qty }], discountCode }
         │
         ▼
auth.middleware.ts → verify JWT (user or admin)
         │
         ▼
cart.controller.ts
         │
         ▼
MongoDB Aggregation Pipeline:
  Stage 1: $match product IDs
  Stage 2: $lookup from Products
  Stage 3: $unwind
  Stage 4: $group → subtotal per item
  Stage 5: $project → apply discount code logic
  Stage 6: $group → grand total
         │
         ▼
Return { items, subtotal, discount, total }
```

---

## 7. Order Creation Flow (Atomic Inventory Decrement)

```
POST /api/orders
Body: { items: [{ productId, qty }] }
         │
         ▼
auth.middleware.ts → verify JWT
         │
         ▼
order.controller.ts
         │
         ▼
MongoDB Session (Transaction):
  Step 1: For each item, findOneAndUpdate
          { _id: productId, stock: { $gte: qty } }
          { $inc: { stock: -qty } }
          → If any item fails → throw (insufficient stock)
  Step 2: Create Order document
  Step 3: Commit transaction
         │
    ┌────┴────┐
  FAIL       PASS
    │           │
    ▼           ▼
 Rollback    Invalidate product cache keys
 → 400        → Return order confirmation
```

---

## 8. Database Seeder Flow

```
npm run seed (ts-node scripts/seed.ts)
         │
         ▼
Connect to MongoDB
         │
         ▼
Generate N=5000 mock products using faker.js
Each product:
  - name, description, price, category, stock
  - Generate embedding vector (768-dim mock array)
         │
         ▼
Product.insertMany(products, { ordered: false })
         │
         ▼
Log: "Seeded 5000 products successfully"
         │
         ▼
Disconnect
```

---

## 9. CI/CD Flow (GitHub Actions)

```
git push origin feature/week-N-<feature>
         │
         ▼
GitHub Actions triggers: main.yml
         │
         ▼
┌──────────────────────────────────┐
│  Job: build-and-lint             │
│  1. Checkout code                │
│  2. Setup Node.js 22             │
│  3. npm ci (server)              │
│  4. tsc --noEmit (type check)    │
│  5. eslint ./src                 │
│  6. npm ci (client)              │
│  7. npm run build (client)       │
└──────────────────────────────────┘
         │
    ┌────┴────┐
  FAIL       PASS
    │           │
    ▼           ▼
 PR blocked  Green checkmark
 from merge  → PR can be merged
```

---

## 10. GitHub Branching and PR Flow

```
Week starts
    │
    ▼
Create branch: feature/week-N-<feature-name>
    │
    ▼
Create GitHub Issues for that week's tasks
    │
    ▼
Daily commits (3–5 per day):
  "feat: implement cache-aside for products API (fixes #4)"
    │
    ▼
CI runs automatically on every push
    │
    ▼
End of week:
  Open PR → main
  PR description: "Week N — <architecture summary>"
    │
    ▼
Manager reviews PR (timestamps audited)
    │
    ▼
Merge PR → main
    │
    ▼
Next week: new branch off main
```
