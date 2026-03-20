"use client"

import { useQuery } from "@tanstack/react-query";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { FinnhubQuote } from "@/types/finnhub";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { fetchQuote } from "@/lib/api";

function WatchlistRow({ symbol, onRemove }: { symbol: string, onRemove: () => void}) {
    const { data } = useQuery<FinnhubQuote>({
        queryKey: ["quote", symbol],
        queryFn: () => fetchQuote(symbol),
    });

    const isPositive = (data?.dp ?? 0) >= 0;

    return (
        <tr className="group border-b border-surface-100 transition-colors hover:bg-surface-50">
            <td className="py-3.5 pl-6 pr-4">
                <span className="num font-semibold text-surface-900">{symbol}</span>
            </td>
            <td className="py-3.5 px-4">
                <span className="num text-sm text-surface-800">
                    {data ? formatCurrency(data.c) : "—"}
                </span>
            </td>
            <td className="py-3.5 px-4">
                {data ? (
                    <span className={isPositive ? "badge-up" : "badge-down"}>
                        {isPositive ? "+" : ""}
                        {formatPercent(data.dp)}
                    </span>
                ) : (
                    <span className="text-sm text-surface-400">—</span>
                )}
            </td>
            <td className="py-3.5 pl-4 pr-6 text-right">
                <button
                    onClick={onRemove}
                    className="rounded-md px-2 py-1 text-xs font-medium text-surface-500
                               opacity-0 transition-all
                               hover:bg-rose-100 hover:text-rose-600
                               group-hover:opacity-100"
                >
                    Remove
                </button>
            </td>
        </tr>
    )
}

export default function WatchlistTable() {
    const { watchlist, isLoading, removeFromWatchlist } = useWatchlist()

    if (isLoading) {
        return (
            <div className="card p-8">
                <p className="text-sm text-surface-500">Loading watchlist...</p>
            </div>
        );
    }

    if (watchlist.length === 0) {
        return (
            <div className="card p-8">
                <p className="text-sm text-surface-500">Watchlist is currently empty.</p>
            </div>
        )
    }

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
                    {watchlist.map((item) => (
                        <WatchlistRow
                            key={item.symbol}
                            symbol={item.symbol}
                            onRemove={() => removeFromWatchlist(item.symbol)}/>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
