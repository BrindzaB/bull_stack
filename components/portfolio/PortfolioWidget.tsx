"use client"

import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";

function PortfolioWidgetSkeleton() {
    return (
        <>
            <div className="divide-y divide-surface-100">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-2">
                        <Skeleton className="h-4 w-12" />
                        <div className="text-right space-y-1.5">
                            <Skeleton className="h-4 w-20 ml-auto" />
                            <Skeleton className="h-3 w-12 ml-auto" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-surface-100 pt-4">
                <div>
                    <Skeleton className="h-3 w-16 mb-1.5" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right">
                    <Skeleton className="h-3 w-20 mb-1.5 ml-auto" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                </div>
            </div>
        </>
    )
}

export default function PortfolioWidget() {
  const { holdings, summary, isLoading } = usePortfolio();

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-md font-semibold text-brand-500">Portfolio</h2>
        <Link href="/portfolio" className="text-xs text-brand-500 transition-colors hover:text-brand-300">
          View all →
        </Link>
      </div>

      {isLoading && <PortfolioWidgetSkeleton />}

      {!isLoading && holdings.length === 0 && (
        <p className="text-sm text-surface-500">No holdings yet.</p>
      )}

      {!isLoading && holdings.length > 0 && (
        <>
          <div className="divide-y divide-surface-100">
            {holdings.slice(0, 3).map((holding) => {
              const isGain = holding.pnl >= 0;
              return (
                <Link href={`/stocks/${holding.symbol}`} key={holding.id} className="flex items-center justify-between py-2.5 px-2 group hover:bg-brand-500/10 hover:rounded-xl">
                  <span className="num font-semibold text-surface-900 transition-colors group-hover:text-brand-700">{holding.symbol}</span>
                  <div className="text-right">
                    <p className="num text-sm font-medium text-surface-800">
                      {formatCurrency(holding.currentValue)}
                    </p>
                    <p className={`num text-xs ${isGain ? "text-up" : "text-down"}`}>
                      {formatPercent(holding.pnlPercent)}
                    </p>
                  </div>
                </Link>
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
