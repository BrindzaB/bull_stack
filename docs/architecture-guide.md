# BullStack — Architecture Guide

> A comprehensive guide to understanding how this Next.js application is structured, how its layers communicate, and why each pattern exists. Uses the **Portfolio feature** as the main walkthrough example.

---

## Table of Contents

1. [What Is BullStack?](#1-what-is-bullstack)
2. [The Tech Stack — What and Why](#2-the-tech-stack--what-and-why)
3. [The Big Picture — Layers of the App](#3-the-big-picture--layers-of-the-app)
4. [Layer 1 — Database (Prisma + PostgreSQL)](#4-layer-1--database-prisma--postgresql)
5. [Layer 2 — External APIs (Finnhub + Cache)](#5-layer-2--external-apis-finnhub--cache)
6. [Layer 3 — Authentication (NextAuth v5)](#6-layer-3--authentication-nextauth-v5)
7. [Layer 4 — API Routes (Next.js Route Handlers)](#7-layer-4--api-routes-nextjs-route-handlers)
8. [Layer 5 — Client Data Layer (React Query + lib/api.ts)](#8-layer-5--client-data-layer-react-query--libapits)
9. [Layer 6 — React Components](#9-layer-6--react-components)
10. [Layer 7 — TypeScript Types](#10-layer-7--typescript-types)
11. [Deep Dive: The Portfolio Page End-to-End](#11-deep-dive-the-portfolio-page-end-to-end)
    - [A. Viewing Holdings (GET flow)](#a-viewing-holdings-get-flow)
    - [B. Adding a Holding (POST flow)](#b-adding-a-holding-post-flow)
    - [C. Removing a Holding (DELETE flow)](#c-removing-a-holding-delete-flow)
12. [The Design System](#12-the-design-system)
13. [Key Patterns and Why They Exist](#13-key-patterns-and-why-they-exist)
14. [Glossary](#14-glossary)

---

## 1. What Is BullStack?

BullStack is a stock portfolio tracking web application. Users can:

- Register/log in with email+password or Google
- Search for stocks and view live prices and charts
- Add stocks to a watchlist
- Track their stock holdings with automatic P&L (profit & loss) calculations
- View a dashboard overview of everything at once

It is built as a **full-stack Next.js application** — meaning the frontend (what you see) and the backend (the database, API) all live in the same codebase.

---

## 2. The Tech Stack — What and Why

| Technology | Role | Why this one? |
|---|---|---|
| **Next.js 14** | Full-stack React framework | Gives us routing, server components, API routes, and middleware all in one. Industry standard for React apps. |
| **TypeScript** | Type-safe JavaScript | Catches errors before they happen. In a financial app, you don't want `"150"` where you expected `150`. |
| **Prisma 7** | Database ORM | Lets you write TypeScript instead of raw SQL. Auto-generates types from your schema. |
| **PostgreSQL** | Relational database | Reliable, supports `DECIMAL` precision for money values, great free hosting on Supabase. |
| **NextAuth v5** | Authentication | Handles the hard parts of auth: sessions, JWT tokens, OAuth, password hashing integration. |
| **TanStack React Query** | Client-side data fetching & caching | Manages loading/error states, caches responses, and re-fetches automatically. Avoids writing `useEffect` + `fetch` boilerplate. |
| **Tailwind CSS** | Styling | Utility-first CSS — write styles directly in JSX instead of separate CSS files. |
| **Recharts** | Charts | React-native charting library. Used for the stock price area chart. |
| **Finnhub API** | Live stock data | Free tier provides real-time quotes, company profiles, and symbol search. |
| **Zod** | Schema validation | Validates shapes of data (form inputs, API bodies) at runtime, not just at compile time. |

---

## 3. The Big Picture — Layers of the App

Think of the application as a stack of layers. Each layer has a single responsibility, and they communicate in a very specific direction.

```
┌─────────────────────────────────────────────────────┐
│                  BROWSER (User's Screen)             │
│                                                      │
│   React Components (UI)                              │
│   components/portfolio/*.tsx                         │
│   app/(dashboard)/portfolio/page.tsx                 │
│                      │                              │
│   Custom Hooks (Data Bridge)                         │
│   hooks/usePortfolio.ts                              │
│                      │                              │
│   Client Fetch Functions                             │
│   lib/api.ts                                         │
└──────────────────────┼──────────────────────────────┘
                       │  HTTP requests (fetch)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  SERVER (Next.js)                    │
│                                                      │
│   Middleware (Route Guard)                           │
│   middleware.ts                                      │
│                      │                              │
│   API Routes (Backend endpoints)                     │
│   app/api/portfolio/route.ts                         │
│   app/api/portfolio/[id]/route.ts                    │
│                      │                              │
│   Auth Layer                                         │
│   lib/auth.ts  ◄──── NextAuth v5                    │
│                      │                              │
│   External API Wrapper + Cache                       │
│   lib/finnhub.ts + lib/cache.ts                      │
│                      │                              │
│   Database ORM                                       │
│   lib/prisma.ts (Prisma Client singleton)            │
└──────────────────────┼──────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         ▼                            ▼
  PostgreSQL DB                  Finnhub API
  (your data)                  (market data)
```

**The most important rule:** data always flows **down** (toward the database/API) on mutations and **back up** (toward the browser) as responses. The browser never talks to the database directly.

---

## 4. Layer 1 — Database (Prisma + PostgreSQL)

### The Schema

The database schema lives in `prisma/schema.prisma`. It defines all the tables (called "models" in Prisma) and their relationships.

```prisma
// User owns everything — watchlist entries and portfolios
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   // null for Google-only users
  favoriteStocks FavoriteStock[]
  portfolios     Portfolio[]
}

// One portfolio holds many holdings
model Portfolio {
  id       String @id @default(cuid())
  name     String
  userId   String
  holdings PortfolioHolding[]
}

// One holding = one stock position (e.g. "10 shares of AAPL")
model PortfolioHolding {
  id          String  @id @default(cuid())
  portfolioId String
  symbol      String
  quantity    Decimal @db.Decimal(18, 8)   // NOT Float — see Key Patterns
  averageCost Decimal @db.Decimal(18, 8)
  transactions Transaction[]

  @@unique([portfolioId, symbol])  // Can't hold the same stock twice
}

// Every buy/sell action is recorded here
model Transaction {
  id        String          @id @default(cuid())
  holdingId String
  type      TransactionType // BUY or SELL
  quantity  Decimal         @db.Decimal(18, 8)
  price     Decimal         @db.Decimal(18, 8)
  date      DateTime
}
```

**The relationship chain:** `User → Portfolio → PortfolioHolding → Transaction`

When you delete a user, `onDelete: Cascade` automatically deletes all their portfolios, holdings, and transactions. You don't have to do it manually.

### The Prisma Singleton (`lib/prisma.ts`)

```typescript
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

**What is happening here?**

Next.js in development mode uses "hot reload" — when you save a file, the server restarts. Without this pattern, every reload would create a **new** database connection, and you'd quickly run out of connections. The singleton stores the instance on `globalThis` (which survives hot reloads) so it's only created once.

**Why `PrismaPg` adapter?** Prisma 7 requires an explicit driver adapter for PostgreSQL. `@prisma/adapter-pg` is the official PostgreSQL adapter.

---

## 5. Layer 2 — External APIs (Finnhub + Cache)

BullStack gets live stock data from [Finnhub](https://finnhub.io). This layer wraps those API calls so the rest of the app doesn't need to know the details.

### The TTL Cache (`lib/cache.ts`)

Before looking at Finnhub, understand the cache:

```typescript
interface CacheEntry<T> {
  data: T
  expiresAt: number  // Unix timestamp in milliseconds
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)   // Expired — delete and return nothing
      return undefined
    }
    return entry.data as T
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      data: value,
      expiresAt: Date.now() + ttlMs,  // "expire in N milliseconds from now"
    })
  }
}

export const cache = new TTLCache()
```

**Why this exists:** Finnhub's free tier allows 60 requests per minute. If 20 users all view the AAPL page at once, without a cache you'd make 20 identical API calls and likely hit the rate limit. The cache stores the response in memory for a set duration so subsequent requests get the cached result instantly.

**TTL = Time To Live** — how long to keep the cached data before considering it stale.

### The Finnhub Wrapper (`lib/finnhub.ts`)

```typescript
const BASE_URL = "https://finnhub.io/api/v1"

export async function getQuote(symbol: string): Promise<FinnhubQuote> {
    const cacheKey = `quote:${symbol}`;        // e.g. "quote:AAPL"
    const cached = cache.get<FinnhubQuote>(cacheKey);

    if (cached) return cached;                 // Cache hit — skip the API call

    const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
    const data: FinnhubQuote = await res.json();
    cache.set(cacheKey, data, 60_000);         // Cache for 60 seconds

    return data
}
```

**The API key is in `process.env.FINNHUB_API_KEY`** — this is an environment variable defined in `.env.local`. It is only accessible on the server, never in the browser. This is critical: if your API key leaked to the browser, anyone could steal it and use your API quota.

**Cache TTL decisions by endpoint:**

| Function | TTL | Why |
|---|---|---|
| `getQuote` | 60 seconds | Prices change frequently but not millisecond-by-millisecond |
| `getCompanyProfile` | 24 hours | Company name, logo, industry — almost never changes |
| `getSymbolSearch` | 5 minutes | Search results for a query are stable for a few minutes |

---

## 6. Layer 3 — Authentication (NextAuth v5)

Authentication is split across three files because of a Next.js constraint: **middleware runs on the "Edge" runtime**, which is a lightweight environment that cannot use Node.js libraries (like Prisma or bcrypt). So auth config is split into a minimal edge-safe part and a full server part.

### `auth.config.ts` — The Edge-Safe Config

```typescript
export const authConfig = {
    pages: {
        signIn: "/login",  // Redirect here when unauthenticated
    },
    callbacks: {
        authorized({ auth }) {
            return !!auth?.user  // True if logged in, false if not
        },
    },
    providers: [],  // No providers here — they need Node.js
} satisfies NextAuthConfig
```

This file is **used only by the middleware** to check if a user is logged in. It has no Prisma or bcrypt import — safe for the Edge runtime.

### `middleware.ts` — The Route Guard

```typescript
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/watchlist/:path*",
        "/portfolio/:path*",
        "/stocks/:path*",
        "/news/:path*",
    ],
}
```

**What happens here:** Before any request reaches the protected routes listed in `matcher`, Next.js runs this middleware. It checks if the user has a valid session (via `authConfig.callbacks.authorized`). If not, they are redirected to `/login`.

**Why is it split from `lib/auth.ts`?** Middleware runs before the page is rendered, on every request. It must be blazing fast and cannot load heavy Node.js modules. The `authConfig` is minimal — just "is there a session or not?"

### `lib/auth.ts` — The Full Server Config

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,                    // Spread in the edge-safe base config
  adapter: PrismaAdapter(prisma),   // Connect NextAuth to your database
  session: { strategy: "jwt" },     // Use JWT tokens (not database sessions)
  providers: [
    Google({ clientId: ..., clientSecret: ... }),
    Credentials({
        async authorize(credentials) {
            // 1. Validate shape of incoming data
            const parsed = z.object({
                email: z.string().email(),
                password: z.string().min(1),
            }).safeParse(credentials);

            if (!parsed.success) return null;

            // 2. Look up user in database
            const user = await prisma.user.findUnique({
                where: { email: parsed.data.email },
            })

            if (!user || !user.password) return null;

            // 3. Compare submitted password against stored hash
            const valid = await bcrypt.compare(parsed.data.password, user.password);

            if (!valid) return null;

            return user;  // Success — NextAuth creates a session
        },
    }),
  ],
  callbacks: {
    // Called when JWT is created/updated — stores user.id in the token
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    // Called when session is accessed — exposes id to components
    session({ session, token }) {
        session.user.id = token.id as string;
        return session;
    }
  },
});
```

**The JWT callback chain is important to understand:**

1. User logs in → `authorize()` returns the user object from DB
2. `jwt()` callback fires → stores `user.id` into the JWT token (a small encrypted cookie)
3. On every subsequent request, `session()` callback fires → reads `token.id` and puts it on `session.user.id`
4. Now any API route or server component can call `auth()` and get `session.user.id`

**Why JWT instead of database sessions?** Database sessions require a DB lookup on every single request. JWTs are self-contained — the session info lives in the cookie, no DB needed for most requests.

---

## 7. Layer 4 — API Routes (Next.js Route Handlers)

These are your **backend endpoints**. They live in `app/api/` and follow a specific file naming convention.

### How Route Handlers Work

```
app/api/portfolio/route.ts          → GET/POST  /api/portfolio
app/api/portfolio/[id]/route.ts     → PUT/DELETE /api/portfolio/:id
app/api/stocks/[symbol]/quote/route.ts → GET /api/stocks/AAPL/quote
```

A `route.ts` file exports named functions (`GET`, `POST`, `PUT`, `DELETE`) that correspond to HTTP methods. Next.js automatically maps the right function to the right HTTP method.

Every protected API route follows the same three-step pattern at the top:

```typescript
export async function GET() {
    // Step 1: Check authentication
    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    // Step 2: Use session.user.id to query only this user's data
    const portfolio = await prisma.portfolio.findFirst({
        where: { userId: session.user.id },
    });

    // Step 3: Return a response
    return Response.json(portfolio);
}
```

This pattern prevents a user from ever seeing another user's data — every query is scoped to `session.user.id`.

### All Portfolio API Routes

**`GET /api/portfolio`** — Fetch all holdings with live prices and computed P&L

```typescript
export async function GET() {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const portfolio = await prisma.portfolio.findFirst({
        where: {userId: session.user.id},
        include: { holdings: true},  // Also fetch all holdings in one query
    });

    if (!portfolio || portfolio.holdings.length === 0) {
        return Response.json({
            holdings: [],
            summary: {totalValue: 0, totalCost: 0, totalPnL: 0, totalPnLPercent: 0},
        });
    }

    // Fetch live prices for ALL holdings simultaneously (not one by one)
    const symbols = portfolio.holdings.map((h) => h.symbol);
    const quotes = await Promise.all(symbols.map((s) => getQuote(s).catch(() => null)));
    //                               ^^^^^^^^^^ This fires all requests in parallel

    // Compute per-holding P&L
    const holdings = portfolio.holdings.map((holding, i) => {
        const currentPrice = quotes[i]?.c ?? 0;
        const quantity = Number(holding.quantity);    // Decimal → number
        const averageCost = Number(holding.averageCost);
        const currentValue = quantity * currentPrice;
        const costBasis = quantity * averageCost;
        const pnl = currentValue - costBasis;
        const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        return { id, symbol, quantity, averageCost, currentPrice, currentValue, costBasis, pnl, pnlPercent };
    });

    // Aggregate the summary totals
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return Response.json({ holdings, summary: {totalValue, totalCost, totalPnL, totalPnLPercent} });
}
```

**`POST /api/portfolio`** — Add a new holding (or add shares to an existing one)

```typescript
export async function POST(request: Request) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    const { symbol, quantity, price, date } = await request.json();

    // Auto-create the portfolio if this is the first ever holding
    const portfolio = await getOrCreatePortfolio(session.user.id);

    // Check if you already hold this stock
    const existing = await prisma.portfolioHolding.findUnique({
        where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol }}
    });

    if (existing) {
        // Weighted average cost formula:
        // ((oldQty * oldAvg) + (newQty * newPrice)) / totalQty
        const newQty = oldQty + addedQty;
        const newAvgCost = (oldQty * oldAvg + addedQty * addedPrice) / newQty;

        holding = await prisma.portfolioHolding.update({...});
    } else {
        holding = await prisma.portfolioHolding.create({...});
    }

    return Response.json(holding, {status: 201});
}
```

**`DELETE /api/portfolio/[id]`** — Remove a holding

```typescript
export async function DELETE(_req: Request, {params}: {params: {id: string}}) {
    const session = await auth();
    if (!session) return new Response("Unauthorized", {status: 401});

    // Verify the holding belongs to this user before deleting
    const holding = await prisma.portfolioHolding.findFirst({
        where: {
            id: params.id,
            portfolio: { userId: session.user.id }  // Security check
        }
    });

    if (!holding) return new Response("Not found", {status: 404});

    await prisma.portfolioHolding.delete({where: {id: params.id}});
    return new Response(null, { status: 204 });
}
```

---

## 8. Layer 5 — Client Data Layer (React Query + `lib/api.ts`)

This layer lives entirely in the **browser**. It is responsible for fetching data from the API routes and keeping the UI in sync.

### `lib/api.ts` — The Fetch Functions

These are plain `async` functions that call your API routes using the browser's `fetch` API:

```typescript
// Fetch portfolio data from GET /api/portfolio
export async function fetchPortfolio(): Promise<PortfolioResponse> {
  const res = await fetch("/api/portfolio");
  if (!res.ok) throw new Error("Unable to fetch portfolio");
  return res.json();
}

// Add a holding via POST /api/portfolio
export async function addHolding(input: AddHoldingInput) {
  const res = await fetch("/api/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Unable to add holding");
  return res.json();
}

// Remove a holding via DELETE /api/portfolio/:id
export async function removeHolding(id: string) {
  const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Unable to remove holding");
}
```

**Why are these separate from the hook?** Separation of concerns. The function just knows how to talk to the API. The hook knows how to manage state around that. You could test them independently.

### `hooks/usePortfolio.ts` — The Custom Hook

```typescript
"use client"

export function usePortfolio() {
    const queryClient = useQueryClient();

    // useQuery: automatically fetches portfolio on mount, caches it, handles loading/error
    const query = useQuery<PortfolioResponse>({
        queryKey: ["portfolio"],    // Cache key — like a name for this data
        queryFn: fetchPortfolio,    // The function to call
    });

    // useMutation: wraps a write operation (POST/DELETE)
    const addMutation = useMutation({
        mutationFn: addHolding,
        onSuccess: () => {
            // After a successful add, tell React Query the "portfolio" cache is stale
            // This triggers an automatic re-fetch of the portfolio
            queryClient.invalidateQueries({ queryKey: ["portfolio"] });
        },
    });

    const removeMutation = useMutation({
        mutationFn: removeHolding,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio"] });
        },
    });

    return {
        holdings: query.data?.holdings ?? [],   // Default to empty array while loading
        summary: query.data?.summary ?? { totalValue: 0, totalCost: 0, totalPnL: 0, totalPnLPercent: 0 },
        isLoading: query.isLoading,
        addHolding: addMutation.mutate,         // Expose the trigger function
        removeHolding: removeMutation.mutate,
    };
}
```

**Why React Query instead of `useState` + `useEffect`?** Writing data fetching from scratch requires handling: loading state, error state, re-fetching on window focus, caching, deduplication of identical requests, and cache invalidation after mutations. React Query handles all of that automatically. Without it, you'd write 3–4x more code and have subtle bugs.

**What is `queryKey`?** It's a unique identifier for a piece of cached data. `["portfolio"]` means "the portfolio data". When you call `invalidateQueries({ queryKey: ["portfolio"] })`, React Query marks the cache entry as stale and re-fetches it. This is how the UI updates after you add or remove a holding.

---

## 9. Layer 6 — React Components

### Server Components vs Client Components

This is one of the most important concepts in Next.js 14. By default, all components are **Server Components** unless you add `"use client"` at the top.

| | Server Component | Client Component |
|---|---|---|
| **Runs on** | Server only | Browser (after initial render) |
| **Can use** | Prisma, `auth()`, `process.env` | `useState`, `useEffect`, event handlers |
| **Cannot use** | `useState`, browser APIs | Direct database access |
| **Example** | `Topbar.tsx` (reads session) | `PortfolioSummaryCard.tsx` (React Query) |

**Why does this matter?** Server components are faster (no JavaScript sent to browser) and more secure (sensitive data never leaves the server). Client components are needed for interactivity.

In BullStack, the split works like this:

- **Server components:** `Topbar`, `Sidebar`, route layouts — they can read `auth()` directly without an HTTP request
- **Client components:** Everything under `components/portfolio/`, `hooks/`, anything using React Query

### Component Hierarchy for Portfolio

```
app/(dashboard)/layout.tsx           [Server] — Topbar + Sidebar wrapper
└── app/(dashboard)/portfolio/page.tsx  [Client] — owns modalOpen state
    ├── PortfolioSummaryCard.tsx      [Client] — calls usePortfolio()
    ├── HoldingsTable.tsx             [Client] — calls usePortfolio()
    └── AddHoldingModal.tsx           [Client] — calls usePortfolio()
        └── SymbolSearch (internal)   [Client] — React Query for search
```

**Important:** `PortfolioSummaryCard` and `HoldingsTable` both call `usePortfolio()`. But because React Query caches by `queryKey`, **only one actual HTTP request is made**. Both components share the same cached data.

---

## 10. Layer 7 — TypeScript Types

Types describe the shape of data as it moves through the app. They live in `types/` and are imported wherever that data is used.

```typescript
// types/portfolio.ts

// What the API returns for a single holding (DB data + computed P&L)
export interface HoldingWithPnL {
    id: string;
    symbol: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;   // Not in DB — fetched from Finnhub
    currentValue: number;   // Computed: quantity * currentPrice
    costBasis: number;      // Computed: quantity * averageCost
    pnl: number;            // Computed: currentValue - costBasis
    pnlPercent: number;     // Computed: (pnl / costBasis) * 100
}

// The full API response shape
export interface PortfolioResponse {
    holdings: HoldingWithPnL[];
    summary: {
        totalValue: number;
        totalCost: number;
        totalPnL: number;
        totalPnLPercent: number;
    };
}
```

**Why separate types from the code that uses them?** The `PortfolioResponse` type is used in at least four places: `lib/api.ts`, `hooks/usePortfolio.ts`, `PortfolioSummaryCard.tsx`, and `HoldingsTable.tsx`. If it's defined in one of those files and the others import from there, you create circular dependencies. Putting types in `types/` makes them a neutral "source of truth" that anyone can import.

---

## 11. Deep Dive: The Portfolio Page End-to-End

Now let's walk through exactly what happens at each step when a user interacts with the portfolio page.

### A. Viewing Holdings (GET flow)

The user navigates to `/portfolio`. Here is every step that happens:

```
Step 1: Browser requests /portfolio
         ↓
Step 2: middleware.ts intercepts the request
        → Calls NextAuth(authConfig).auth
        → Checks: does this request have a valid JWT cookie?
        → If NO: redirect to /login
        → If YES: allow the request through
         ↓
Step 3: Next.js renders app/(dashboard)/layout.tsx (Server Component)
        → Renders Topbar + Sidebar
         ↓
Step 4: Next.js renders app/(dashboard)/portfolio/page.tsx (Client Component)
        → Creates React state: const [modalOpen, setModalOpen] = useState(false)
        → Renders: <PortfolioSummaryCard />, <HoldingsTable />, <AddHoldingModal isOpen={false} />
         ↓
Step 5: PortfolioSummaryCard mounts → calls usePortfolio()
        HoldingsTable mounts → calls usePortfolio()
        React Query sees queryKey ["portfolio"] is not cached yet
        → Fires ONE request: fetchPortfolio() → GET /api/portfolio
         ↓
Step 6: GET /api/portfolio runs on the server
        → const session = await auth()         // Reads JWT cookie, gets user.id
        → prisma.portfolio.findFirst(...)      // DB query: find portfolio for this user
        → symbols = ["AAPL", "TSLA", ...]      // Extract symbols from holdings
        → await Promise.all(symbols.map(getQuote))  // Fetch all live prices in parallel
            → getQuote("AAPL"):
                cache.get("quote:AAPL") → miss
                fetch("https://finnhub.io/api/v1/quote?symbol=AAPL&token=...")
                cache.set("quote:AAPL", data, 60_000)
                return data
        → Compute P&L for each holding
        → Return { holdings: [...], summary: {...} }
         ↓
Step 7: React Query receives the response
        → Stores it in cache under key ["portfolio"]
        → Provides { data, isLoading: false } to both components
         ↓
Step 8: Both components re-render with real data
        PortfolioSummaryCard → displays Total Value, Cost, P&L, Return
        HoldingsTable → displays each row with symbol, shares, prices, P&L
```

**The second component to call `usePortfolio()` (HoldingsTable) gets its data instantly** — React Query only fires the HTTP request once and both components share the result.

### B. Adding a Holding (POST flow)

The user clicks "+ Add Holding", fills in AAPL, 10 shares, $150, and submits.

```
Step 1: User clicks "+ Add Holding"
        → portfolio/page.tsx: setModalOpen(true)
        → AddHoldingModal renders (isOpen is now true)
         ↓
Step 2: User types "AAPL" in the Symbol field (SymbolSearch component)
        → After 300ms debounce: React Query fires searchStocks("AAPL")
        → GET /api/stocks/search?q=AAPL → lib/finnhub.getSymbolSearch("AAPL")
        → Dropdown shows results: "AAPL - Apple Inc."
        → User clicks → symbol state = "AAPL"
         ↓
Step 3: User fills in Shares: 10, Price: 150.00, Date: 2026-03-19
        → Local state: symbol="AAPL", quantity="10", price="150.00", date="2026-03-19"
         ↓
Step 4: User clicks "Add Holding" → handleSubmit fires
        → addHolding({ symbol: "AAPL", quantity: 10, price: 150, date: "2026-03-19" })
        → This calls addMutation.mutate() from usePortfolio()
        → Form resets, modal closes immediately ("optimistic close")
         ↓
Step 5: addMutation runs addHolding() from lib/api.ts
        → POST /api/portfolio with body { symbol, quantity, price, date }
         ↓
Step 6: POST /api/portfolio runs on the server
        → auth() → verify session, get user.id
        → getOrCreatePortfolio(userId) → finds existing or creates "My Portfolio"
        → portfolioHolding.findUnique({ portfolioId_symbol: { portfolioId, symbol: "AAPL" }})
            → If no existing AAPL holding:
               → prisma.portfolioHolding.create({
                     symbol: "AAPL",
                     quantity: 10,
                     averageCost: 150,
                     transactions: { create: { type: "BUY", quantity: 10, price: 150, date } }
                 })
            → If AAPL already exists (user is buying more):
               → Weighted average: newAvg = (oldQty * oldAvg + 10 * 150) / (oldQty + 10)
               → prisma.portfolioHolding.update({ quantity: newTotal, averageCost: newAvg })
        → return Response.json(holding, { status: 201 })
         ↓
Step 7: addMutation.onSuccess fires
        → queryClient.invalidateQueries({ queryKey: ["portfolio"] })
        → React Query marks the cached portfolio as stale
        → Automatically re-fetches GET /api/portfolio
         ↓
Step 8: New portfolio data arrives
        → PortfolioSummaryCard and HoldingsTable both re-render
        → AAPL now appears in the table with live price and P&L
```

### C. Removing a Holding (DELETE flow)

The user hovers over a row, the "Remove" button appears, and they click it.

```
Step 1: User hovers the AAPL row
        → Tailwind "group-hover" makes the Remove button visible
        → CSS: opacity-0 → group-hover:opacity-100
         ↓
Step 2: User clicks "Remove"
        → onClick={() => removeHolding(holding.id)
        → removeHolding is removeMutation.mutate from usePortfolio()
         ↓
Step 3: removeMutation fires removeHolding(id) from lib/api.ts
        → DELETE /api/portfolio/[id]
         ↓
Step 4: DELETE /api/portfolio/[id] runs on server
        → auth() → get user.id
        → portfolioHolding.findFirst({
              where: { id: params.id, portfolio: { userId: session.user.id } }
          })
          ^^ This checks the holding belongs to THIS user — security
        → If not found: return 404
        → portfolioHolding.delete({ where: { id: params.id }})
        → return Response(null, { status: 204 })
         ↓
Step 5: removeMutation.onSuccess fires
        → queryClient.invalidateQueries({ queryKey: ["portfolio"] })
        → Re-fetches GET /api/portfolio
         ↓
Step 6: UI updates — AAPL row disappears from the table
```

---

## 12. The Design System

The visual layer is built with a custom Tailwind configuration and reusable CSS classes. This keeps the styling consistent without repeating the same long Tailwind strings everywhere.

### Custom Tailwind Colors (`tailwind.config.ts`)

```
surface-*   → Slate gray scale (backgrounds, borders, text)
             surface-50 (lightest) → surface-900 (darkest)

brand-*     → Indigo scale (primary actions, active states)
             brand-500 = #6366f1

up          → Emerald (#059669) — gains, positive values
down        → Rose (#e11d48) — losses, negative values
```

### Component Classes (`app/globals.css`)

Instead of writing the same 8 Tailwind classes every time you make a card, you use `.card`:

```css
.card {
    @apply rounded-2xl bg-white shadow-card;
}

.btn-primary {
    @apply bg-gradient-to-r from-brand-500 to-violet-500
           text-white font-medium rounded-lg px-4 py-2
           hover:-translate-y-0.5 transition-all;
}

.input-base {
    @apply rounded-lg border border-surface-200
           px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500;
}

.badge-up   { @apply text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5 text-xs font-mono; }
.badge-down { @apply text-rose-700 bg-rose-50 rounded-full px-2 py-0.5 text-xs font-mono; }

.section-label { @apply text-xs uppercase tracking-wider text-surface-500; }

.num { @apply font-mono tabular-nums; }
/* tabular-nums makes numbers the same width so columns don't jump */
```

**Example:** In `HoldingsTable.tsx`, P&L percentage is shown as:

```tsx
<span className={isGain ? "badge-up" : "badge-down"}>
    {formatPercent(holding.pnlPercent)}
</span>
```

The `isGain` boolean switches between the green badge and the red badge. The actual styling is defined once in `globals.css`, not in the component.

---

## 13. Key Patterns and Why They Exist

### Pattern 1: Decimal(18, 8) for money, never Float

```prisma
quantity    Decimal @db.Decimal(18, 8)
averageCost Decimal @db.Decimal(18, 8)
```

**Why:** Floating-point numbers are imprecise. `0.1 + 0.2` in JavaScript is `0.30000000000000004`. For a financial app where you're computing cost basis and P&L, that imprecision accumulates into real errors. `Decimal(18, 8)` stores the number exactly as decimal digits. You'll see `Number(holding.quantity)` in the API route — that converts Prisma's `Decimal` type to a JS number only after reading from the DB, for display purposes.

### Pattern 2: Server Components for layout, Client Components for interactivity

```
Topbar (Server) → can call auth() directly, zero JS sent to browser
HoldingsTable (Client) → needs React Query + useState, must be "use client"
```

**Why:** Server components render on the server and send pure HTML. No React JavaScript bundle is sent for those components. This makes the initial page load faster and keeps sensitive server-only code (like `auth()`) out of the browser entirely.

### Pattern 3: The JWT callback chain for session.user.id

```typescript
// In lib/auth.ts
jwt({ token, user }) {
    if (user) token.id = user.id;  // Store id in the JWT cookie
    return token;
},
session({ session, token }) {
    session.user.id = token.id as string;  // Expose id to components
    return session;
}
```

**Why:** By default, NextAuth's session only includes `name`, `email`, and `image`. Your app needs `user.id` to scope all database queries to the right user. The `jwt` callback stores the id in the encrypted cookie; the `session` callback makes it available as `session.user.id` wherever `auth()` is called.

### Pattern 4: Promise.all for parallel data fetching

```typescript
const quotes = await Promise.all(symbols.map((s) => getQuote(s).catch(() => null)));
```

**Why:** If you have 5 holdings and await each quote sequentially, you wait 5× the API response time. `Promise.all` fires all requests simultaneously and waits for all of them together. If one fails, `.catch(() => null)` prevents it from crashing the whole response — you just get `null` for that symbol's quote.

### Pattern 5: Cache invalidation after mutations

```typescript
const addMutation = useMutation({
    mutationFn: addHolding,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
});
```

**Why:** After you add a holding, the cached portfolio data is now stale (it doesn't include the new holding). `invalidateQueries` tells React Query to throw away the cache and re-fetch. Without this, the UI would still show the old data until the user refreshed the page.

### Pattern 6: Optimistic UI close (modal closes before server confirms)

```typescript
function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addHolding({ symbol, quantity, price, date });
    // Reset form and close immediately — don't wait for the server
    setSymbol(""); setQuantity(""); setPrice("");
    onClose();
}
```

**Why:** Waiting for the server response before closing the modal would make the app feel slow. The user fills the form and clicks "Add Holding" — they expect it to work. The modal closes immediately while the mutation runs in the background. If it fails, React Query would surface the error (this app currently doesn't show an error toast, but that's a Phase 7 improvement). This makes the interaction feel instant.

### Pattern 7: Scoping deletes with a joined where clause

```typescript
const holding = await prisma.portfolioHolding.findFirst({
    where: {
        id: params.id,
        portfolio: { userId: session.user.id }  // ← Security check
    }
});
```

**Why:** If you only checked `where: { id: params.id }`, a malicious user could send `DELETE /api/portfolio/someOtherUsersHoldingId` and delete someone else's data. The joined check ensures the holding's parent portfolio belongs to the requesting user. Only then do we proceed with the delete.

---

## 14. Glossary

| Term | Meaning |
|---|---|
| **API Route / Route Handler** | A file in `app/api/` that exports HTTP handler functions (GET, POST, etc.). This is your backend. |
| **Server Component** | A React component that only runs on the server. No JavaScript sent to the browser. Default in Next.js 14. |
| **Client Component** | A React component marked with `"use client"`. Runs in the browser. Can use hooks, state, event handlers. |
| **Middleware** | Code that runs on every request before the page renders. Used here for auth-guarding routes. |
| **JWT (JSON Web Token)** | An encrypted token stored as a cookie. Contains session data (like user id) so the server doesn't need to query the database on every request. |
| **ORM (Object-Relational Mapper)** | A library (Prisma) that lets you write TypeScript to query a database instead of raw SQL. |
| **TTL (Time To Live)** | How long a cached value is considered valid before it expires and must be re-fetched. |
| **queryKey** | React Query's cache identifier. All queries with the same key share cached data. Invalidating by key triggers a re-fetch. |
| **useMutation** | React Query hook for write operations (POST, PUT, DELETE). Tracks loading/error state and lets you run side effects on success. |
| **invalidateQueries** | Tells React Query that a cached result is stale and should be re-fetched next time it's needed. |
| **P&L (Profit & Loss)** | How much money you've gained or lost on an investment. P&L = (current value) - (cost basis). |
| **Cost Basis** | How much you paid for your shares. Cost Basis = quantity × average purchase price. |
| **Weighted Average Cost** | When you buy the same stock multiple times at different prices, the average cost is weighted by quantity: `(qty1 * price1 + qty2 * price2) / (qty1 + qty2)`. |
| **Cascade Delete** | When a parent record is deleted, all its child records are automatically deleted too (e.g. deleting a Portfolio also deletes all its Holdings). |
| **Edge Runtime** | A lightweight server environment (used by Next.js Middleware) that cannot run full Node.js code. No Prisma, no bcrypt. |
| **Optimistic UI** | Updating the UI immediately as if an action succeeded, before the server confirms. Makes the app feel faster. |
| **Singleton** | A pattern ensuring only one instance of something exists (e.g. one Prisma client, one cache instance). |
| **`Promise.all`** | Runs multiple async operations in parallel and waits for all of them to finish. Much faster than awaiting them one at a time. |
