"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fromUnixTime, format} from "date-fns";
import { fetchCandles } from "@/lib/api";
import type { Resolution } from "@/types/finnhub";
import { Skeleton } from "@/components/ui/Skeleton";

function getTickInterval(resolution: Resolution): number {
    const intervals: Record<Resolution, number> = {
        "1W": 0,
        "1M": 3,
        "3M": 10,
        "1Y": 30,
    }
    return intervals[resolution]
}

function getMobileTickInterval(resolution: Resolution): number {
    const intervals: Record<Resolution, number> = {
        "1W": 1,
        "1M": 6,
        "3M": 20,
        "1Y": 60,
    }
    return intervals[resolution]
}

export default function StockChart({ symbol }: { symbol: string}) {
    const [resolution, setResolution] = useState<Resolution>("1M");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

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
    <div className="card p-4 lg:p-8 h-full flex flex-col bg-black/40">

      <div className="mb-6 flex gap-1.5 shrink-0">
        {resolutions.map((r) => (
          <button
            key={r}
            onClick={() => setResolution(r)}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors focus:outline-none ${
              resolution === r
                ? "bg-[rgba(34,211,238,0.15)] text-[#22d3ee]"
                : "text-white hover:text-white/80 hover:bg-white/[0.06]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex-1 min-h-0">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-down">Failed to load chart data.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#ffffff", fontFamily: "ui-monospace, monospace" }}
                tickLine={false}
                axisLine={false}
                interval={isMobile ? getMobileTickInterval(resolution) : getTickInterval(resolution)}
                padding={{ left: 15, right: 14 }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#ffffff", fontFamily: "ui-monospace, monospace" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                orientation={isMobile ? "right" : "left"}
                width={isMobile ? 48 : 60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(19,19,24,0.95)",
                  border: "1px solid rgba(72,71,77,0.30)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontFamily: "ui-monospace, monospace",
                  boxShadow: "0 8px 32px rgba(20,10,40,0.40)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.45)", marginBottom: "2px" }}
                itemStyle={{ color: "#f8f5fd" }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#ffffff"
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
