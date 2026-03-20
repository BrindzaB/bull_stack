"use client"

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Link from "next/link";

export default function PortfolioWidget() {
  const { holdings, summary, isLoading } = usePortfolio();

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-surface-900">Portfolio</h2>
        <Link href="/portfolio" className="text-xs text-brand-600">
          View all →
        </Link>
      </div>

      {isLoading && <p className="text-sm text-surface-500">Loading...</p>}

      {!isLoading && holdings.length === 0 && (
        <p className="text-sm text-surface-500">No holdings yet.</p>
      )}

      {!isLoading && holdings.length > 0 && (
        <>
          <div className="divide-y divide-surface-100">
            {holdings.slice(0, 3).map((holding) => {
              const isGain = holding.pnl >= 0;
              return (
                <div key={holding.id} className="flex items-center justify-between py-2.5">
                  <span className="num font-semibold text-surface-900">{holding.symbol}</span>
                  <div className="text-right">
                    <p className="num text-sm font-medium text-surface-800">
                      {formatCurrency(holding.currentValue)}
                    </p>
                    <p className={`num text-xs ${isGain ? "text-up" : "text-down"}`}>
                      {formatPercent(holding.pnlPercent)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-4">
            <div>
              <p className="section-label text-brand-700">Total Value</p>
              <p className="num mt-0.5 text-sm font-semibold text-surface-900">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="section-label text-brand-700">Total Return</p>
              <p className={`num mt-0.5 text-sm font-semibold ${summary.totalPnL >= 0 ? "text-up" : "text-down"}`}>
                {formatPercent(summary.totalPnLPercent)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}