"use client"

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { searchStocks } from "@/lib/api";


export default function StockSearchBar() {
    const [input, setInput] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(input.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [input]);

    const { data: results = [], isFetching } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: () => searchStocks(debouncedQuery),
        enabled: debouncedQuery.length >= 1,
    });

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(symbol: string) {
        setInput("");
        setOpen(false);
        router.push(`/stocks/${symbol}`);
    }

    return (
        <div ref={containerRef} className="relative w-64">
        <input
            type="text"
            value={input}
            onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
            }}
            placeholder="Search stocks..."
            className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        {open && debouncedQuery.length >= 1 && (
            <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {isFetching && (
                <li className="px-4 py-2 text-sm text-stone-500">Searching...</li>
            )}
            {!isFetching && results.length === 0 && (
                <li className="px-4 py-2 text-sm text-stone-500">No results</li>
            )}
            {results.map((item) => (
                <li
                key={item.symbol}
                onMouseDown={() => handleSelect(item.symbol)}
                className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm hover:bg-stone-50"
                >
                <span className="font-medium text-stone-800">{item.symbol}</span>
                <span className="ml-2 truncate text-stone-500">{item.description}</span>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}