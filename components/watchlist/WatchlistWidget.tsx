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
        <div className="flex items-center justify-between py-2.5">
            <span className="num font-semibold text-surface-900">{symbol}</span>
            <div className="text-right">
                <p className="num text-sm font-medium text-surface-800">
                    {data ? formatCurrency(data.c) : "—"}
                </p>
                <p className={`num text-xs ${isPositive ? "text-up" : "text-down"}`}>
                    {data ? `${isPositive ? "+" : ""}${data.dp.toFixed(2)}%` : "—"}
                </p>
            </div>
        </div>
    )
}

export default function WatchlistWidget() {
    const { watchlist, isLoading } = useWatchlist()

    return (
        <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-surface-900">Watchlist</h2>
                <Link href="/watchlist" className="text-xs text-indigo-500 transition-colors hover:text-indigo-700">
                    View all →
                </Link>
            </div>

            {isLoading && <p className="text-sm text-surface-500">Loading...</p>}

            {!isLoading && watchlist.length === 0 && (
                <p className="text-sm text-surface-500">No stocks in your watchlist yet.</p>
            )}

            {!isLoading && watchlist.length > 0 && (
                <div className="divide-y divide-surface-100">
                    {watchlist.slice(0, 5).map((item) => (
                        <WatchlistWidgetRow key={item.symbol} symbol={item.symbol} />
                    ))}
                </div>
            )}
        </div>
    )
}
