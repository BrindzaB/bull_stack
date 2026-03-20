import { format } from "date-fns"
import type { FinnhubNewsItem } from "@/types/finnhub"


interface NewsCardProps {
    article: FinnhubNewsItem
}

export default function NewsCard({ article }: NewsCardProps) {
    return (
        <div className="card p-5">
            <div className="flex gap-4">
                {article.image && (
                    <img
                        src={article.image}
                        alt={article.headline}
                        className="h-20 w-32 shrink-0 rounded-lg object-cover"
                    />
                )}
                <div className="min-w-0 flex-1">
                    <p className="section-label mb-1">
                        {article.source} · {format(new Date(article.datetime * 1000), "MMM d")}
                    </p>
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-surface-900 hover:text-brand-500 transition-colors line-clamp-2"
                    >
                        {article.headline}
                    </a>
                    <p className="mt-1 text-xs text-surface-500 line-clamp-2">
                        {article.summary}
                    </p>
                </div>
            </div>
        </div>
    )
}
