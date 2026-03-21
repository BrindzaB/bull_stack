# BullStack — Phase 7 Polish Guide

> A detailed walkthrough of every change made in Phase 7 (Polish & Responsive). Covers the shimmer
> skeleton loader system, the mobile-responsive layout, and per-component mobile fixes.

---

## Table of Contents

1. [What Phase 7 Is About](#1-what-phase-7-is-about)
2. [The Problem: What Was Missing Before](#2-the-problem-what-was-missing-before)
3. [Part 1 — Shimmer Skeleton Loaders](#3-part-1--shimmer-skeleton-loaders)
   - [Step A: The CSS Animation in `globals.css`](#step-a-the-css-animation-in-globalscss)
   - [Step B: The Primitive `Skeleton` Component](#step-b-the-primitive-skeleton-component)
   - [Step C: Skeleton Variants Inside Each Component](#step-c-skeleton-variants-inside-each-component)
4. [Part 2 — Mobile-Responsive Layout](#4-part-2--mobile-responsive-layout)
   - [The Problem With the Sidebar on Mobile](#the-problem-with-the-sidebar-on-mobile)
   - [The Solution: Bottom Tab Navigation](#the-solution-bottom-tab-navigation)
   - [The File: `components/layout/BottomNav.tsx`](#the-file-componentslayoutbottomnavtsx)
   - [Changes to `Sidebar.tsx`](#changes-to-sidebartsx)
   - [Changes to `app/(dashboard)/layout.tsx`](#changes-to-appdashboardlayouttsx)
5. [Part 3 — Per-Component Mobile Fixes](#5-part-3--per-component-mobile-fixes)
   - [TopBar](#topbar)
   - [Dashboard page — scrollable on mobile](#dashboard-page--scrollable-on-mobile)
   - [HoldingTable — horizontal scroll](#holdingtable--horizontal-scroll)
   - [Stock page — card heights on mobile](#stock-page--card-heights-on-mobile)
   - [StockChart — padding, axis, tick density](#stockchart--padding-axis-tick-density)
6. [Why No ErrorBoundary or Suspense](#6-why-no-errorboundary-or-suspense)
7. [Summary of All Changed Files](#7-summary-of-all-changed-files)
8. [Patterns Introduced in Phase 7](#8-patterns-introduced-in-phase-7)

---

## 1. What Phase 7 Is About

Phases 1–6 built a fully working application: authentication, stock search, watchlist, portfolio
P&L tracking, and a news feed. The features were complete but the UX was rough in two specific ways:

1. **Loading felt jarring** — while data was fetching, components showed a plain line of text like
   `"Loading watchlist..."`. No visual structure, no sense of what the layout would look like.
2. **Mobile had no navigation and broken layouts** — the sidebar consumed most of a phone screen,
   the dashboard was not scrollable, the holdings table columns were clipped, and the stock chart
   was too cramped to read.

Phase 7 fixes both with two targeted additions:

| Addition | Fixes |
|---|---|
| Shimmer animation + `Skeleton` component | Jarring loading states across all data-fetching components |
| `BottomNav` + layout and component fixes | Mobile navigation, scrolling, table overflow, chart readability |

---

## 2. The Problem: What Was Missing Before

Before Phase 7, a typical component loading state looked like this:

```tsx
if (isLoading) {
    return (
        <div className="card p-8">
            <p className="text-sm text-surface-500">Loading watchlist...</p>
        </div>
    );
}
```

This is technically correct — it prevents rendering with empty data — but it creates two UX problems:

**Problem 1 — Layout shift:**
The card collapses to a single short line of text while loading, then suddenly expands to its full
size when data arrives. The page visually jumps. This is called Cumulative Layout Shift (CLS), one
of Google's Core Web Vitals — a real metric used to evaluate how stable a page feels.

**Problem 2 — No feedback:**
A static text string gives no indication that a network request is actively in progress. The user
sees the same thing whether the request takes 100ms or is silently failing.

**The fix — skeleton loading:**
Render fake placeholder shapes that match the real content's layout exactly. The page never shifts
because the space is already occupied by the skeleton. A shimmer animation provides clear,
continuous feedback that something is loading.

---

## 3. Part 1 — Shimmer Skeleton Loaders

Implementing skeletons is a three-step process that builds from the bottom up:

1. Define the shimmer animation in CSS
2. Create a tiny `Skeleton` component that applies that animation
3. Build a layout-specific skeleton variant inside each data-fetching component

### Step A: The CSS Animation in `globals.css`

Two things were added to `globals.css`.

**The keyframe animation:**

```css
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
```

A CSS `@keyframes` block defines the start and end state of an animation. This one animates
`background-position` — it moves a gradient horizontally across the element. At `0%` the gradient
starts 600px to the left (off-screen), at `100%` it has moved 600px to the right (also off-screen).
The result is a travelling highlight that sweeps left-to-right continuously.

**The `.shimmer` utility class:**

```css
.shimmer {
  background: linear-gradient(
    90deg,
    #eef2ff 25%,
    #e0e7ff 50%,
    #eef2ff 75%
  );
  background-size: 600px 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 0.375rem;
}
```

Breaking this down property by property:

- `background: linear-gradient(90deg, ...)` — a horizontal gradient using brand-50 (`#eef2ff`) and
  brand-100 (`#e0e7ff`). The three stops create a "light — slightly deeper — light" pattern that
  matches the app's indigo brand palette.
- `background-size: 600px 100%` — the gradient is 600px wide, but the element might only be 80px
  wide. The gradient is larger than the element and mostly clipped. The `background-position`
  animation scrolls this oversized gradient across the element, creating the travelling highlight.
- `animation: shimmer 1.4s ease-in-out infinite` — run the animation forever with a slight
  ease-in-out curve so the movement feels smooth rather than mechanical.
- `border-radius: 0.375rem` — a default rounded corner (Tailwind's `rounded`). Individual usages
  can override this with their own `rounded-*` class.

This class is placed inside the `@layer components` block alongside `.card`, `.btn-primary`, etc.

---

### Step B: The Primitive `Skeleton` Component

**File: `components/ui/Skeleton.tsx`**

```tsx
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer ${className}`} aria-hidden="true" />
}
```

A `<div>` with the `.shimmer` class applied, plus any extra classes passed in via `className`.

**Why does it accept `className`?**
Skeleton blocks need to be different sizes in every context. A headline skeleton might be `h-5 w-48`.
A price skeleton might be `h-7 w-32`. A badge skeleton might be `h-5 w-16 rounded-md`. One component
with a `className` prop covers all cases instead of a separate component per size.

**Why `aria-hidden="true"`?**
Skeleton elements are purely visual placeholders. `aria-hidden="true"` tells assistive technologies
to ignore this element entirely, preventing screen readers from announcing empty blocks.

---

### Step C: Skeleton Variants Inside Each Component

Each data-fetching component has its own private skeleton function defined directly above the main
export. The pattern is always:

```
ComponentSkeleton()  ← private function, same file, mirrors the real layout
MainComponent()      ← the real component, returns <ComponentSkeleton /> when isLoading is true
```

Here is `WatchlistTable` as the primary example:

**Before Phase 7:**

```tsx
if (isLoading) {
    return (
        <div className="card p-8">
            <p className="text-sm text-surface-500">Loading watchlist...</p>
        </div>
    );
}
```

**After Phase 7:**

```tsx
function WatchlistSkeleton() {
    return (
        <div className="card overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-surface-100 bg-brand-500/10">
                        <th className="py-3 pl-6 pr-4 text-left">
                            <span className="section-label text-brand-700">Symbol</span>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <span className="section-label text-brand-700">Price</span>
                        </th>
                        <th className="py-3 px-4 text-left">
                            <span className="section-label text-brand-700">Change</span>
                        </th>
                        <th className="py-3 pl-4 pr-6" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-surface-100">
                            <td className="py-3.5 pl-6 pr-4"><Skeleton className="h-4 w-14" /></td>
                            <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="py-3.5 px-4"><Skeleton className="h-5 w-16 rounded-md" /></td>
                            <td className="py-3.5 pl-4 pr-6" />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
```

Key decisions:

- **The table structure is identical to the real table.** Same `<table>`, same `<thead>`, same
  column headers, same padding. Only the `<tbody>` rows are replaced with skeleton blocks. The
  skeleton and real table occupy exactly the same space — zero layout shift.
- **`Array.from({ length: 4 }).map(...)` generates 4 placeholder rows.** Four is a realistic
  estimate. The exact number doesn't matter — it just needs to fill the space plausibly.
- **Each skeleton block's width matches what real data looks like.** A ticker like `AAPL` is short
  so `w-14`. A price like `$182.45` is wider so `w-20`. A badge has a pill shape so `rounded-md`.
- **`key={i}` uses array index.** Skeleton rows are static placeholders that never reorder, so
  index is perfectly safe as a key.

**All components with skeletons:**

| Component | Skeleton mimics |
|---|---|
| `WatchlistTable` | Full table with 4 shimmer rows |
| `WatchlistWidget` | 4 symbol + price/change rows |
| `HoldingTable` | Full table with 4 shimmer rows × 7 columns |
| `PortfolioSummaryCard` | Title block + 4 stat boxes (label + value) |
| `PortfolioWidget` | 3 symbol + value/return rows + summary footer |
| `NewsWidget` | 5 article rows (source line + headline line) |
| `StockQuoteCard` | Ticker label + large price + badge + 3 stat blocks |
| `StockChart` | Full-area shimmer block filling the chart space |
| `StockNewsFeed` | 6 article rows (source line + 2-line headline) |
| `NewsPage` | 8 article rows matching the `NewsCard` layout with image placeholder |

---

## 4. Part 2 — Mobile-Responsive Layout

### The Problem With the Sidebar on Mobile

The dashboard layout before Phase 7:

```tsx
<div className="flex flex-1 min-h-0 gap-4 p-4">
  <Sidebar />   {/* 224px wide, always visible */}
  <main className="flex-1 ...">
    {children}
  </main>
</div>
```

The sidebar takes a fixed `w-56` (224px). On a phone screen (~375px wide) that is 60% of the
horizontal space before content even begins. The result is a completely unusable layout on mobile.

### The Solution: Bottom Tab Navigation

On mobile, the sidebar is hidden and replaced with a **bottom tab bar** — a row of icon+label
navigation links pinned to the bottom of the screen. This is the standard mobile navigation pattern
because the bottom of the screen is within natural thumb reach and does not take any space from the
main content area.

On desktop (`md` breakpoint, 768px+), the bottom bar hides and the sidebar reappears. Each is
exclusive to its breakpoint — they never show at the same time.

```
Mobile (< 768px):              Desktop (>= 768px):

┌─────────────────────┐        ┌────────┬───────────────────┐
│       TopBar        │        │       TopBar               │
├─────────────────────┤        ├────────┼───────────────────┤
│                     │        │        │                   │
│    main content     │        │Sidebar │   main content    │
│                     │        │        │                   │
├─────────────────────┤        └────────┴───────────────────┘
│ 🏠  ⭐  📈  📰     │
│Dash Watch Port News │
└─────────────────────┘
```

### The File: `components/layout/BottomNav.tsx`

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Star, ChartNoAxesCombined, Newspaper } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist",  icon: Star },
  { href: "/portfolio", label: "Portfolio", icon: ChartNoAxesCombined },
  { href: "/news",      label: "News",      icon: Newspaper },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex md:hidden
                    border-t border-gray-200 bg-white">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors
              ${active ? "text-brand-600" : "text-surface-400 hover:text-surface-700"}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

Key decisions:

- **`"use client"`** — uses `usePathname()` which is a client-side hook.
- **`fixed bottom-0 inset-x-0 z-40`** — pins the bar to the bottom of the viewport at full width,
  floating above content. `z-40` matches the TopBar's stacking order.
- **`flex md:hidden`** — displays on mobile, completely hidden (`display: none`) from 768px up.
- **`flex-1` on each `<Link>`** — each tab takes an equal share of the bar's width.
- **Active check: `pathname === href || pathname.startsWith(href + "/")`** — the `+ "/"` prevents
  `/watchlist-beta` from falsely matching the `/watchlist` tab.

### Changes to `Sidebar.tsx`

One class change on the `<aside>`:

```tsx
// Before
<aside className="w-56 shrink-0 h-full ... flex flex-col overflow-hidden">

// After
<aside className="hidden md:flex w-56 shrink-0 h-full ... flex-col overflow-hidden">
```

- `hidden` — `display: none` by default (mobile).
- `md:flex` — override with `display: flex` at 768px and above.

### Changes to `app/(dashboard)/layout.tsx`

```tsx
// Before
<div className="flex flex-1 min-h-0 gap-4 p-4">
  <Sidebar />
  <main className="flex-1 min-w-0 min-h-0 overflow-hidden">

// After
<div className="flex flex-1 min-h-0 gap-4 p-4 pb-20 md:pb-4">
  <Sidebar />
  <main className="flex-1 min-w-0 min-h-0 overflow-y-auto md:overflow-hidden">
```

- **`pb-20 md:pb-4`** — `BottomNav` uses `position: fixed` so it is removed from document flow.
  Without this padding, content at the bottom of the page scrolls behind the bar and is unreachable.
  `pb-20` (80px) clears the bar on mobile. `md:pb-4` restores normal padding on desktop.
- **`overflow-y-auto md:overflow-hidden`** — on mobile the main area becomes a scroll container so
  all stacked content is reachable. On desktop the original `overflow-hidden` is restored since each
  individual page manages its own internal scroll.
- **`<BottomNav />`** imported and rendered at the bottom of the layout.

---

## 5. Part 3 — Per-Component Mobile Fixes

### TopBar

**Problem:** The logo consumed space on mobile, the search bar had a hardcoded `w-96` (384px) wider
than most phones, and `px-6` padding was too tight.

**Changes in `Topbar.tsx`:**
- Logo: `hidden md:block` — hidden on mobile, shown on desktop.
- Middle div: `flex-1` on both breakpoints, `md:justify-center` centres it only on desktop where the
  logo is visible and creates a balanced three-column layout.
- Padding: `px-4 md:px-6`.

**Changes in `StockSearchBar.tsx`:**
- `w-96` → `w-full md:w-96` — fills available space on mobile, fixed 384px on desktop.

---

### Dashboard page — scrollable on mobile

**Problem:** `overflow-hidden` on `<main>` blocked all scrolling. On mobile the dashboard stacks
three widgets vertically and needs the page itself to scroll.

**Fix:** `overflow-y-auto md:overflow-hidden` on `<main>` (covered in layout changes above).

---

### HoldingTable — horizontal scroll

**Problem:** The holdings table has 7 data columns. On mobile the table was forced to shrink to fit,
clipping the rightmost columns.

**Fix:** Wrap the `<table>` in an `overflow-x-auto` div inside the card:

```tsx
// Before
<div className="card overflow-hidden">
  <table className="w-full text-sm">

// After
<div className="card">
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
```

- `overflow-hidden` removed from the outer card — it was clipping table content.
- Inner `overflow-x-auto` div creates a horizontal scroll container. The table is free to be as
  wide as its content, and the user swipes left/right to see all columns.

---

### Stock page — card heights on mobile

**Problem:** `h-full` on the page root clamped the entire layout to the viewport height on mobile.
The chart and news feed received near-zero height when stacked.

**Fix in `stocks/[symbol]/page.tsx`:**

```tsx
// Before: h-full on root, flex-1 min-h-0 on wrappers — all relative to viewport
// After: explicit heights on mobile, h-full only at lg breakpoint

<div className="flex flex-col gap-3 lg:h-full">
  ...
  <div className="h-72 lg:flex-1 lg:min-h-0">   {/* chart */}
  <div className="h-96 lg:h-full lg:min-h-0">   {/* news */}
```

- `lg:h-full` on the root — fixed height only on desktop where everything fits side by side.
- `h-72` (288px) on the chart wrapper — concrete height on mobile so the chart is visible.
- `h-96` (384px) on the news wrapper — readable height on mobile with internal scroll.

---

### StockChart — padding, axis, tick density

**Problem:** `p-8` padding was too wide on mobile, the Y axis took 60px from the left, and the X
axis showed too many labels for the small chart width.

**Fixes in `StockChart.tsx`:**

**Padding:** `p-8` → `p-4 lg:p-8`

**Mobile detection:**
```tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
}, []);
```

Checks `window.innerWidth` on mount and on every resize. The `< 768` threshold matches Tailwind's
`md` breakpoint. Starts as `false` (SSR-safe). The cleanup removes the listener on unmount.

**X axis tick interval — mobile vs desktop:**
```tsx
function getMobileTickInterval(resolution: Resolution): number {
    const intervals: Record<Resolution, number> = {
        "1W": 1,   // every 2nd label → ~2-3 visible
        "1M": 6,   // every 7th label → ~3 visible
        "3M": 20,  // every 21st label → ~3 visible
        "1Y": 60,  // every 61st label → ~4 visible
    }
    return intervals[resolution]
}

// Used on XAxis:
interval={isMobile ? getMobileTickInterval(resolution) : getTickInterval(resolution)}
padding={{ left: 15, right: 12 }}
```

The goal is 3–4 visible x-axis labels on mobile. The `padding` prevents the first and last labels
from being clipped at the chart edges.

**Y axis — narrower and right-aligned on mobile:**
```tsx
orientation={isMobile ? "right" : "left"}
width={isMobile ? 48 : 60}
```

Moving the Y axis to the right on mobile gives the chart the full left edge. `width: 48` (vs 60)
is enough for labels like `$182` at 11px font size, recovering 12px of horizontal chart space.

---

## 6. Why No ErrorBoundary or Suspense

**Suspense** is only meaningful when data fetching is done with React Server Components using
`async/await`. All data fetching in BullStack is client-side via React Query, which manages its
own `isLoading` state. Suspense has no effect on React Query's standard query mode and was removed.

**ErrorBoundary** catches JavaScript runtime errors during rendering. React Query's `isError` flag
already handles network and API errors — the actual failure mode in this app. TypeScript and null
guards (`?? []`, `?? 0`) prevent render-time crashes from undefined data. An ErrorBoundary would
add complexity with no practical benefit for this codebase.

Both patterns are valid in larger or differently architected apps — they are simply not the right
tool for how BullStack is built.

---

## 7. Summary of All Changed Files

| File | Status | What changed |
|---|---|---|
| `app/globals.css` | Modified | Added `@keyframes shimmer` + `.shimmer` CSS class |
| `components/ui/Skeleton.tsx` | **New** | Primitive shimmer block component |
| `components/layout/BottomNav.tsx` | **New** | Mobile bottom tab navigation bar |
| `components/layout/Sidebar.tsx` | Modified | `hidden md:flex` — hidden on mobile |
| `app/(dashboard)/layout.tsx` | Modified | Added `<BottomNav />`, `pb-20 md:pb-4`, `overflow-y-auto md:overflow-hidden` on main |
| `app/(dashboard)/dashboard/page.tsx` | Modified | Removed unused `async`, removed Suspense wrappers |
| `components/layout/Topbar.tsx` | Modified | Logo hidden on mobile, search bar fills width, tighter padding |
| `components/stock/StockSearchBar.tsx` | Modified | `w-96` → `w-full md:w-96` |
| `components/watchlist/WatchlistTable.tsx` | Modified | Added `WatchlistSkeleton` |
| `components/watchlist/WatchlistWidget.tsx` | Modified | Added `WatchlistWidgetSkeleton` |
| `components/portfolio/HoldingTable.tsx` | Modified | Added `HoldingsSkeleton`, added `overflow-x-auto` wrapper |
| `components/portfolio/PortfolioSummaryCard.tsx` | Modified | Added `SummarySkeleton` |
| `components/portfolio/PortfolioWidget.tsx` | Modified | Added `PortfolioWidgetSkeleton` |
| `components/news/NewsWidget.tsx` | Modified | Added `NewsWidgetSkeleton` |
| `components/stock/StockQuoteCard.tsx` | Modified | Added `QuoteSkeleton` |
| `components/stock/StockChart.tsx` | Modified | Added `StockNewsFeedSkeleton`, `isMobile` detection, responsive padding/axis/ticks |
| `components/stock/StockNewsFeed.tsx` | Modified | Added `StockNewsFeedSkeleton` |
| `app/(dashboard)/news/page.tsx` | Modified | Added `NewsSkeleton` |
| `app/(dashboard)/stocks/[symbol]/page.tsx` | Modified | Fixed card heights for mobile — `h-72` chart, `h-96` news, `lg:h-full` on root |

**2 new files, 17 files modified.**

---

## 8. Patterns Introduced in Phase 7

### The Skeleton Co-location Pattern

Every component defines its own skeleton function in the same file, directly above the main export:

```
ComponentSkeleton()   ← private, not exported, same file
MainComponent()       ← exported, returns <ComponentSkeleton /> when isLoading is true
```

The skeleton needs to mirror the real layout exactly, so it must be maintained alongside it. If you
add a column to the holdings table, you update the skeleton in the same edit. Co-locating them makes
this impossible to forget.

### The Breakpoint Handoff Pattern

Desktop and mobile navigation are separate components, each exclusively visible at their breakpoint:

```tsx
// Sidebar — desktop only
<aside className="hidden md:flex ...">

// BottomNav — mobile only
<nav className="flex md:hidden ...">
```

Neither component knows about the other. They share the same nav destinations array but are
completely independent implementations — simpler to read, modify, and reason about separately.

### Mobile-First Explicit Heights

For components that use `h-full` / `flex-1` on desktop (relying on a fixed-height parent), mobile
requires explicit heights instead:

```tsx
<div className="h-72 lg:flex-1 lg:min-h-0">
```

`h-full` and `flex-1` only work when the parent has a defined height. On mobile where the page
scrolls freely, there is no fixed height to distribute — so explicit pixel heights are needed to
give the component a visible size.
