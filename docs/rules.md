# Rules & Engineering Standards — High-Performance E-Commerce Engine with AI Vector Search

**Program:** Infotact Technical Internship
**Enforced by:** Infotact Project Managers
**Non-compliance:** Immediate disqualification from evaluation

---

## 1. The Prime Directive

> **The evaluation will only be done if the intern has all 4 weeks of GitHub commits and contributions.**
> A project submitted with a monolithic final-week commit dump will result in immediate disqualification — no exceptions.

Every rule in this document exists to enforce a single idea: **visible, week-by-week engineering discipline.**

---

## 2. GitHub Repository Rules

### 2.1 Repository Setup

| Rule | Detail |
|------|--------|
| Visibility | Public repository on GitHub |
| Name | `infotact-ecommerce-engine` (or as directed) |
| Root structure | `/client`, `/server`, `/docs`, `.github/` |
| README | Must exist from Day 1 and be updated each week |
| `.gitignore` | Must include `node_modules`, `dist`, `.env`, `*.log` |
| `.env.example` | Must be committed with all variable keys but no real values |

---

### 2.2 Branching Strategy

```
main (protected)
├── feature/week-1-setup-and-seed
├── feature/week-2-redis-cache
├── feature/week-3-vector-search
└── feature/week-4-dashboard-cicd
```

**Rules:**
- Direct commits to `main` or `master` are **entirely forbidden**
- Every week's work must occur on its own isolated feature branch
- Branch naming format: `feature/week-N-<short-description>`
- Branch must be created from latest `main` at the start of each week

---

### 2.3 Commit Rules

**Frequency:**
- Commit **3–5 times per active development day**
- Commits must be distributed across all 4 weeks
- Gaps of more than 3 consecutive days without commits are a red flag

**Message Format (Semantic Commits):**

```
<type>: <short description> (fixes #<issue-number>)
```

**Allowed types:**

| Type | When to use |
|------|------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code restructure without behavior change |
| `chore` | Config, dependencies, tooling |
| `test` | Adding or modifying tests |
| `docs` | README, comments, markdown files |
| `ci` | GitHub Actions workflow changes |
| `style` | Formatting, linting (no logic change) |

**Good Examples:**
```
feat: implement cache.service.ts with Redis Cache-Aside logic (fixes #10)
feat: add $vectorSearch aggregation for semantic product search (fixes #18)
fix: correct cache key collision between paginated product queries (fixes #11)
chore: add .dockerignore to exclude node_modules from image (fixes #29)
ci: add GitHub Actions workflow for lint and build checks (fixes #28)
docs: update README with Docker setup instructions (fixes #30)
```

**Bad Examples (will be flagged):**
```
✗ "fix stuff"
✗ "update"
✗ "final submission"
✗ "wip"
✗ Committing 50+ files in a single push without issue references
```

---

### 2.4 GitHub Issues

- Every week's tasks must be broken into individual GitHub Issues **before starting that week's code**
- Issues must be created in the repository and linked to the Kanban board
- Issue titles must be specific: `"Implement Redis Cache-Aside pattern for GET /products"` not `"Redis stuff"`
- Every commit message must close or reference an issue via `(fixes #N)`
- Issues are closed automatically when a commit with `fixes #N` is merged

---

### 2.5 GitHub Projects (Kanban Board)

- **Board columns:** To Do | In Progress | Done
- All Week 1 issues must be in "To Do" before the first commit
- Move issues to "In Progress" when work begins
- Close (Done) only when the feature is tested and committed
- Managers will audit timestamps on issue state changes

---

### 2.6 Pull Request Rules

**One PR per week**, opened at the end of the week against `main`.

**PR Title Format:**
```
Week N — <Short description of what was built>
```

**PR Description must include:**
```markdown
## Week N — <Feature Name>

### Summary
- Bullet list of what was implemented

### Architecture Decisions
- Why you chose X over Y (e.g., ioredis vs node-redis)

### Testing
- What was tested manually / via automated tests

### CI Status
- [ ] GitHub Actions passing
```

**PR Review:**
- Managers review the PR timestamps, individual commit timestamps, and merge date
- These timestamps form the **official record of weekly production**
- Do not squash all commits before the PR — the full commit history must be visible

---

## 3. GitHub Actions (CI) Rules

A CI pipeline must be configured by **Week 4 at the latest**, and ideally from Week 1.

**Required file:** `.github/workflows/main.yml`

**Pipeline must:**
- Trigger on every `push` to any branch
- Trigger on every `pull_request` to `main`
- Run `tsc --noEmit` (TypeScript type check)
- Run ESLint on the server
- Run `npm run build` on the client

**Evaluation check:** Managers will verify that the Actions tab shows a continuous history of CI runs across all 4 weeks. A green CI history is proof the code was stable throughout, not just at submission.

---

## 4. Code Quality Rules

### 4.1 TypeScript

- **Strict mode is non-negotiable:** `"strict": true` in all `tsconfig.json` files
- Zero `any` types — use proper interfaces or `unknown` with type guards
- All Mongoose models must have corresponding TypeScript interfaces
- All API request/response shapes must be typed

### 4.2 Security

| Rule | Implementation |
|------|---------------|
| Passwords | Always hashed with bcrypt (cost factor ≥ 12) |
| Passwords in API | Never returned — use `select: false` on schema |
| JWT secret | Must be in `.env`, never hardcoded |
| CORS | Configured with explicit `origin` — no wildcard `*` in production |
| Admin routes | Must pass through `auth.middleware.ts` + `rbac.middleware.ts` |
| `.env` files | Never committed — `.env.example` is the only committed config file |

### 4.3 API Response Consistency

All API responses must follow this shape:
```typescript
// Success
{ "data": <payload>, "source": "cache" | "database" }

// Error
{ "message": "Human-readable error message", "error": <details if dev mode> }
```

MongoDB `_id` must always be transformed to `id` in responses. The `__v` field must be stripped.

### 4.4 Cache Invalidation Rules

| Trigger | Keys Invalidated |
|---------|-----------------|
| `POST /api/products` | `products:all` |
| `PUT /api/products/:id` | `products:<id>` + `products:all` |
| `DELETE /api/products/:id` | `products:<id>` + `products:all` |
| Price update (subset of PUT) | Same as PUT |

Failure to invalidate cache on mutations = serving stale data = failed evaluation criterion.

---

## 5. Folder and File Naming Rules

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProductTable.tsx` |
| Hooks | camelCase with `use` prefix | `useProducts.ts` |
| Services | camelCase | `cache.service.ts` |
| Controllers | camelCase | `product.controller.ts` |
| Models | PascalCase | `Product.model.ts` |
| Routes | camelCase | `product.routes.ts` |
| Types | camelCase | `index.d.ts` |
| Config | camelCase | `db.ts`, `redis.ts` |

---

## 6. Docker Rules

- A `Dockerfile` must exist in `/server` by Week 4
- Must use a **multi-stage build** (build stage + production stage)
- A `.dockerignore` must exist and exclude: `node_modules`, `dist`, `.env`, `*.log`, `.git`
- Base image must be `node:22-alpine` (not `node:latest`)
- The final image must not contain dev dependencies

---

## 7. What Gets You Disqualified

| Violation | Consequence |
|-----------|------------|
| Missing commits in any of the 4 weeks | Disqualification |
| Entire codebase pushed in a single commit | Disqualification |
| Direct push to `main` branch | Disqualification |
| Passwords exposed in any API response | Disqualification |
| `.env` file committed to Git | Disqualification |
| Zero GitHub Issues created | Disqualification |
| CI pipeline never set up | Significant deduction |
| Commit messages without issue references | Significant deduction |
| TypeScript `any` used pervasively | Significant deduction |

---

## 8. Summary Checklist — Evaluated at Submission

```
GitHub
  [ ] 4 weeks of continuous commits (3–5/day)
  [ ] All commits reference GitHub Issues
  [ ] No direct commits to main
  [ ] 4 weekly feature branches created
  [ ] 4 weekly PRs with architecture summaries
  [ ] Kanban board populated and updated
  [ ] GitHub Actions CI green throughout all 4 weeks

Code
  [ ] TypeScript strict mode, zero any types
  [ ] Passwords never in API responses
  [ ] .env never committed
  [ ] Cache invalidation implemented on all mutations
  [ ] RBAC middleware on all admin routes
  [ ] Consistent JSON API response shape

Infrastructure
  [ ] Dockerfile (multi-stage, node:22-alpine)
  [ ] .dockerignore configured
  [ ] .env.example committed
  [ ] README with setup instructions

Features
  [ ] JWT auth (register + login)
  [ ] Redis Cache-Aside (GET /products, GET /products/:id)
  [ ] Cache invalidation on PUT/POST/DELETE
  [ ] MongoDB vector search (semantic)
  [ ] Cart aggregation pipeline with discount codes
  [ ] Atomic order + inventory decrement
  [ ] React 19 Admin Dashboard (CRUD + search)
```
