"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchStockNews } from "@/lib/api"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/Skeleton"

function StockNewsFeedSkeleton() {
    return (
        <div className="flex-1 divide-y divide-surface-100 -mx-6 px-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="py-3 space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
        </div>
    )
}

export default function StockNewsFeed({ symbol }: { symbol: string }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["news", symbol],
        queryFn: () => fetchStockNews(symbol),
    })

    return (
        <div className="card p-6 flex flex-col h-full min-h-0">
            <h2 className="text-sm font-semibold text-surface-900 mb-4 shrink-0">Recent News</h2>

            {isLoading && <StockNewsFeedSkeleton />}

            {isError && (
                <p className="text-sm text-down">Failed to load news.</p>
            )}

            {!isLoading && !isError && data?.length === 0 && (
                <p className="text-sm text-surface-500">No recent news for {symbol}.</p>
            )}

            {!isLoading && !isError && data && data.length > 0 && (
                <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-surface-100 -mx-6 px-6
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-surface-200
                    [&::-webkit-scrollbar-thumb]:rounded-full">
                    {data.map((article) => (
                        <a
                            key={article.id}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-3 group"
                        >
                            <p className="section-label mb-1">
                                {article.source} · {format(new Date(article.datetime * 1000), "MMM d")}
                            </p>
                            <p className="text-sm font-medium text-surface-900 line-clamp-2 group-hover:text-brand-500 transition-colors">
                                {article.headline}
                            </p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
