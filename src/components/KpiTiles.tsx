import { formatRupiah } from "@/lib/format";

type MetricValues = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  bestSelling: { name: string; qty: number } | null;
  popularPayment: string;
  busiestHour: number;
};

type KpiTilesProps = {
  current: MetricValues;
  comparison: MetricValues;
  prevPeriodLabel: string;
};

function percentChange(current: number, previous: number): string | null {
  if (previous === 0) return current > 0 ? null : null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function changeColor(current: number, previous: number): string {
  if (previous === 0 && current === 0) return "text-muted";
  if (current > previous) return "text-primary";
  if (current < previous) return "text-danger";
  return "text-muted";
}

function Tile({
  label,
  value,
  currentNum,
  prevNum,
  prevPeriodLabel,
}: {
  label: string;
  value: string;
  currentNum: number;
  prevNum: number;
  prevPeriodLabel: string;
}) {
  const pct = percentChange(currentNum, prevNum);
  const color = changeColor(currentNum, prevNum);

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border p-4">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
      <span className={`text-sm ${color}`}>
        {pct !== null ? `${pct} vs ${prevPeriodLabel}` : "—"}
      </span>
    </div>
  );
}

function formatBusyHour(hour: number): string {
  if (hour < 0) return "-";
  const next = (hour + 1).toString().padStart(2, "0");
  return `${hour.toString().padStart(2, "0")}:00 - ${next}:00`;
}

export function KpiTiles({
  current,
  comparison,
  prevPeriodLabel,
}: KpiTilesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Tile
        label="Total Pendapatan"
        value={formatRupiah(current.totalRevenue)}
        currentNum={current.totalRevenue}
        prevNum={comparison.totalRevenue}
        prevPeriodLabel={prevPeriodLabel}
      />
      <Tile
        label="Total Pesanan"
        value={String(current.totalOrders)}
        currentNum={current.totalOrders}
        prevNum={comparison.totalOrders}
        prevPeriodLabel={prevPeriodLabel}
      />
      <Tile
        label="Rata-Rata Pesanan"
        value={formatRupiah(current.avgOrderValue)}
        currentNum={current.avgOrderValue}
        prevNum={comparison.avgOrderValue}
        prevPeriodLabel={prevPeriodLabel}
      />
      <Tile
        label="Menu Terlaris"
        value={current.bestSelling ? `${current.bestSelling.name} (${current.bestSelling.qty}x)` : "-"}
        currentNum={current.bestSelling?.qty ?? 0}
        prevNum={comparison.bestSelling?.qty ?? 0}
        prevPeriodLabel={prevPeriodLabel}
      />
      <Tile
        label="Pembayaran Populer"
        value={current.totalOrders > 0 ? current.popularPayment : "-"}
        currentNum={
          current.popularPayment === "Tunai"
            ? 1
            : current.popularPayment === "Kartu"
              ? -1
              : 0
        }
        prevNum={comparison.totalOrders > 0 ? (comparison.popularPayment === current.popularPayment ? 1 : -1) : 0}
        prevPeriodLabel={prevPeriodLabel}
      />
      <Tile
        label="Jam Tersibuk"
        value={formatBusyHour(current.busiestHour)}
        currentNum={current.busiestHour >= 0 ? current.busiestHour : 0}
        prevNum={comparison.busiestHour >= 0 ? comparison.busiestHour : 0}
        prevPeriodLabel={prevPeriodLabel}
      />
    </div>
  );
}
