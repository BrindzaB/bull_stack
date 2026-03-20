"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarketNews } from "@/lib/api"
import NewsCard from "@/components/news/NewsCard"

export default function NewsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["market-news"],
        queryFn: fetchMarketNews,
    })

    return (
        <div className="h-full flex flex-col">

            {isLoading && (
                <div className="card p-6">
                    <p className="text-sm text-surface-500">Loading news...</p>
                </div>
            )}

            {isError && (
                <div className="card p-6">
                    <p className="text-sm text-down">Failed to load news.</p>
                </div>
            )}

            {!isLoading && !isError && data?.length === 0 && (
                <div className="card p-6">
                    <p className="text-sm text-surface-500">No news available right now.</p>
                </div>
            )}

            {!isLoading && !isError && data && data.length > 0 && (
                <div className="card flex flex-col flex-1 min-h-0 p-6">
                    <h2 className="mb-4 text-md font-semibold text-brand-700">Market News</h2>
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
