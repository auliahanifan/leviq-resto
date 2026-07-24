"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";

type TopItemsChartProps = {
  data: Array<{ name: string; qty: number; revenue: number }>;
};

function truncateName(name: string, maxLen = 20): string {
  return name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
}

export function TopItemsChart({ data }: TopItemsChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border p-4">
        <h3 className="mb-4 text-lg font-semibold">Menu Terlaris</h3>
        <div className="flex h-[300px] items-center justify-center text-muted">
          Belum ada data menu
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    displayName: truncateName(item.name),
  }));

  return (
    <div className="rounded-2xl border border-border p-4">
      <h3 className="mb-4 text-lg font-semibold">Menu Terlaris</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 16, right: 16 }}
        >
          <CartesianGrid
            stroke="#e3e6e0"
            strokeDasharray="3 3"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e3e6e0" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            formatter={(_value, _name, props) => {
              const count = Number(_value);
              const entry = props.payload as { name: string; revenue: number } | undefined;
              const name = entry?.name ?? "";
              const revenue = entry?.revenue ?? 0;
              return [`${count} pcs (${formatRupiah(revenue)})`, name];
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e3e6e0",
              fontSize: "14px",
            }}
          />
          <Bar
            dataKey="qty"
            fill="#00aa13"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
