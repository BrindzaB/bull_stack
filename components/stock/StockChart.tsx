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
    <div className="rounded-2xl border border-gray-200 bg-white p-8">
      
      <div className="mb-6 flex gap-2">
        {resolutions.map((r) => (
          <button
            key={r}
            onClick={() => setResolution(r)}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              resolution === r
                ? "bg-gray-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center text-sm text-stone-500">
          Loading chart...
        </div>
      )}

      {isError && (
        <div className="flex h-64 items-center justify-center text-sm text-red-500">
          Failed to load chart.
        </div>
      )}

      {!isLoading && !isError && (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#111827" stopOpacity={0.40} />
                <stop offset="95%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              interval={getTickInterval(resolution)}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#111827"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}