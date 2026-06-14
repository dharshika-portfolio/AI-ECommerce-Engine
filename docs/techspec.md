# Technical Specification — High-Performance E-Commerce Engine with AI Vector Search

**Project:** Infotact Internship — Project 2
**Stack:** MERN + Redis + TypeScript
**Last Updated:** Week 1, Day 1

---

## 1. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend Framework | React | 19.x | Concurrent rendering, modern hooks |
| Build Tool | Vite | 7.x | HMR, fast builds, native ESM |
| Styling | Tailwind CSS | v4 | @tailwindcss/vite plugin, zero boilerplate |
| Language (FE) | TypeScript | 5.x | Strict typing, IDE support |
| Backend Runtime | Node.js | 22.x LTS | Stable, widely supported |
| Backend Framework | Express.js | 5.x | Minimal, production-ready |
| Language (BE) | TypeScript | 5.x | Strict mode, compile-time safety |
| Database | MongoDB | 7.x (Atlas) | Flexible schema, native vector search |
| ODM | Mongoose | 8.x | Schema validation, aggregation support |
| Cache / Pub-Sub | Redis | 7.x | In-memory, sub-millisecond reads |
| Redis Client | ioredis | 5.x | TypeScript-native, reconnect strategies |
| Authentication | JSON Web Tokens | jsonwebtoken@9 | Stateless, scalable |
| Password Hashing | bcrypt | 5.x | Industry standard |
| Containerization | Docker | 24.x | Multi-stage builds |
| CI/CD | GitHub Actions | — | Automated lint + build on every push |

---

## 2. Repository Structure

```
/
├── client/                         # React 19 + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                    # Axios instances and API helpers
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProductList.tsx
│   │   │   └── Login.tsx
│   │   ├── store/                  # Redux Toolkit or React Query
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── server/                         # Express + TypeScript backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts               # Mongoose connection
│   │   │   └── redis.ts            # ioredis client singleton
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   └── order.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT verification
│   │   │   └── rbac.middleware.ts  # Role enforcement
│   │   ├── models/
│   │   │   ├── User.model.ts
│   │   │   ├── Product.model.ts
│   │   │   └── Order.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   └── order.routes.ts
│   │   ├── services/
│   │   │   ├── cache.service.ts    # Cache-Aside abstraction
│   │   │   └── vector.service.ts   # Embedding + search logic
│   │   ├── scripts/
│   │   │   └── seed.ts             # DB seeder (thousands of products)
│   │   ├── types/
│   │   │   └── index.d.ts
│   │   └── index.ts                # App entry point
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── main.yml                # CI pipeline
│
├── .gitignore
└── README.md
```

---

## 3. Backend Architecture

### 3.1 Cache-Aside Pattern

```
Client Request
      │
      ▼
Express Route Handler
      │
      ▼
cache.service.ts ──── Redis HIT ──────────────► Return cached JSON (< 5ms)
      │
   Redis MISS
      │
      ▼
MongoDB Query (Mongoose)
      │
      ▼
Store result in Redis with TTL
      │
      ▼
Return JSON to client
```

**Cache Key Conventions:**

| Resource | Redis Key Pattern | TTL |
|----------|------------------|-----|
| All products | `products:all` | 300s |
| Single product | `products:<id>` | 600s |
| Search results | `search:<hash_of_query>` | 120s |

**Cache Invalidation Rules:**
- `PUT /api/products/:id` → delete `products:<id>` and `products:all`
- `POST /api/products` → delete `products:all`
- `DELETE /api/products/:id` → delete `products:<id>` and `products:all`

### 3.2 Vector Search Flow

```
User Query String
      │
      ▼
vector.service.ts
      │
      ▼
Generate embedding (OpenAI text-embedding-3-small or local mock)
      │
      ▼
MongoDB $vectorSearch aggregation pipeline
      │
      ▼
Returns top-N ranked products by cosine similarity
```

### 3.3 Middleware Chain

```
Request
  → CORS
  → Express JSON Parser
  → auth.middleware.ts (verifies JWT, attaches req.user)
  → rbac.middleware.ts (checks req.user.role against route policy)
  → Controller
  → Response
```

---

## 4. Frontend Architecture

### 4.1 State Management

Use **React Query (TanStack Query v5)** for server state:
- Automatic cache invalidation on mutations
- Loading / error / success states out of the box
- Refetch on window focus

### 4.2 API Layer

All API calls go through a centralized Axios instance in `client/src/api/`:

```typescript
// client/src/api/axiosInstance.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 4.3 Routing

Use **React Router v6** with protected routes:
- `/login` — Public
- `/dashboard` — Admin protected
- `/products` — Admin protected
- `/products/:id/edit` — Admin protected

---

## 5. Database Design

See `schema.md` for full Mongoose schema definitions.

---

## 6. API Specification

### Auth Routes
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/auth/register` | None | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | None | `{ email, password }` | `{ token, user }` |

### Product Routes
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/products` | None | Cache-Aside, paginated |
| GET | `/api/products/:id` | None | Cache-Aside |
| GET | `/api/products/search?q=` | None | Vector search |
| POST | `/api/products` | Admin | Invalidates cache |
| PUT | `/api/products/:id` | Admin | Invalidates cache |
| DELETE | `/api/products/:id` | Admin | Invalidates cache |

### Cart Routes
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/cart/total` | User | Aggregation pipeline, discount codes |

### Order Routes
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/orders` | User | Atomic inventory decrement |

---

## 7. Environment Variables

### Server `.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecommerce
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...       # For vector embeddings
NODE_ENV=development
```

### Client `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

> **Security:** Never commit `.env` files. Add them to `.gitignore`. Use GitHub Secrets for CI.

---

## 8. Docker Configuration

### `server/Dockerfile`
```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### `.dockerignore`
```
node_modules
dist
.env
*.log
.git
```

---

## 9. GitHub Actions CI

### `.github/workflows/main.yml`
```yaml
name: CI Pipeline

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

jobs:
  build-and-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Install server dependencies
        run: cd server && npm ci

      - name: Run TypeScript compiler check
        run: cd server && npm run build

      - name: Run ESLint
        run: cd server && npm run lint

      - name: Install client dependencies
        run: cd client && npm ci

      - name: Build client
        run: cd client && npm run build
```

---

## 10. TypeScript Configuration

### `server/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
