"use client"

import { useWatchlist } from "@/hooks/useWatchlist";
import { Star } from "lucide-react";

export default function AddToWatchlistButton({symbol}: {symbol: string}) {
    const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

    const isInWatchlist = watchlist.some((item) => item.symbol === symbol);

    function handleClick() {
        if (isInWatchlist) {
            removeFromWatchlist(symbol);
        } else {
            addToWatchlist(symbol);
        }
    }

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all
                ${isInWatchlist
                    ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "border-surface-200 bg-white text-surface-600 hover:bg-surface-50 hover:border-surface-300"
                }`}
        >
            <Star
                size={14}
                className={isInWatchlist ? "text-amber-500" : "text-surface-400"}
                fill={isInWatchlist ? "currentColor" : "none"}
            />
            {isInWatchlist ? "Watching" : "Watch"}
        </button>
    )
}
