"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarketNews } from "@/lib/api"
import { format } from "date-fns"
import Link from "next/link"
import { Skeleton } from "@/components/ui/Skeleton"

function NewsWidgetSkeleton() {
    return (
        <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-md font-semibold text-brand-500">Market News</h2>
                <Link href="/news" className="text-xs text-brand-500 transition-colors hover:text-brand-300">
                    View all →
                </Link>
            </div>
            <div className="divide-y divide-surface-100">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="py-2.5 space-y-1.5">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function NewsWidget() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["market-news"],
        queryFn: fetchMarketNews,
    })

    if (isLoading) return <NewsWidgetSkeleton />

    return (
        <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-md font-semibold text-white">Market News</h2>
                <Link href="/news" className="text-xs text-brand-500 transition-colors hover:text-brand-300">
                    View all →
                </Link>
            </div>

            {isError && (
                <p className="text-sm text-down">Failed to load news.</p>
            )}

            {!isError && data && data.length === 0 && (
                <p className="text-sm text-surface-500">No news available.</p>
            )}

            {!isError && data && data.length > 0 && (
                <div className="divide-y divide-surface-100">
                    {data.slice(0, 5).map((article) => (
                        <a
                            key={article.id}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block py-2.5 group"
                        >
                            <p className="section-label mb-0.5">
                                {article.source} · {format(new Date(article.datetime * 1000), "MMM d")}
                            </p>
                            <p className="text-sm font-medium text-surface-900 line-clamp-1 group-hover:text-brand-100 transition-colors">
                                {article.headline}
                            </p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
