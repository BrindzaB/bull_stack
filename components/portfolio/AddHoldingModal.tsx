"use client"

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePortfolio } from "@/hooks/usePortfolio";
import { searchStocks } from "@/lib/api";
import { X } from "lucide-react";

interface SymbolSearchProps {
    value: string;
    onChange: (symbol: string) => void;
}

function SymbolSearch({value, onChange}: SymbolSearchProps) {
    const [input, setInput] = useState(value);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInput(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(input.trim()), 300);
        return () => clearTimeout(timer);
    }, [input]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data: results = [], isFetching } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: () => searchStocks(debouncedQuery),
        enabled: debouncedQuery.length >= 1,
    });

    function handleSelect(symbol: string) {
        setInput(symbol);
        setOpen(false);
        onChange(symbol);
    }

    return (
        <div ref={containerRef} className="relative">
        <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.toUpperCase()); setOpen(true); }}
            placeholder="e.g. AAPL"
            className="input-base w-full"
        />
        {open && debouncedQuery.length >= 1 && (
            <ul className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl backdrop-blur-xl" style={{ background: 'rgba(30, 30, 30, 1.0)', borderColor: 'rgba(255,255,255,0.10)', boxShadow: '0 16px 48px rgba(0,0,20,0.50)' }}>
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

interface AddHoldingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddHoldingModal({ isOpen, onClose }: AddHoldingModalProps) {
  const { addHolding } = usePortfolio();

  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    addHolding({
      symbol,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      date,
    });

    setSymbol("");
    setQuantity("");
    setPrice("");
    setDate(new Date().toISOString().split("T")[0]);

    onClose(); // close modal optimistically — React Query will re-fetch in background
  }

  // Don't render anything if closed — keeps the DOM clean
  if (!isOpen) return null;

  const isValid = symbol && quantity && price && date;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="card w-full max-w-md p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-display-sm text-[#f8f5fd]">Add Holding</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-label mb-1.5 block">Symbol</label>
            <SymbolSearch value={symbol} onChange={setSymbol} />
          </div>

          <div>
            <label className="section-label mb-1.5 block">Shares</label>
            <input
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10"
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="section-label mb-1.5 block">Purchase Price (USD)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 150.00"
              className="input-base w-full"
            />
          </div>

          <div>
            <label className="section-label mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-base w-full"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Holding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}