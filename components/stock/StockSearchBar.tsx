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
        <div ref={containerRef} className="relative w-full md:w-96 rounded-2xl bg-white/10">
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
                <ul className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-white/[0.3] shadow-dropdown backdrop-blur-xl animate-slide-down" style={{ background: 'rgba(30, 30, 30, 1.0)', borderColor: 'rgba(255,255,255,0.10)', boxShadow: '0 16px 48px rgba(0,0,20,0.50)' }}>
                    {isFetching && (
                        <li className="px-4 py-2.5 text-sm text-white/50">Searching...</li>
                    )}
                    {!isFetching && results.length === 0 && (
                        <li className="px-4 py-2.5 text-sm text-white/50">No results</li>
                    )}
                    {results.map((item) => (
                        <li
                            key={item.symbol}
                            onMouseDown={() => handleSelect(item.symbol)}
                            className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.06]"
                        >
                            <span className="num font-semibold text-[#f8f5fd]">{item.symbol}</span>
                            <span className="ml-3 truncate text-xs text-white/50">{item.description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
