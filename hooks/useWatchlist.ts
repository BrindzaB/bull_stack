"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type WatchlistItem = {
    id: string,
    userId: string,
    symbol: string,
    createdAt: Date,
}

async function fetchWatchlist(): Promise<WatchlistItem[]> {
    const res = await fetch("/api/watchlist");
    if (!res.ok) throw new Error("Unable to fetch watchlist");
    return res.json();
}

async function addSymbol(symbol:string) {
    const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({symbol})
    });
    if (!res.ok) throw new Error("Unable to add symbol to watchlist");
    return res.json();
}

async function removeSymbol(symbol: string) {
    const res = await fetch(`/api/watchlist/${symbol}`, {method: "DELETE"});
    if (!res.ok) throw new Error("Unable to delete symbol");
}

export function useWatchlist() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ["watchlist"],
        queryFn: fetchWatchlist
    });

    const addMutation = useMutation({
        mutationFn: addSymbol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] })
        }
    });

    const removeMutation = useMutation({
        mutationFn: removeSymbol,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watchlist"] })
        }
    });

    return {
        watchlist: query.data ?? [],
        isLoading: query.isLoading,
        addToWatchlist: addMutation.mutate,
        removeFromWatchlist: removeMutation.mutate,
    }
}