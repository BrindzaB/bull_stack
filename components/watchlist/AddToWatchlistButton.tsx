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
        <button onClick={handleClick}>
            <Star fill={isInWatchlist ? "currentColor" : "none"}/>
        </button>
    )
}