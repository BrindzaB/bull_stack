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
        <div ref={containerRef} className="relative w-full md:w-96">
            <input
                type="text"
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    setOpen(true);
                }}
                placeholder="Search stocks..."
                className="input-base"
            />
            {open && debouncedQuery.length >= 1 && (
                <ul className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-surface-200 bg-white shadow-dropdown animate-slide-down">
                    {isFetching && (
                        <li className="px-4 py-2.5 text-sm text-surface-500">Searching...</li>
                    )}
                    {!isFetching && results.length === 0 && (
                        <li className="px-4 py-2.5 text-sm text-surface-500">No results</li>
                    )}
                    {results.map((item) => (
                        <li
                            key={item.symbol}
                            onMouseDown={() => handleSelect(item.symbol)}
                            className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-surface-50"
                        >
                            <span className="num font-semibold text-surface-900">{item.symbol}</span>
                            <span className="ml-3 truncate text-xs text-surface-500">{item.description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
