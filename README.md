# High-Performance E-Commerce Engine with AI Vector Search

> **Infotact Technical Internship — Project 2**  
> A production-grade e-commerce backend featuring Redis Cache-Aside pattern, MongoDB Atlas Vector Search for semantic product discovery, JWT authentication with RBAC, and a React 19 admin dashboard.

---


## 🏗️ Architecture Overview

```

┌──────────────────────────────────────────────────────┐
│                    React 19 Client                    │
│          (Vite + Tailwind CSS v4 + React Query)       │
└─────────────────────┬────────────────────────────────┘
                      │ HTTP / REST
┌─────────────────────▼────────────────────────────────┐
│              Express + TypeScript Server              │
│         JWT Auth │ RBAC │ Cache-Aside │ CRUD          │
└──────┬───────────────────────────────────┬───────────┘
       │                                   │
┌──────▼──────┐                   ┌────────▼────────┐
│  MongoDB    │                   │     Redis 7     │
│  Atlas M10+ │                   │  Cache-Aside    │
│  + Vector   │                   │  TTL: 300s      │
│  Search     │                   └─────────────────┘
└─────────────┘
```

## 📁 Project Structure

```
AI-ECommerce-Engine/
├── client/               # Vite + React 19 + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── main.tsx
│   └── vite.config.ts
├── server/               # Express + TypeScript
│   ├── src/
│   │   ├── config/       # db.ts, redis.ts
│   │   ├── controllers/
│   │   ├── middleware/   # auth, rbac
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/     # cache.service.ts, vector.service.ts
│   │   ├── scripts/      # seed.ts
│   │   └── index.ts
│   ├── Dockerfile
│   └── tsconfig.json
├── docs/                 # Project specification documents
├── .github/
│   └── workflows/
│       └── main.yml      # CI: lint + build on every push
├── .env.example          # All variable keys, no real values
├── .gitignore
└── README.md
```

## 🚀 Quick Start

## Prerequisites

- Node.js 22+
- Docker Desktop
- MongoDB Atlas account (M10+ for Vector Search)

### 1. Clone & Install

```bash
git clone https://github.com/dharshika-portfolio/AI-ECommerce-Engine.git
cd AI-ECommerce-Engine

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, OpenAI API key
```

### 3. Start Redis (Docker)

```bash
docker run -d -p 6379:6379 --name redis-dev redis:7-alpine
```

### 4. Seed the Database

```bash
cd server
npm run seed
# Seeds 5000 mock products with embeddings into MongoDB
```

### 5. Start Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Server runs on `http://localhost:5000`  
Client runs on `http://localhost:5173`

---

## 🐳 Docker (Production)

```bash
cd server
docker build -t ecommerce-server .
docker run -p 5000:5000 --env-file .env ecommerce-server
```

---

## 🧠 Key Features

| Feature | Tech |
|---------|------|
| JWT Authentication | `jsonwebtoken` + `bcrypt` (cost 12) |
| Role-Based Access Control | Custom RBAC middleware |
| Redis Cache-Aside | `ioredis` — TTL 300s (products), 120s (search) |
| Semantic Search | MongoDB `$vectorSearch` + OpenAI embeddings |
| Cart Aggregation | MongoDB aggregation pipeline with discount codes |
| Atomic Orders | MongoDB transactions with inventory decrement |
| Admin Dashboard | React 19 + TanStack React Query |
| CI/CD | GitHub Actions — lint + build on every push |

---

## 🗓️ Development Roadmap

| Week | Focus | Branch |
|------|-------|--------|
| Week 1 | Environment setup + seed data | `feature/week-1-setup-and-seed` |
| Week 2 | Redis Cache-Aside pattern | `feature/week-2-redis-cache` |
| Week 3 | Vector search + aggregations | `feature/week-3-vector-search` |
| Week 4 | React dashboard + CI/CD | `feature/week-4-dashboard-cicd` |

---

## 📄 Documentation

All project specification documents are in the `/docs` folder:

- [PRD](./docs/prd.md) — Product Requirements
- [Tech Spec](./docs/techspec.md) — Technical Specification
- [Schema](./docs/schema.md) — Database Schema
- [App Flow](./docs/appflow.md) — Application Flow
- [Design](./docs/design.md) — UI/UX Design
- [Implementation](./docs/implementation.md) — Week-by-Week Roadmap
- [Rules](./docs/rules.md) — Engineering Standards

---


## ⚠️ Security Notes

- Passwords are hashed with bcrypt (cost factor 12) — never returned in API responses
- JWT secret is stored in `.env` — never hardcoded
- `.env` is in `.gitignore` — only `.env.example` is committed
- CORS configured with explicit origin — no wildcard `*` in production
