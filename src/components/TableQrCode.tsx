"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";

export function TableQrCode({ tableId, tableName }: { tableId: string; tableName: string }) {
  const [orderUrl, setOrderUrl] = useState<string>();

  useEffect(() => {
    setOrderUrl(`${window.location.origin}/order/${tableId}`);
  }, [tableId]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center gap-6 px-6 py-8 print:py-0">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-zinc-300 p-8 print:border-none dark:border-zinc-700">
        <h1 className="text-2xl font-bold">{tableName}</h1>
        {orderUrl && <QRCodeSVG value={orderUrl} size={240} marginSize={2} />}
        <p className="break-all text-center text-sm text-zinc-500">{orderUrl}</p>
      </div>

      <div className="flex w-full flex-col gap-3 print:hidden">
        <Button type="button" onClick={() => window.print()}>
          Cetak QR
        </Button>
        <Link
          href="/"
          className="flex min-h-16 items-center justify-center rounded-xl border border-zinc-300 px-6 text-lg font-medium active:opacity-80 dark:border-zinc-700"
        >
          Kembali
        </Link>
      </div>
    </div>
  );
}
