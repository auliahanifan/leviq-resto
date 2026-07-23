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
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border p-8 print:border-none">
        <h1 className="text-2xl font-bold">{tableName}</h1>
        {orderUrl && <QRCodeSVG value={orderUrl} size={240} marginSize={2} />}
        <p className="break-all text-center text-sm text-muted">{orderUrl}</p>
      </div>

      <div className="flex w-full flex-col gap-3 print:hidden">
        <Button type="button" onClick={() => window.print()}>
          Cetak QR
        </Button>
        <Link
          href="/"
          className="flex min-h-16 items-center justify-center rounded-2xl border-2 border-border px-6 text-lg font-medium active:bg-surface"
        >
          Kembali
        </Link>
      </div>
    </div>
  );
}
