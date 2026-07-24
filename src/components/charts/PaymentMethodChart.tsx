"use client";

import {
  PieChart,
  Pie,
  Sector,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PieSectorShapeProps } from "recharts";

type PaymentMethodChartProps = {
  data: { tunai: number; kartu: number };
};

const colors = ["#00aa13", "#e3e6e0"];

function ColoredSector(props: PieSectorShapeProps) {
  return <Sector {...props} fill={colors[props.index % colors.length]} />;
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const total = data.tunai + data.kartu;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-border p-4">
        <h3 className="mb-4 text-lg font-semibold">Metode Pembayaran</h3>
        <div className="flex h-[300px] items-center justify-center text-muted">
          Belum ada data pembayaran
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Tunai", value: data.tunai },
    { name: "Kartu", value: data.kartu },
  ];

  return (
    <div className="rounded-2xl border border-border p-4">
      <h3 className="mb-4 text-lg font-semibold">Metode Pembayaran</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            shape={ColoredSector}
          />
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value);
              return [`${v} pesanan (${total > 0 ? Math.round((v / total) * 100) : 0}%)`, String(name)];
            }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e3e6e0",
              fontSize: "14px",
            }}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ color: "#6b7280", fontSize: "14px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
