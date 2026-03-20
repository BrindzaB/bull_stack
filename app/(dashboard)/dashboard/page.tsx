import { auth } from "@/lib/auth"
import WatchlistWidget from "@/components/watchlist/WatchlistWidget"
import PortfolioWidget from "@/components/portfolio/PortfolioWidget"
import NewsWidget from "@/components/news/NewsWidget"

export default async function DashboardPage() {
    const session = await auth()

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <WatchlistWidget />
                <PortfolioWidget />
            </div>
            <div>
                <NewsWidget />
            </div>
        </div>
    )
}