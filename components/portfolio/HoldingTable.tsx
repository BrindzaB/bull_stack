"use client"

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

const ghostRow  = { borderBottom: '1px solid rgba(200,200,200,0.1)' }
const theadRow  = { borderBottom: '1px solid rgba(200,200,200,0.1)' }

function HoldingsSkeleton() {
  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.03]" style={theadRow}>
              <th className="py-3 pl-6 pr-4 text-left"><span className="section-label">Symbol</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Shares</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Avg Cost</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Current Price</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Value</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">P&amp;L $</span></th>
              <th className="py-3 pl-4 pr-6 text-right"><span className="section-label">P&amp;L %</span></th>
              <th className="py-3 pl-4 pr-6" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} style={ghostRow}>
                <td className="py-3.5 pl-6 pr-4"><Skeleton className="h-4 w-12" /></td>
                <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                <td className="py-3.5 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                <td className="py-3.5 pl-4 pr-6 text-right"><Skeleton className="h-5 w-14 rounded-md ml-auto" /></td>
                <td className="py-3.5 pl-4 pr-6" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HoldingsTable() {
  const { holdings, isLoading, removeHolding } = usePortfolio();
  const router = useRouter();

  if (isLoading) return <HoldingsSkeleton />;

  if (holdings.length === 0) {
    return (
      <div className="card p-8">
        <p className="text-sm text-white/50">No holdings yet. Add your first stock above.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/10" style={theadRow}>
              <th className="py-3 pl-6 pr-4 text-left"><span className="section-label">Symbol</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Shares</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Avg Cost</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Current Price</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">Value</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label">P&amp;L $</span></th>
              <th className="py-3 pl-4 pr-6 text-right"><span className="section-label">P&amp;L %</span></th>
              <th className="py-3 pl-4 pr-6" />
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const isGain = holding.pnl >= 0;

              return (
                <tr
                  key={holding.id}
                  className="group transition-colors hover:bg-white/[0.04] cursor-pointer"
                  style={ghostRow}
                  onClick={() => router.push(`/stocks/${holding.symbol}`)}
                >
                  <td className="py-3.5 pl-6 pr-4">
                    <span className="num font-semibold text-[#f8f5fd]">{holding.symbol}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-white/80">{holding.quantity}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-white/80">{formatCurrency(holding.averageCost)}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-white/80">
                      {holding.currentPrice > 0 ? formatCurrency(holding.currentPrice) : "—"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-white/80">{formatCurrency(holding.currentValue)}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className={`num text-sm font-medium ${isGain ? "text-up" : "text-down"}`}>
                      {isGain ? "+" : ""}{formatCurrency(holding.pnl)}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 pr-6 text-right">
                    <span className={isGain ? "badge-up" : "badge-down"}>
                      {formatPercent(holding.pnlPercent)}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 pr-6 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); removeHolding(holding.id)}}
                      className="rounded-md px-2 py-1 text-xs font-medium text-white/40
                                opacity-0 transition-all
                                hover:bg-[rgba(251,113,133,0.10)] hover:text-[#fb7185]
                                group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
