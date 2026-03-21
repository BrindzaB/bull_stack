"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchQuote } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

function QuoteSkeleton() {
    return (
        <div className="card p-8">
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-9 w-40 mb-3" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-surface-100 pt-5">
                {["Open", "High", "Low"].map((label) => (
                    <div key={label}>
                        <p className="section-label">{label}</p>
                        <Skeleton className="mt-1 h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function StockQuoteCard({ symbol }: { symbol: string }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["quote", symbol],
        queryFn: () => fetchQuote(symbol),
        refetchInterval: 60_000
    });

    if (isLoading) return <QuoteSkeleton />;

    if (isError || !data) {
        return (
            <div className="card p-8">
                <p className="text-sm text-down">Failed to load quote for {symbol}.</p>
            </div>
        );
    }

    const isPositive = data.dp >= 0;

    return (
        <div className="card p-8">
            <p className="section-label">{symbol}</p>
            <p className="mt-1 text-display-md num text-surface-900">{formatCurrency(data.c)}</p>
            <div className="mt-2">
                <span className={isPositive ? "badge-up" : "badge-down"}>
                    {isPositive ? "+" : ""}{formatCurrency(data.d)} ({formatPercent(data.dp)})
                </span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-surface-100 pt-5">
                <div>
                    <p className="section-label">Open</p>
                    <p className="num mt-1 text-sm font-medium text-surface-800">{formatCurrency(data.o)}</p>
                </div>
                <div>
                    <p className="section-label">High</p>
                    <p className="num mt-1 text-sm font-medium text-surface-800">{formatCurrency(data.h)}</p>
                </div>
                <div>
                    <p className="section-label">Low</p>
                    <p className="num mt-1 text-sm font-medium text-surface-800">{formatCurrency(data.l)}</p>
                </div>
            </div>
        </div>
    );
}
