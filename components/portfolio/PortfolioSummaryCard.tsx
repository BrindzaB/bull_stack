"use client"

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

function SummarySkeleton() {
  return (
    <div className="card p-6">
      <Skeleton className="h-5 w-36 mb-6" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioSummaryCard() {
  const { summary, isLoading } = usePortfolio();

  if (isLoading) return <SummarySkeleton />;

  const isGain = summary.totalPnL >= 0;

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-md font-semibold text-white">Portfolio Summary</h2>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">

        <div>
          <p className="section-label">Total Value</p>
          <p className="num mt-1 text-display-sm text-[#f8f5fd]">
            {formatCurrency(summary.totalValue)}
          </p>
        </div>

        <div>
          <p className="section-label">Total Cost</p>
          <p className="num mt-1 text-display-sm text-[#f8f5fd]">
            {formatCurrency(summary.totalCost)}
          </p>
        </div>

        <div>
          <p className="section-label">P&amp;L</p>
          <p className={`num mt-1 text-display-sm font-semibold ${isGain ? "text-up" : "text-down"}`}>
            {isGain ? "+" : ""}{formatCurrency(summary.totalPnL)}
          </p>
        </div>

        <div>
          <p className="section-label">Return</p>
          <p className={`num mt-1 text-display-sm font-semibold ${isGain ? "text-up" : "text-down"}`}>
            {formatPercent(summary.totalPnLPercent)}
          </p>
        </div>

      </div>
    </div>
  );
}
