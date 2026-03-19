"use client"

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function PortfolioSummaryCard() {
  const { summary, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-surface-500">Loading summary...</p>
      </div>
    );
  }

  const isGain = summary.totalPnL >= 0;

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-sm font-semibold text-surface-900">Portfolio Summary</h2>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">

        <div>
          <p className="section-label">Total Value</p>
          <p className="num mt-1 text-display-sm text-surface-900">
            {formatCurrency(summary.totalValue)}
          </p>
        </div>

        <div>
          <p className="section-label">Total Cost</p>
          <p className="num mt-1 text-display-sm text-surface-900">
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