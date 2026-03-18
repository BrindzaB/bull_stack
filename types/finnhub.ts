
export interface FinnhubQuote {
    c: number;
    d: number;
    dp: number;
    h: number;
    l: number;
    o: number;
    pc: number;
    t: number;
}

export interface FinnhubCandles {
    s: "ok" | "no_data";
    c: number[];
    o: number[];
    h: number[];
    l: number[];
    v: number[];
    t: number[];
}

export interface FinnhubCompanyProfile {
    name: string;
    ticker: string;
    logo: string;
    country: string;
    currency: string;
    exchange: string;
    ipo: string;
    marketCapitalization: number;
    shareOutstanding: number;
    weburl: string;
    finnhubIndustry: string;
}

export interface FinnhubSearchResult {
    count: number;
    result: FinnhubSearchResultItem[];
}

export interface FinnhubSearchResultItem {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
}

export type Resolution = "1W" | "1M" | "3M" | "1Y";