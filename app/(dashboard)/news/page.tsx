"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarketNews } from "@/lib/api"
import NewsCard from "@/components/news/NewsCard"
import { Skeleton } from "@/components/ui/Skeleton"

function NewsSkeleton() {
    return (
        <div className="card p-6 flex flex-col flex-1 min-h-0">
            <Skeleton className="h-5 w-36 mb-6" />
            <div className="divide-y divide-surface-100">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                        <div className="min-w-0 flex-1 space-y-2">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                        <Skeleton className="h-16 w-24 shrink-0 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function NewsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["market-news"],
        queryFn: fetchMarketNews,
    })

    if (isLoading) {
        return (
            <div className="h-full flex flex-col">
                <NewsSkeleton />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">

            {isError && (
                <div className="card p-6">
                    <p className="text-sm text-down">Failed to load news. Please try again later.</p>
                </div>
            )}

            {!isError && data?.length === 0 && (
                <div className="card p-6">
                    <p className="text-sm text-surface-500">No news available right now.</p>
                </div>
            )}

            {!isError && data && data.length > 0 && (
                <div className="card flex flex-col flex-1 min-h-0 p-6">
                    <h2 className="mb-4 text-md font-semibold text-white">Market News</h2>
                    <div className="divide-y divide-surface-100 overflow-y-auto flex-1 min-h-0">
                        {data.map((article) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
