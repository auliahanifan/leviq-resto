"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";

type RevenueChartProps = {
  data: Array<{ date: string; revenue: number }>;
};

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00+07:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function formatAxisRupiah(value: number): string {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${value / 1_000}rb`;
  return `Rp ${value}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-4">
        <h3 className="mb-4 text-lg font-semibold">Pendapatan Harian</h3>
        <div className="flex h-[300px] items-center justify-center text-muted">
          Belum ada data pendapatan
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border p-4">
      <h3 className="mb-4 text-lg font-semibold">Pendapatan Harian</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#e3e6e0" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e3e6e0" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAxisRupiah}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value) => [formatRupiah(Number(value)), "Pendapatan"]}
            labelFormatter={(label) => formatShortDate(String(label))}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e3e6e0",
              fontSize: "14px",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#00aa13"
            strokeWidth={2}
            dot={{ r: 3, fill: "#00aa13" }}
            activeDot={{ r: 5, fill: "#00aa13" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
