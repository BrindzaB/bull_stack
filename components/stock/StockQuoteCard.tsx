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
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <p className="text-sm text-stone-500">Loading quote...</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
                <p className="text-sm text-red-500">Failed to load quote.</p>
            </div>
        );
    }

    const isPositive = data.dp >= 0;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <p className="text-sm font-medium text-stone-500">{symbol}</p>
            <p className="mt-1 text-4xl font-bold text-stone-800">{formatCurrency(data.c)}</p>
            <p className={`mt-1 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-500" }`}>
                {isPositive ? "+" : ""}{formatCurrency(data.d)} ({formatPercent(data.dp / 100)})
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="text-stone-500">Open</p>
                    <p className="font-medium text-stone-800">{formatCurrency(data.o)}</p>
                </div>
                <div>
                    <p className="text-stone-500">High</p>
                    <p className="font-medium text-stone-800">{formatCurrency(data.h)}</p>
                </div>
                <div>
                    <p className="text-stone-500">Low</p>
                    <p className="font-medium text-stone-800">{formatCurrency(data.l)}</p>
                </div>
            </div>
        </div>
    );
}



