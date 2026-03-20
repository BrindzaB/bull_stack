
import { cache } from "./cache"
import type { FinnhubQuote, FinnhubCompanyProfile, FinnhubSearchResult, FinnhubNewsItem } from "@/types/finnhub"
import {format, subDays} from "date-fns"

const BASE_URL = "https://finnhub.io/api/v1"

export async function getQuote(symbol: string): Promise<FinnhubQuote> {
    const cacheKey = `quote:${symbol}`;
    const cached = cache.get<FinnhubQuote>(cacheKey);

    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
    const data: FinnhubQuote = await res.json();
    cache.set(cacheKey, data, 60_000);

    return data
}

export async function getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile> {
    const cacheKey = `profile:${symbol}`;
    const cached = cache.get<FinnhubCompanyProfile>(cacheKey);

    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
    const data: FinnhubCompanyProfile = await res.json();
    cache.set(cacheKey, data, 24 * 60 * 60_000);

    return data;
}

export async function getSymbolSearch(query: string): Promise<FinnhubSearchResult> {
    const cacheKey = `search:${query}`
    const cached = cache.get<FinnhubSearchResult>(cacheKey);

    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/search?q=${query}&token=${process.env.FINNHUB_API_KEY}`)
    const data: FinnhubSearchResult = await res.json();
    cache.set(cacheKey, data, 5 * 60_000)

    return data;
}

export async function getStockNews(symbol: string): Promise<FinnhubNewsItem[]> {
    const cacheKey = `news:${symbol}`;
    const cached = cache.get<FinnhubNewsItem[]>(cacheKey);

    if (cached) return cached;

    const to = format(new Date(), "yyyy-MM-dd");
    const from = format(subDays(new Date(), 7), "yyyy-MM-dd");

    const res = await fetch(`${BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`);
    const data: FinnhubNewsItem[] = await res.json();
    cache.set(cacheKey, data, 15 * 60_000);
    return data;
}

export async function getMarketNews(): Promise<FinnhubNewsItem[]> {
    const cacheKey = "market-news";
    const cached = cache.get<FinnhubNewsItem[]>(cacheKey);

    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/news?category=general&token=${process.env.FINNHUB_API_KEY}`);
    const data: FinnhubNewsItem[] = await res.json();
    cache.set(cacheKey, data, 15 * 60_000);
    return data;
}