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
        <tr>
            <td>{symbol}</td>
            <td>{data ? formatCurrency(data.c) : "-"}</td>
            <td className={isPositive ? "text-green-600" : "text-red-500"}>
                {data ? formatPercent(data.dp / 100): "-"}
            </td>
            <td>
                <button onClick={onRemove}>Remove</button>
            </td>
        </tr>
    )
}

export default function WatchlistTable() {
    const { watchlist, isLoading, removeFromWatchlist } = useWatchlist()

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <p className="text-sm text-stone-500">Loading quote...</p>
            </div>
        );
    }

    if (watchlist.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <p className="text-sm text-stone-500">Watchlist is currently empty.</p>
            </div>
        )
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Symbol</th><th>Price</th><th>Change</th><th></th>
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
    )
}