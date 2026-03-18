import { auth } from "@/lib/auth"
import WatchlistWidget from "@/components/watchlist/WatchlistWidget"

export default async function DashboardPage() {
    const session = await auth()

    return (
        <div>
            <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
            <p className="text-stone-500 mt-1">Welcome, {session?.user?.email}</p>
            <WatchlistWidget />
        </div>
    )
}