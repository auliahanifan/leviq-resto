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

type PeakHoursChartProps = {
  data: number[];
};

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  const hasData = data.some((count) => count > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-border p-4">
        <h3 className="mb-4 text-lg font-semibold">Jam Sibuk</h3>
        <div className="flex h-[300px] items-center justify-center text-muted">
          Belum ada data jam sibuk
        </div>
      </div>
    );
  }

  const chartData = data.map((count, hour) => ({
    hour: hour.toString().padStart(2, "0"),
    count,
  }));

  return (
    <div className="rounded-2xl border border-border p-4">
      <h3 className="mb-4 text-lg font-semibold">Jam Sibuk</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid stroke="#e3e6e0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e3e6e0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            formatter={(_value, _name, props) => {
              const count = Number(_value);
              const entry = props.payload as { hour: string } | undefined;
              const h = parseInt(entry?.hour ?? "0");
              const nextH = (h + 1).toString().padStart(2, "0");
              return [`${count} pesanan`, `Pukul ${entry?.hour ?? "00"}:00 - ${nextH}:00`];
            }}
            labelFormatter={() => ""}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e3e6e0",
              fontSize: "14px",
            }}
          />
          <Bar
            dataKey="count"
            fill="#00aa13"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
