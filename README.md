# Quantara — Frontend

React + Vite frontend for the Quantara NSE stock market dashboard.

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| TypeScript | 6 | Type safety |
| Tailwind CSS | 3 | Utility-first styling |
| Framer Motion | 12 | Animations |
| lightweight-charts | 5 | Candlestick / sparkline charts |
| Zustand | 5 | Auth state |
| React Router | v7 | Client-side routing |
| Axios | — | API calls |

## Prerequisites

- Node.js 20+
- The backend running at `http://localhost:4000` (see `quantara-backend/`)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your env file from the example
cp .env.example .env
# Then fill in your VITE_LOGO_DEV_KEY (get one at https://logo.dev)

# 3. Start the dev server
npm run dev
```

App runs at **http://localhost:5173**.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_LOGO_DEV_KEY` | Yes | Logo.dev public API key for company logos |

> All variables must be prefixed with `VITE_` for Vite to expose them in the browser.

## Available Scripts

```bash
npm run dev        # Start Vite dev server (HMR)
npm run build      # Type-check + production build → dist/
npm run lint       # ESLint
npx tsc --noEmit   # Type-check without emitting
```

## Project Structure

```
src/
  app/
    router.tsx          # All routes (createBrowserRouter)
  components/
    charts/
      StockDetailChart.tsx   # Candlestick chart with timeframe switcher
      Sparkline.tsx
      MarketOverviewChart.tsx
    dashboard/
    layout/
      Topbar.tsx             # Fixed top bar (height: 86px)
      Sidebar.tsx
    markets/
      TickerStrip.tsx        # Auto-scrolling ticker
      IndicesTable.tsx       # Sortable/filterable NSE stock table
      MarketMovers.tsx       # Top Gainers / Losers / Most Active
      SectorHeatmap.tsx      # Sector performance tiles
      StockSidePanel.tsx     # Fixed right-side detail panel
    ui/
      StockAvatar.tsx        # Company logo with text fallback
  data/
    nseStocks.ts             # Master NSE symbol + name list
    stockDomains.ts          # Symbol → domain map (for logos)
    stockDataGenerator.ts    # Seeded deterministic price/OHLC data
    marketsData.ts           # Extended data: sector, mkt cap, P/E, EPS
  pages/
    Dashboard.tsx
    Markets.tsx
    StockDetail.tsx          # /markets/:symbol
    Watchlist.tsx
    Portfolio.tsx
    Settings.tsx
    Login.tsx
    Signup.tsx
  store/
    authStore.ts             # Zustand auth store
  lib/
    api.ts                   # Axios instance with JWT interceptor
```

## Routes

| Path | Page | Auth |
|---|---|---|
| `/` | Dashboard | Protected |
| `/markets` | Markets | Protected |
| `/markets/:symbol` | Stock Detail | Protected |
| `/watchlist` | Watchlist | Protected |
| `/portfolio` | Portfolio | Protected |
| `/settings` | Settings | Protected |
| `/login` | Login | Public |
| `/signup` | Signup | Public |

## Data Layer

All stock prices, charts, and fundamentals are **deterministic mock data** — no external market data API is used. The same symbol always produces the same values across renders and sessions. Only auth and watchlist are backed by a real database.

## Notes

- Company logos are fetched from [Logo.dev](https://logo.dev). If the API is unavailable or the key is missing, `StockAvatar` falls back to a two-letter text avatar with a deterministic color.
- The topbar is exactly `h-[86px]` — any fixed overlays (e.g., `StockSidePanel`) must offset from `top-[86px]`.
