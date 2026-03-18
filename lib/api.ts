import type { FinnhubQuote, FinnhubSearchResultItem, FinnhubSearchResult } from "@/types/finnhub";
import { subWeeks, subMonths, subYears} from "date-fns";
import type { FinnhubCandles } from "@/types/finnhub";
import type { Resolution } from "@/types/finnhub";

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