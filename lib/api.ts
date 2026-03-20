import type { FinnhubQuote, FinnhubSearchResultItem, FinnhubSearchResult, FinnhubCandles, Resolution, FinnhubNewsItem } from "@/types/finnhub";
import type { PortfolioResponse } from "@/types/portfolio";
import { subWeeks, subMonths, subYears} from "date-fns";

// Watchlist 

export type WatchlistItem = {
  id: string;
  userId: string;
  symbol: string;
  createdAt: Date;
};

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const res = await fetch("/api/watchlist");
  if (!res.ok) throw new Error("Unable to fetch watchlist");
  return res.json();
}

export async function addToWatchlist(symbol: string) {
  const res = await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol }),
  });
  if (!res.ok) throw new Error("Unable to add symbol to watchlist");
  return res.json();
}

export async function removeFromWatchlist(symbol: string) {
  const res = await fetch(`/api/watchlist/${symbol}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Unable to remove symbol from watchlist");
}

// Portfolio

export type AddHoldingInput = {
  symbol: string;
  quantity: number;
  price: number;
  date: string;
};

export type UpdateHoldingInput = {
  id: string;
  quantity: number;
  averageCost: number;
};

export async function fetchPortfolio(): Promise<PortfolioResponse> {
  const res = await fetch("/api/portfolio");
  if (!res.ok) throw new Error("Unable to fetch portfolio");
  return res.json();
}

export async function addHolding(input: AddHoldingInput) {
  const res = await fetch("/api/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Unable to add holding");
  return res.json();
}

export async function updateHolding({ id, quantity, averageCost }: UpdateHoldingInput) {
  const res = await fetch(`/api/portfolio/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, averageCost }),
  });
  if (!res.ok) throw new Error("Unable to update holding");
  return res.json();
}

export async function removeHolding(id: string) {
  const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Unable to remove holding");
}

// Stocks

export async function fetchQuote(symbol: string): Promise<FinnhubQuote> {
    const res = await fetch(`/api/stocks/${symbol}/quote`);
    if (!res.ok) throw new Error("Failed to fetch quote");
    return res.json();
}

export async function searchStocks(q: string): Promise<FinnhubSearchResultItem[]> {
    const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error("Search failed");
    const data: FinnhubSearchResult = await res.json();
    return data.result;
}

function getRange(resolution: Resolution): {from: number, to: number} {
    const to = Math.floor(Date.now() / 1000);
    const now = new Date();
    const fromDate: Record<Resolution, Date> = {
        "1W": subWeeks(now, 1),
        "1M": subMonths(now, 1),
        "3M": subMonths(now, 3),
        "1Y": subYears(now, 1),
    };
    return { from: Math.floor(fromDate[resolution].getTime() / 1000), to};
}

export async function fetchCandles(symbol: string, resolution: Resolution): Promise<FinnhubCandles> {
    const { from, to } = getRange(resolution);
    const res = await fetch(`/api/stocks/${symbol}/candles?resolution=D&from=${from}&to=${to}`);
    if (!res.ok) throw new Error("Failed to fetch candles");
    return res.json();
}

// News

export async function fetchStockNews(symbol: string): Promise<FinnhubNewsItem[]> {
  const res = await fetch(`/api/stocks/${symbol}/news`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function fetchMarketNews(): Promise<FinnhubNewsItem[]> {
  const res = await fetch(`/api/stocks/market-news`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}