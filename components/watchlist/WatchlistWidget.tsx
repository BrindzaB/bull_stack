"use client"

import { useQuery } from "@tanstack/react-query";
import { useWatchlist } from "@/hooks/useWatchlist";
import { fetchQuote } from "@/lib/api";
import type { FinnhubQuote } from "@/types/finnhub";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

function WatchlistWidgetRow({symbol}: {symbol: string}) {
    const { data } = useQuery<FinnhubQuote>({
        queryKey: ["quote", symbol],
        queryFn: () => fetchQuote(symbol)
    })

    const isPositive = (data?.dp ?? 0) >= 0

    return (
        <div className="flex items-center justify-between py-2">
            <span className="font-medium text-stone-800">{symbol}</span>
            <div className="text-right">
                <p className="text-sm font-medium text-stone-800">
                    {data ? formatCurrency(data.c) : "—"}
                </p>
                <p className={`text-xs ${isPositive ? "text-green-600" : "text-red-500"}`}>
                    {data ? `${isPositive ? "+" : ""}${data.dp.toFixed(2)}%` : "—"}
                </p>
            </div>
        </div>
    )  
}

export default function WatchlistWidget() {
    const { watchlist, isLoading } = useWatchlist()

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-stone-800">Watchlist</h2>
                <Link href="/watchlist" className="text-sm text-stone-500 hover:text-stone-800">
                    View all →
                </Link>
            </div>

            {isLoading && <p className="text-sm text-stone-500">Loading...</p>}

            {!isLoading && watchlist.length === 0 && (
                <p className="text-sm text-stone-500">No stocks in your watchlist yet.</p>
            )}

            {!isLoading && watchlist.length > 0 && (
                <div className="divide-y divide-gray-100">
                    {watchlist.slice(0, 5).map((item) => (
                        <WatchlistWidgetRow key={item.symbol} symbol={item.symbol} />
                    ))}
                </div>
            )}
        </div>
    )
}