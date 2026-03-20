"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchMarketNews } from "@/lib/api"
import { format } from "date-fns"
import Link from "next/link"

export default function NewsWidget() {
    const { data, isLoading } = useQuery({
        queryKey: ["market-news"],
        queryFn: fetchMarketNews,
    })

    return (
        <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-md font-semibold text-brand-700">Market News</h2>
                <Link href="/news" className="text-xs text-brand-500 transition-colors hover:text-brand-700">
                    View all →
                </Link>
            </div>

            {isLoading && <p className="text-sm text-surface-500">Loading...</p>}

            {!isLoading && data && data.length === 0 && (
                <p className="text-sm text-surface-500">No news available.</p>
            )}

            {!isLoading && data && data.length > 0 && (
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
                            <p className="text-sm font-medium text-surface-900 line-clamp-1 group-hover:text-brand-500 transition-colors">
                                {article.headline}
                            </p>
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}
