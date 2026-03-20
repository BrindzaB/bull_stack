"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fromUnixTime, format} from "date-fns";
import { fetchCandles } from "@/lib/api";
import type { Resolution } from "@/types/finnhub";

function getTickInterval(resolution: Resolution): number {
    const intervals: Record<Resolution, number> = {
        "1W": 0,
        "1M": 1,
        "3M": 10,
        "1Y": 30,
    }
    return intervals[resolution]
}


export default function StockChart({ symbol }: { symbol: string}) {
    const [resolution, setResolution] = useState<Resolution>("1M");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["candles", symbol, resolution],
        queryFn: () => fetchCandles(symbol, resolution),
    });

    const chartData = data?.t?.map((timestamp, i) => ({
        date: format(fromUnixTime(timestamp), "MMM d"),
        price: data.c[i],
    })) ?? [];

    const resolutions: Resolution[] = ["1W", "1M", "3M", "1Y"];

    return (
    <div className="card p-8 h-full flex flex-col">

      <div className="mb-6 flex gap-1.5 shrink-0">
        {resolutions.map((r) => (
          <button
            key={r}
            onClick={() => setResolution(r)}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors focus:outline-none ${
              resolution === r
                ? "bg-brand-500 text-white"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-surface-500">Loading chart...</p>
        </div>
      )}

      {isError && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-down">Failed to load chart.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9e9890", fontFamily: "ui-monospace, monospace" }}
                tickLine={false}
                axisLine={false}
                interval={getTickInterval(resolution)}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#9e9890", fontFamily: "ui-monospace, monospace" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #dedad1",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontFamily: "ui-monospace, monospace",
                  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.10)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#79736b", marginBottom: "2px" }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                fill="url(#priceGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
