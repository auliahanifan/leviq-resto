"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { payOrderAction, type PaymentMethod, type PayOrderResult } from "@/lib/order-actions";
import { Button } from "@/components/ui/Button";
import { CashAmountPad } from "@/components/CashAmountPad";
import { formatRupiah } from "@/lib/format";

type Table = { id: string; nama: string; status: string };
type Receipt = { total: number; paymentMethod: PaymentMethod; change: number };

export function PaymentFlow({ table, total }: { table: Table; total: number }) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [amountStr, setAmountStr] = useState("");
  const [error, setError] = useState<string>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [pending, startTransition] = useTransition();

  const amount = Number(amountStr || "0");
  const change = amount - total;

  function selectMethod(next: PaymentMethod) {
    setMethod(next);
    setError(undefined);
  }

  function handleConfirm() {
    if (!method) return;
    if (method === "tunai" && amount < total) {
      setError("Jumlah uang diterima kurang dari total.");
      return;
    }
    startTransition(async () => {
      const result: PayOrderResult = await payOrderAction(
        table.id,
        method,
        method === "tunai" ? amount : undefined
      );
      if ("error" in result) {
        setError(result.error);
      } else {
        setReceipt(result);
      }
    });
  }

  if (receipt) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-2xl font-bold">Pembayaran Berhasil</h1>
        <div className="flex w-full flex-col gap-3 rounded-xl border border-zinc-300 p-6 dark:border-zinc-700">
          <p className="text-lg">{table.nama}</p>
          <div className="flex justify-between text-lg">
            <span>Metode</span>
            <span className="font-medium">
              {receipt.paymentMethod === "tunai" ? "Tunai" : "Kartu"}
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Total</span>
            <span className="font-medium">{formatRupiah(receipt.total)}</span>
          </div>
          {receipt.paymentMethod === "tunai" && (
            <>
              <div className="flex justify-between text-lg">
                <span>Diterima</span>
                <span className="font-medium">{formatRupiah(amount)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Kembalian</span>
                <span>{formatRupiah(receipt.change)}</span>
              </div>
            </>
          )}
        </div>
        <Link
          href="/"
          className="flex min-h-16 w-full items-center justify-center rounded-xl bg-foreground px-6 text-lg font-medium text-background active:opacity-80"
        >
          Selesai
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-8">
      <h1 className="text-2xl font-bold">{table.nama} — Bayar</h1>
      <div className="flex items-center justify-between text-xl font-bold">
        <span>Total</span>
        <span>{formatRupiah(total)}</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => selectMethod("tunai")}
          className={`min-h-16 flex-1 rounded-xl border-2 text-lg font-medium ${
            method === "tunai" ? "border-foreground" : "border-zinc-300 dark:border-zinc-700"
          }`}
        >
          Tunai
        </button>
        <button
          type="button"
          onClick={() => selectMethod("kartu")}
          className={`min-h-16 flex-1 rounded-xl border-2 text-lg font-medium ${
            method === "kartu" ? "border-foreground" : "border-zinc-300 dark:border-zinc-700"
          }`}
        >
          Kartu
        </button>
      </div>

      {method === "tunai" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-2xl font-bold">{formatRupiah(amount)}</p>
          <CashAmountPad value={amountStr} onChange={setAmountStr} />
          <div className="flex w-full justify-between text-lg">
            <span>Kembalian</span>
            <span className={change < 0 ? "text-red-600" : "font-medium"}>
              {formatRupiah(Math.max(change, 0))}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-lg font-medium text-red-600">
          {error}
        </p>
      )}

      <Button
        type="button"
        disabled={pending || !method || (method === "tunai" && amount < total)}
        onClick={handleConfirm}
      >
        {pending ? "Memproses..." : "Konfirmasi Bayar"}
      </Button>
    </div>
  );
}
