import WatchlistTable from "@/components/watchlist/WatchlistTable";

export default function WatchlistPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-stone-800">Watchlist</h1>
            <WatchlistTable />
        </div>
    )
}