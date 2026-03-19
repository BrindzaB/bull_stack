"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchQuote } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";


export default function StockQuoteCard({ symbol }: { symbol: string }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["quote", symbol],
        queryFn: () => fetchQuote(symbol),
        refetchInterval: 60_000
    });

    if (isLoading) {
        return (
            <div className="card p-8">
                <p className="text-sm text-surface-500">Loading quote...</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="card p-8">
                <p className="text-sm text-down">Failed to load quote.</p>
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
