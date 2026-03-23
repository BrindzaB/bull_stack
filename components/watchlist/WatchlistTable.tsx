"use client"

import { useQuery } from "@tanstack/react-query";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { FinnhubQuote } from "@/types/finnhub";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { fetchQuote } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

const ghostRow = { borderBottom: '1px solid rgba(200,200,200,0.1)' }

function WatchlistRow({ symbol, onRemove }: { symbol: string, onRemove: () => void}) {
    const { data } = useQuery<FinnhubQuote>({
        queryKey: ["quote", symbol],
        queryFn: () => fetchQuote(symbol),
    });
    const router = useRouter();
    const isPositive = (data?.dp ?? 0) >= 0;

    return (
        <tr className="group transition-colors hover:bg-white/[0.04] cursor-pointer"
            style={ghostRow}
            onClick={() => router.push(`/stocks/${symbol}`)}>
            <td className="py-3.5 pl-6 pr-4">
                <span className="num font-semibold text-[#f8f5fd]">{symbol}</span>
            </td>
            <td className="py-3.5 px-4">
                <span className="num text-sm text-white/80">
                    {data ? formatCurrency(data.c) : "—"}
                </span>
            </td>
            <td className="py-3.5 px-4">
                {data ? (
                    <span className={isPositive ? "badge-up" : "badge-down"}>
                        {formatPercent(data.dp)}
                    </span>
                ) : (
                    <span className="text-sm text-white/40">—</span>
                )}
            </td>
            <td className="py-3.5 pl-4 pr-6 text-right">
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="rounded-md px-2 py-1 text-xs font-medium text-white/40
                               opacity-0 transition-all
                               hover:bg-[rgba(251,113,133,0.10)] hover:text-[#fb7185]
                               group-hover:opacity-100"
                >
                    Remove
                </button>
            </td>
        </tr>
    )
}

const theadRow = { borderBottom: '1px solid rgba(200,200,200,0.1)' }

function WatchlistSkeleton() {
    return (
        <div className="card overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-white/[0.03]" style={theadRow}>
                        <th className="py-3 pl-6 pr-4 text-left"><span className="section-label">Symbol</span></th>
                        <th className="py-3 px-4 text-left"><span className="section-label">Price</span></th>
                        <th className="py-3 px-4 text-left"><span className="section-label">Change</span></th>
                        <th className="py-3 pl-4 pr-6" />
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} style={ghostRow}>
                            <td className="py-3.5 pl-6 pr-4"><Skeleton className="h-4 w-14" /></td>
                            <td className="py-3.5 px-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="py-3.5 px-4"><Skeleton className="h-5 w-16 rounded-md" /></td>
                            <td className="py-3.5 pl-4 pr-6" />
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default function WatchlistTable() {
    const { watchlist, isLoading, removeFromWatchlist } = useWatchlist()

    if (isLoading) return <WatchlistSkeleton />

    if (watchlist.length === 0) {
        return (
            <div className="card p-8">
                <p className="text-sm text-white/50">Watchlist is currently empty.</p>
            </div>
        )
    }

    return (
        <div className="card overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-white/10" style={theadRow}>
                        <th className="py-3 pl-6 pr-4 text-left"><span className="section-label">Symbol</span></th>
                        <th className="py-3 px-4 text-left"><span className="section-label">Price</span></th>
                        <th className="py-3 px-4 text-left"><span className="section-label">Change</span></th>
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
