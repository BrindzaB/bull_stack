"use client"

import { useQuery } from "@tanstack/react-query";
import { useWatchlist } from "@/hooks/useWatchlist";
import { fetchQuote } from "@/lib/api";
import type { FinnhubQuote } from "@/types/finnhub";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";

function WatchlistWidgetRow({symbol}: {symbol: string}) {
    const { data } = useQuery<FinnhubQuote>({
        queryKey: ["quote", symbol],
        queryFn: () => fetchQuote(symbol)
    })

    const isPositive = (data?.dp ?? 0) >= 0

    return (
        <Link href={`/stocks/${symbol}`} className="flex items-center justify-between py-2.5 px-2 group hover:bg-brand-500/10 hover:rounded-xl">
            <span className="num font-semibold text-surface-900 transition-colors group-hover:text-brand-700">{symbol}</span>
            <div className="text-right">
                <p className="num text-sm font-medium text-surface-800">
                    {data ? formatCurrency(data.c) : "—"}
                </p>
                <p className={`num text-xs ${isPositive ? "text-up" : "text-down"}`}>
                    {data ? `${isPositive ? "+" : ""}${data.dp.toFixed(2)}%` : "—"}
                </p>
            </div>
        </Link>
    )
}

function WatchlistWidgetSkeleton() {
    return (
        <div className="divide-y divide-surface-100">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-2">
                    <Skeleton className="h-4 w-12" />
                    <div className="text-right space-y-1.5">
                        <Skeleton className="h-4 w-16 ml-auto" />
                        <Skeleton className="h-3 w-12 ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function WatchlistWidget() {
    const { watchlist, isLoading } = useWatchlist()

    return (
        <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-md font-semibold text-white">Watchlist</h2>
                <Link href="/watchlist" className="text-xs text-brand-500 transition-colors hover:text-brand-300">
                    View all →
                </Link>
            </div>

            {isLoading && <WatchlistWidgetSkeleton />}

            {!isLoading && watchlist.length === 0 && (
                <p className="text-sm text-surface-500">No stocks in your watchlist yet.</p>
            )}

            {!isLoading && watchlist.length > 0 && (
                <div className="divide-y divide-surface-100">
                    {watchlist.slice(0, 4).map((item) => (
                        <WatchlistWidgetRow key={item.symbol} symbol={item.symbol} />
                    ))}
                </div>
            )}
        </div>
    )
}
