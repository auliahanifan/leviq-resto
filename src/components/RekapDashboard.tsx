"use client";

import { useState, useRef, useCallback } from "react";
import type { PaidOrderWithItems } from "@/lib/rekap";
import { KpiTiles } from "@/components/KpiTiles";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { TopItemsChart } from "@/components/charts/TopItemsChart";
import { PaymentMethodChart } from "@/components/charts/PaymentMethodChart";
import { PeakHoursChart } from "@/components/charts/PeakHoursChart";
import html2pdf from "html2pdf.js";

type Period = "harian" | "mingguan" | "bulanan" | "custom";

type MetricValues = {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  bestSelling: { name: string; qty: number } | null;
  popularPayment: string;
  busiestHour: number;
};

type PeriodData = MetricValues & {
  paymentMethods: { tunai: number; kartu: number };
  revenueByDate: Array<{ date: string; revenue: number }>;
  itemsByQty: Array<{ name: string; qty: number; revenue: number }>;
  ordersByHour: number[];
  periodLabel: string;
};

function toWIBDateString(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}

function getWIBHour(isoString: string): number {
  return parseInt(
    new Date(isoString).toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    })
  );
}

function getPeriodBounds(
  period: Period,
  customStart?: string,
  customEnd?: string
): { start: Date; end: Date; label: string; prevStart: Date; prevEnd: Date; prevLabel: string } {
  const now = new Date();
  const wibNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

  switch (period) {
    case "harian": {
      const start = new Date(wibNow.getFullYear(), wibNow.getMonth(), wibNow.getDate());
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      const prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, label: "hari ini", prevStart, prevEnd, prevLabel: "kemarin" };
    }
    case "mingguan": {
      const day = wibNow.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const start = new Date(wibNow.getFullYear(), wibNow.getMonth(), wibNow.getDate() + diffToMonday);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      const prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevEnd = new Date(start.getTime() - 1);
      return { start, end, label: "minggu ini", prevStart, prevEnd, prevLabel: "minggu lalu" };
    }
    case "bulanan": {
      const start = new Date(wibNow.getFullYear(), wibNow.getMonth(), 1);
      const end = new Date(wibNow.getFullYear(), wibNow.getMonth() + 1, 0, 23, 59, 59, 999);
      const prevStart = new Date(wibNow.getFullYear(), wibNow.getMonth() - 1, 1);
      const prevEnd = new Date(wibNow.getFullYear(), wibNow.getMonth(), 0, 23, 59, 59, 999);
      return { start, end, label: "bulan ini", prevStart, prevEnd, prevLabel: "bulan lalu" };
    }
    case "custom": {
      if (!customStart || !customEnd) {
        return {
          start: new Date(0), end: new Date(), label: "kustom",
          prevStart: new Date(0), prevEnd: new Date(0), prevLabel: "sebelumnya",
        };
      }
      const start = new Date(customStart + "T00:00:00+07:00");
      const end = new Date(customEnd + "T23:59:59+07:00");
      const duration = end.getTime() - start.getTime();
      const prevEnd = new Date(start.getTime() - 1);
      const prevStart = new Date(prevEnd.getTime() - duration);
      return { start, end, label: "kustom", prevStart, prevEnd, prevLabel: "sebelumnya" };
    }
  }
}

function filterOrdersByPeriod(
  orders: PaidOrderWithItems[],
  start: Date,
  end: Date
): PaidOrderWithItems[] {
  return orders.filter((o) => {
    const paidAt = new Date(o.paid_at).getTime();
    return paidAt >= start.getTime() && paidAt <= end.getTime();
  });
}

function computeMetrics(orders: PaidOrderWithItems[]): MetricValues & {
  paymentMethods: { tunai: number; kartu: number };
  revenueByDate: Array<{ date: string; revenue: number }>;
  itemsByQty: Array<{ name: string; qty: number; revenue: number }>;
  ordersByHour: number[];
} {
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const itemQtyMap = new Map<string, number>();
  const itemRevenueMap = new Map<string, number>();
  const revenueByDateMap = new Map<string, number>();
  const ordersByHour = new Array(24).fill(0);
  const paymentMethods = { tunai: 0, kartu: 0 };

  for (const order of orders) {
    if (order.payment_method === "tunai") paymentMethods.tunai++;
    else if (order.payment_method === "kartu") paymentMethods.kartu++;

    const dateKey = toWIBDateString(order.paid_at);
    revenueByDateMap.set(dateKey, (revenueByDateMap.get(dateKey) ?? 0) + order.total);

    const hour = getWIBHour(order.paid_at);
    if (hour >= 0 && hour < 24) ordersByHour[hour]++;

    for (const item of order.order_items) {
      itemQtyMap.set(item.nama, (itemQtyMap.get(item.nama) ?? 0) + item.qty);
      itemRevenueMap.set(item.nama, (itemRevenueMap.get(item.nama) ?? 0) + item.subtotal);
    }
  }

  const bestSellingArr = [...itemQtyMap.entries()].sort((a, b) => b[1] - a[1]);
  const bestSelling = bestSellingArr.length > 0
    ? { name: bestSellingArr[0][0], qty: bestSellingArr[0][1] }
    : null;

  const popularPayment =
    paymentMethods.tunai >= paymentMethods.kartu ? "Tunai" : "Kartu";

  const busiestHour = ordersByHour.indexOf(Math.max(...ordersByHour));

  const revenueByDate = [...revenueByDateMap.entries()]
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const itemsByQty = [...itemQtyMap.entries()]
    .map(([name, qty]) => ({ name, qty, revenue: itemRevenueMap.get(name) ?? 0 }))
    .sort((a, b) => b.qty - a.qty);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    bestSelling,
    popularPayment,
    busiestHour,
    paymentMethods,
    revenueByDate,
    itemsByQty,
    ordersByHour,
  };
}

const periodLabels: Record<Period, string> = {
  harian: "Harian",
  mingguan: "Mingguan",
  bulanan: "Bulanan",
  custom: "Kustom",
};

export function RekapDashboard({ orders }: { orders: PaidOrderWithItems[] }) {
  const [period, setPeriod] = useState<Period>("harian");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [exporting, setExporting] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const hasAnyOrders = orders.length > 0;

  const bounds = getPeriodBounds(period, customStart, customEnd);

  const currentOrders = hasAnyOrders
    ? filterOrdersByPeriod(orders, bounds.start, bounds.end)
    : [];
  const prevOrders = hasAnyOrders
    ? filterOrdersByPeriod(orders, bounds.prevStart, bounds.prevEnd)
    : [];

  const currentMetrics = computeMetrics(currentOrders);
  const prevMetrics = computeMetrics(prevOrders);

  const periodData: PeriodData = { ...currentMetrics, periodLabel: bounds.label };

  const handleExportPdf = useCallback(async () => {
    if (!pdfContentRef.current) return;
    setExporting(true);
    try {
      const opt = {
        margin: 0.3,
        filename: `rekap-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in" as const, format: "a4" as const, orientation: "landscape" as const },
      };
      await html2pdf().set(opt).from(pdfContentRef.current).save();
    } finally {
      setExporting(false);
    }
  }, []);

  if (!hasAnyOrders) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-2xl font-bold">Rekap Penjualan</h1>
        <div className="flex flex-1 items-center justify-center py-20">
          <p className="text-lg text-muted">Belum ada transaksi yang tercatat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rekap Penjualan</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["harian", "mingguan", "bulanan", "custom"] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-2xl px-4 py-3 text-lg font-semibold transition-colors ${
              period === p
                ? "bg-primary text-white"
                : "bg-surface text-foreground active:bg-border"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
        {period === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="min-h-16 rounded-2xl border border-border px-4 text-lg"
            />
            <span className="text-base text-muted">sampai</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="min-h-16 rounded-2xl border border-border px-4 text-lg"
            />
          </div>
        )}
      </div>

      <div ref={pdfContentRef}>
        <KpiTiles
          current={currentMetrics}
          comparison={prevMetrics}
          prevPeriodLabel={bounds.prevLabel}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChart data={periodData.revenueByDate} />
          <TopItemsChart data={periodData.itemsByQty.slice(0, 10)} />
          <PaymentMethodChart data={periodData.paymentMethods} />
          <PeakHoursChart data={periodData.ordersByHour} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleExportPdf}
        disabled={exporting}
        className="self-end min-h-16 min-w-16 rounded-2xl border-2 border-border px-6 text-lg font-semibold text-foreground active:bg-surface disabled:opacity-40"
      >
        {exporting ? "Mengekspor..." : "Ekspor PDF"}
      </button>
    </div>
  );
}
