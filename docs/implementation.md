# Implementation Roadmap — High-Performance E-Commerce Engine with AI Vector Search

**Project:** Infotact Internship — Project 2
**Duration:** 4 Weeks
**Evaluation Rule:** All 4 weeks must have continuous GitHub commits. Monolithic final-week pushes = disqualification.

---

## Pre-Week Checklist (Before Day 1)

- [ ] Install Node.js 22 LTS, Git, Docker Desktop
- [ ] Create GitHub repository: `infotact-ecommerce-engine`
- [ ] Set up MongoDB Atlas account (M0 free tier or M10+ for vector search)
- [ ] Set up Redis locally via Docker: `docker run -d -p 6379:6379 redis:7-alpine`
- [ ] Create GitHub Projects Kanban board (columns: To Do / In Progress / Done)
- [ ] Open all Week 1 Issues before writing a single line of code

---

## Week 1 — Environment Setup and Seed Data Generation

**Branch:** `feature/week-1-setup-and-seed`
**GitHub Milestone:** `Week 1 — Foundation`

### GitHub Issues to Open
- [ ] `Issue #1` — Initialize monorepo structure (/client and /server)
- [ ] `Issue #2` — Configure Express + TypeScript server with ESLint
- [ ] `Issue #3` — Configure Vite + React 19 + Tailwind CSS v4 client
- [ ] `Issue #4` — Set up MongoDB Atlas connection and Mongoose
- [ ] `Issue #5` — Configure Redis (ioredis) connection singleton
- [ ] `Issue #6` — Implement User model and auth routes (register/login)
- [ ] `Issue #7` — Write database seeder script (5000 mock products)
- [ ] `Issue #8` — Configure .env files and .gitignore

### Day-by-Day Plan

**Day 1 — Monorepo Scaffold**
```bash
mkdir infotact-ecommerce-engine && cd $_
git init
mkdir client server

# Server setup
cd server
npm init -y
npm install express mongoose ioredis jsonwebtoken bcrypt dotenv cors
npm install -D typescript @types/node @types/express ts-node-dev eslint

# Client setup
cd ../client
npm create vite@latest . -- --template react-ts
npm install
npm install -D @tailwindcss/vite
```

**Day 2 — Server Configuration**

`server/src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes (add as implemented)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
```

**Day 3 — Tailwind v4 + Vite Client Config**

`client/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`client/src/index.css`:
```css
@import "tailwindcss";
```

**Day 4 — Auth Routes and User Model**

Implement `User.model.ts`, `auth.controller.ts`, `auth.routes.ts`, `auth.middleware.ts`.

**Day 5 — Database Seeder**

`server/src/scripts/seed.ts`:
```typescript
import { faker } from '@faker-js/faker';
import { connectDB } from '../config/db';
import { Product } from '../models/Product.model';

const SEED_COUNT = 5000;

async function seed() {
  await connectDB();
  await Product.deleteMany({});

  const products = Array.from({ length: SEED_COUNT }, () => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 199, max: 9999 })),
    category: faker.helpers.arrayElement(['Apparel', 'Footwear', 'Electronics', 'Home', 'Sports']),
    stock: faker.number.int({ min: 0, max: 500 }),
    isActive: true,
    embedding: Array.from({ length: 1536 }, () => Math.random() * 2 - 1),
  }));

  await Product.insertMany(products, { ordered: false });
  console.log(`✅ Seeded ${SEED_COUNT} products`);
  process.exit(0);
}

seed().catch(console.error);
```

### Week 1 Commit Message Examples
```
feat: initialize monorepo structure with /client and /server (fixes #1)
feat: configure Express + TypeScript server with ESLint (fixes #2)
feat: add Vite + React 19 + Tailwind CSS v4 client setup (fixes #3)
feat: connect Mongoose to MongoDB Atlas (fixes #4)
feat: configure ioredis singleton with reconnect handling (fixes #5)
feat: implement User model with bcrypt and JWT auth routes (fixes #6)
feat: write database seeder for 5000 mock products (fixes #7)
chore: add .env.example and .gitignore (fixes #8)
```

### Week 1 PR Description Template
```markdown
## Week 1 — Environment Setup and Seed Data Generation

### Summary
- Monorepo initialized with /client (Vite+React 19+Tailwind v4) and /server (Express+TypeScript)
- MongoDB Atlas connected via Mongoose
- Redis (ioredis) singleton configured
- JWT + bcrypt authentication implemented
- 5000 mock products seeded into MongoDB

### Architecture Decisions
- ioredis chosen over node-redis for TypeScript support and retry strategies
- Seeder generates mock 1536-dim embedding vectors (replaced with real OpenAI calls in Week 3)

### CI Status
- [x] GitHub Actions lint + build passing
```

---

## Week 2 — Implementing the Cache-Aside Pattern

**Branch:** `feature/week-2-redis-cache`
**GitHub Milestone:** `Week 2 — Performance`

### GitHub Issues to Open
- [ ] `Issue #9` — Implement Product model and CRUD routes
- [ ] `Issue #10` — Build cache.service.ts (Cache-Aside abstraction)
- [ ] `Issue #11` — Wrap GET /products with Redis caching
- [ ] `Issue #12` — Implement cache invalidation on product mutations
- [ ] `Issue #13` — Add RBAC middleware for admin-only routes
- [ ] `Issue #14` — Implement pagination for product listing
- [ ] `Issue #15` — Write integration tests for cache hit/miss

### Key Implementation — cache.service.ts

```typescript
// server/src/services/cache.service.ts
import redis from '../config/redis';

export async function getCached<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function setCache(key: string, value: unknown, ttl = 300): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length > 0) await redis.del(...keys);
}
```

### Key Implementation — Product Controller with Cache-Aside

```typescript
// server/src/controllers/product.controller.ts
export const getProducts = async (req: Request, res: Response) => {
  const CACHE_KEY = 'products:all';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  // Step 1: Check Redis
  const cached = await getCached<IProduct[]>(CACHE_KEY);
  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  // Step 2: Query MongoDB
  const products = await Product.find({ isActive: true })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Step 3: Store in Redis
  await setCache(CACHE_KEY, products, 300);

  return res.json({ source: 'database', data: products });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Invalidate cache
  await invalidateCache(`products:${id}`, 'products:all');

  return res.json(product);
};
```

### Week 2 Commit Message Examples
```
feat: implement Product model with TypeScript interfaces (fixes #9)
feat: build cache.service.ts with getCached/setCache/invalidateCache (fixes #10)
feat: wrap GET /products with Redis Cache-Aside pattern (fixes #11)
feat: implement cache invalidation on PUT and DELETE product routes (fixes #12)
feat: add RBAC middleware enforcing admin role on mutation routes (fixes #13)
feat: add pagination to product listing (page, limit query params) (fixes #14)
test: add integration tests verifying cache hit and miss behavior (fixes #15)
```

---

## Week 3 — Vector Search and Advanced Mongoose Queries

**Branch:** `feature/week-3-vector-search`
**GitHub Milestone:** `Week 3 — Intelligence`

### GitHub Issues to Open
- [ ] `Issue #16` — Create MongoDB Atlas Vector Search index
- [ ] `Issue #17` — Build vector.service.ts (embedding generation)
- [ ] `Issue #18` — Implement GET /products/search with $vectorSearch
- [ ] `Issue #19` — Cache vector search results in Redis (TTL 120s)
- [ ] `Issue #20` — Build cart total aggregation pipeline with discount support
- [ ] `Issue #21` — Implement order creation with atomic inventory decrement

### Key Implementation — vector.service.ts

```typescript
// server/src/services/vector.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.NODE_ENV === 'development') {
    // Mock embedding for local dev (no OpenAI cost)
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}
```

### Key Implementation — $vectorSearch Aggregation

```typescript
// server/src/controllers/product.controller.ts
export const searchProducts = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ message: 'Query required' });

  const cacheKey = `search:${Buffer.from(query).toString('base64')}`;
  const cached = await getCached(cacheKey);
  if (cached) return res.json({ source: 'cache', data: cached });

  const embedding = await generateEmbedding(query);

  const results = await Product.aggregate([
    {
      $vectorSearch: {
        index: 'product_vector_index',
        path: 'embedding',
        queryVector: embedding,
        numCandidates: 100,
        limit: 10,
      },
    },
    {
      $project: {
        name: 1, description: 1, price: 1, category: 1, stock: 1,
        score: { $meta: 'vectorSearchScore' },
        embedding: 0,
      },
    },
  ]);

  await setCache(cacheKey, results, 120);
  return res.json({ source: 'database', data: results });
};
```

### Week 3 Commit Message Examples
```
feat: create MongoDB Atlas vector search index for product embeddings (fixes #16)
feat: build vector.service.ts with OpenAI embedding and dev mock (fixes #17)
feat: implement GET /products/search using $vectorSearch aggregation (fixes #18)
feat: cache vector search results in Redis with 120s TTL (fixes #19)
feat: build cart total aggregation pipeline with discount code logic (fixes #20)
feat: implement atomic inventory decrement on order creation (fixes #21)
```

---

## Week 4 — React 19 Admin Dashboard and CI/CD

**Branch:** `feature/week-4-dashboard-cicd`
**GitHub Milestone:** `Week 4 — Production`

### GitHub Issues to Open
- [ ] `Issue #22` — Build shell layout (Sidebar + routing)
- [ ] `Issue #23` — Build Dashboard page with stat cards
- [ ] `Issue #24` — Build Product List page with cache badges
- [ ] `Issue #25` — Build Product Form (create + edit)
- [ ] `Issue #26` — Build Semantic Search page
- [ ] `Issue #27` — Wire React Query for all API calls
- [ ] `Issue #28` — Configure GitHub Actions CI pipeline
- [ ] `Issue #29` — Write Dockerfile and .dockerignore
- [ ] `Issue #30` — Write README.md with setup instructions

### Key Implementation — React Query Setup

```typescript
// client/src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

```typescript
// client/src/pages/ProductList.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';

const { data, isLoading, isError } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.get('/products').then(r => r.data),
});

const queryClient = useQueryClient();
const updateMutation = useMutation({
  mutationFn: (product) => api.put(`/products/${product.id}`, product),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
});
```

### Week 4 Commit Message Examples
```
feat: build sidebar layout and React Router protected routes (fixes #22)
feat: implement Dashboard page with stat cards (fixes #23)
feat: implement Product List page with CacheBadge component (fixes #24)
feat: implement Product Form with validation for create and edit (fixes #25)
feat: implement Semantic Search page with vector results display (fixes #26)
feat: wire TanStack React Query for all product and auth API calls (fixes #27)
ci: add GitHub Actions workflow for lint and build on all branches (fixes #28)
chore: write multi-stage Dockerfile and .dockerignore (fixes #29)
docs: write README with local setup, seeding, and Docker instructions (fixes #30)
```

### Week 4 PR Description Template
```markdown
## Week 4 — React 19 Admin Dashboard and CI/CD

### Summary
- Full admin dashboard built with React 19 + Vite + Tailwind CSS v4
- TanStack React Query manages all server state with auto-invalidation
- GitHub Actions CI pipeline runs lint + build on every push
- Backend containerized with multi-stage Docker build
- README documents full local setup

### Architecture Decisions
- React Query chosen over Redux for server state (auto cache invalidation on mutations)
- Multi-stage Docker reduces production image size significantly

### CI Status
- [x] GitHub Actions passing (4 weeks of continuous green builds)
```

---

## Final Submission Checklist

### Code Quality
- [ ] TypeScript strict mode enabled, zero `any` types
- [ ] ESLint passing with zero warnings
- [ ] All API routes return consistent JSON structure
- [ ] Passwords never returned in any API response
- [ ] Environment variables never committed to Git

### GitHub Protocol
- [ ] 4 weeks of continuous commits (3–5 per active day)
- [ ] All commits reference GitHub Issues (`fixes #N`)
- [ ] No direct commits to `main`
- [ ] 4 weekly PRs merged with architecture summaries
- [ ] GitHub Projects Kanban board fully updated
- [ ] GitHub Actions passing throughout all 4 weeks

### Features
- [ ] JWT authentication (register + login)
- [ ] Product CRUD with admin RBAC
- [ ] Redis Cache-Aside with cache invalidation
- [ ] MongoDB vector search (semantic)
- [ ] Cart total aggregation with discount codes
- [ ] Atomic order creation with inventory decrement
- [ ] React 19 admin dashboard
- [ ] Dockerfile + .dockerignore

### Documentation
- [ ] README with setup, seeding, and Docker instructions
- [ ] `.env.example` (no real secrets)
- [ ] All 7 project docs committed to repo root `/docs/`
