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
                    ? "border-[rgba(34,211,238,0.4)] bg-[rgba(34,211,238,0.1)] text-[#22d3ee] hover:bg-[rgba(34,211,238,0.18)]"
                    : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/30"
                }`}
        >
            <Star
                size={14}
                className={isInWatchlist ? "text-[#22d3ee]" : "text-white/40"}
                fill={isInWatchlist ? "currentColor" : "none"}
            />
            {isInWatchlist ? "Watching" : "Watch"}
        </button>
    )
}
