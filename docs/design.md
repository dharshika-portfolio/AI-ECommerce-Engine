# Design Document — High-Performance E-Commerce Engine with AI Vector Search

**Project:** Infotact Internship — Project 2
**Stack:** React 19 + Tailwind CSS v4 + Vite 7

---

## 1. Design Philosophy

The admin dashboard is a **data-dense, professional interface** — not a marketing page. Design priorities in order:

1. **Clarity** — Tables and forms must be immediately scannable
2. **Efficiency** — Admins perform repetitive tasks; minimize friction
3. **Feedback** — Every action (cache hit, API error, save success) must communicate clearly
4. **Consistency** — Reusable component system throughout

---

## 2. Color System (Tailwind CSS v4)

```css
/* Configured via CSS variables in main.css */
:root {
  --color-primary:       #4F46E5;   /* Indigo-600 — CTAs, active states */
  --color-primary-hover: #4338CA;   /* Indigo-700 */
  --color-success:       #10B981;   /* Emerald-500 — cache HIT, saved */
  --color-warning:       #F59E0B;   /* Amber-500 — cache MISS, pending */
  --color-danger:        #EF4444;   /* Red-500 — errors, delete actions */
  --color-bg:            #F9FAFB;   /* Gray-50 — page background */
  --color-surface:       #FFFFFF;   /* White — cards, panels */
  --color-border:        #E5E7EB;   /* Gray-200 — dividers, table borders */
  --color-text-primary:  #111827;   /* Gray-900 — headings */
  --color-text-secondary:#6B7280;   /* Gray-500 — labels, metadata */
}
```

---

## 3. Typography

| Token | Value | Usage |
|-------|-------|-------|
| Font Family | `Inter` (Google Fonts) | All UI text |
| Page Title | `text-2xl font-bold` | H1 headings |
| Section Title | `text-lg font-semibold` | Card headers |
| Table Header | `text-xs font-medium uppercase tracking-wider` | `<th>` |
| Body | `text-sm` | Table cells, form labels |
| Metadata | `text-xs text-gray-500` | Timestamps, IDs |
| Code/IDs | `font-mono text-xs` | Product IDs, cache keys |

---

## 4. Page Layouts

### 4.1 Shell Layout

```
┌──────────────────────────────────────────────────────────────┐
│  SIDEBAR (w-64, fixed)     │  MAIN CONTENT (flex-1)          │
│  ─────────────────────     │  ─────────────────────────────  │
│  🛒 E-Commerce Admin       │  ┌──────────────────────────┐   │
│                            │  │ Page Header + Actions    │   │
│  Navigation:               │  └──────────────────────────┘   │
│  › Dashboard               │  ┌──────────────────────────┐   │
│  › Products                │  │ Content Area             │   │
│  › Search (Vector)         │  │ (Table / Form / Stats)   │   │
│  › Orders                  │  └──────────────────────────┘   │
│                            │                                  │
│  ─────────────────────     │                                  │
│  Logged in as: Admin       │                                  │
│  [Logout]                  │                                  │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Dashboard Page

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
│  ──────────────────────────────────────────────────────────  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Total Products│  │ Cache Hit %  │  │ Total Orders │       │
│  │     5,000    │  │    84.2%     │  │     128      │       │
│  │  +12 today   │  │  ↑ from 78%  │  │  +4 today    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Recent Products                         [View All →]   │  │
│  │ ──────────────────────────────────────────────────── │  │
│  │ Name          │ Category │ Price  │ Stock │ Cache    │  │
│  │ ─────────────────────────────────────────────────── │  │
│  │ Winter Jacket │ Apparel  │ ₹2,499 │  342  │ ● HIT  │  │
│  │ Running Shoes │ Footwear │ ₹3,999 │   89  │ ○ MISS │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Product List Page

```
┌──────────────────────────────────────────────────────────────┐
│  Products                             [+ Add Product]        │
│  ──────────────────────────────────────────────────────────  │
│  🔍 Search products...     Filter: [All Categories ▼]       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ID        │ Name        │ Price  │ Stock │ Actions     │  │
│  │ ─────────────────────────────────────────────────────  │  │
│  │ 6a7b8c... │ Puffer Vest │ ₹1,299 │  220  │ [Edit][Del]│  │
│  │ 9d0e1f... │ Wool Scarf  │ ₹899   │   55  │ [Edit][Del]│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Showing 1-20 of 5,000  [← Prev]  Page 1  [Next →]         │
└──────────────────────────────────────────────────────────────┘
```

### 4.4 Product Form (Create / Edit)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Products                                          │
│  Edit Product                                                │
│  ──────────────────────────────────────────────────────────  │
│  Product Name *                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Winter Puffer Jacket                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Description                                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Warm, wind-resistant jacket for cold winters...      │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Price (₹) *             Category *                          │
│  ┌─────────────────┐     ┌──────────────────────────────┐   │
│  │ 2499            │     │ Apparel                    ▼ │   │
│  └─────────────────┘     └──────────────────────────────┘   │
│                                                              │
│  Stock Quantity *                                            │
│  ┌─────────────────┐                                         │
│  │ 342             │                                         │
│  └─────────────────┘                                         │
│                                                              │
│  [Cancel]                              [Save Changes →]      │
└──────────────────────────────────────────────────────────────┘
```

### 4.5 Semantic Search Page

```
┌──────────────────────────────────────────────────────────────┐
│  AI Vector Search                                            │
│  ──────────────────────────────────────────────────────────  │
│  Try: "warm winter jacket" or "lightweight running shoe"     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔍 Type your search query...                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                      [Search]               │
│                                                              │
│  Results for "warm winter jacket"  (8 matches, 42ms)        │
│  ──────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🧥 Winter Puffer Jacket    Score: 0.94   ₹2,499    │    │
│  │ 🧥 Sherpa Fleece Pullover  Score: 0.88   ₹1,899    │    │
│  │ 🧥 Thermal Base Layer      Score: 0.81   ₹799      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Component Inventory

| Component | File | Description |
|-----------|------|-------------|
| `Sidebar` | `components/Sidebar.tsx` | Fixed navigation shell |
| `StatCard` | `components/StatCard.tsx` | Dashboard KPI cards |
| `ProductTable` | `components/ProductTable.tsx` | Paginated product list |
| `ProductForm` | `components/ProductForm.tsx` | Create/Edit form |
| `SearchBar` | `components/SearchBar.tsx` | Semantic search input |
| `SearchResults` | `components/SearchResults.tsx` | Vector search results list |
| `CacheBadge` | `components/CacheBadge.tsx` | HIT (green) / MISS (amber) pill |
| `ConfirmModal` | `components/ConfirmModal.tsx` | Delete confirmation dialog |
| `LoadingSpinner` | `components/LoadingSpinner.tsx` | Global async indicator |
| `Toast` | `components/Toast.tsx` | Success / error notifications |
| `Pagination` | `components/Pagination.tsx` | Page controls |
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Auth guard for admin routes |

---

## 6. UI States

Every async operation must handle all three states:

```tsx
// Pattern for all data-fetching components
if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage message={error.message} />;
return <ProductTable data={data} />;
```

### Cache Badge

```tsx
// CacheBadge.tsx
const CacheBadge = ({ hit }: { hit: boolean }) => (
  <span className={`
    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
    ${hit
      ? 'bg-emerald-100 text-emerald-700'   // Cache HIT
      : 'bg-amber-100 text-amber-700'        // Cache MISS
    }
  `}>
    <span className={`h-1.5 w-1.5 rounded-full ${hit ? 'bg-emerald-500' : 'bg-amber-500'}`} />
    {hit ? 'HIT' : 'MISS'}
  </span>
);
```

---

## 7. Responsive Behavior

| Breakpoint | Sidebar | Table | Cards |
|-----------|---------|-------|-------|
| `sm` (< 640px) | Hidden (hamburger) | Horizontal scroll | Stacked |
| `md` (640–1024px) | Collapsible | Full visible | 2-col grid |
| `lg` (> 1024px) | Fixed visible | Full visible | 3-col grid |

---

## 8. Tailwind CSS v4 Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // @tailwindcss/vite — no tailwind.config.js needed
  ],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```
