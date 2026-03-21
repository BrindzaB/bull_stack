"use client"

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

function HoldingsSkeleton() {
  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-brand-500/10">
              <th className="py-3 pl-6 pr-4 text-left"><span className="section-label text-brand-700">Symbol</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label text-brand-700">Shares</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label text-brand-700">Avg Cost</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label text-brand-700">Current Price</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label text-brand-700">Value</span></th>
              <th className="py-3 px-4 text-right"><span className="section-label text-brand-700">P&amp;L $</span></th>
              <th className="py-3 pl-4 pr-6 text-right"><span className="section-label text-brand-700">P&amp;L %</span></th>
              <th className="py-3 pl-4 pr-6" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-surface-100">
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
        <p className="text-sm text-surface-500">No holdings yet. Add your first stock above.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-brand-500/10">
              <th className="py-3 pl-6 pr-4 text-left">
                <span className="section-label text-brand-700">Symbol</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className="section-label text-brand-700">Shares</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className="section-label text-brand-700">Avg Cost</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className="section-label text-brand-700">Current Price</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className="section-label text-brand-700">Value</span>
              </th>
              <th className="py-3 px-4 text-right">
                <span className="section-label text-brand-700">P&amp;L $</span>
              </th>
              <th className="py-3 pl-4 pr-6 text-right">
                <span className="section-label text-brand-700">P&amp;L %</span>
              </th>
              <th className="py-3 pl-4 pr-6" />
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const isGain = holding.pnl >= 0;

              return (
                <tr
                  key={holding.id}
                  className="group border-b border-surface-100 transition-colors hover:bg-surface-50 cursor-pointer"
                  onClick={() => router.push(`/stocks/${holding.symbol}`)}
                >
                  <td className="py-3.5 pl-6 pr-4">
                    <span className="num font-semibold text-surface-900">{holding.symbol}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-surface-800">{holding.quantity}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-surface-800">
                      {formatCurrency(holding.averageCost)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-surface-800">
                      {holding.currentPrice > 0 ? formatCurrency(holding.currentPrice) : "—"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="num text-sm text-surface-800">
                      {formatCurrency(holding.currentValue)}
                    </span>
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
                      className="rounded-md px-2 py-1 text-xs font-medium text-surface-500
                                opacity-0 transition-all
                                hover:bg-rose-100 hover:text-rose-600
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
