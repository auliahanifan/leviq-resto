"use client";

import { useActionState, useState } from "react";
import {
  createCashClosingAction,
  type CreateCashClosingState,
} from "@/lib/cash-closing-actions";
import { CashAmountPad } from "@/components/CashAmountPad";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";

export function CashClosingForm({ totalTunai }: { totalTunai: number }) {
  const [state, formAction, pending] = useActionState<CreateCashClosingState, FormData>(
    createCashClosingAction,
    undefined
  );
  const [amountStr, setAmountStr] = useState("");

  const uangFisik = Number(amountStr || "0");
  const selisih = uangFisik - totalTunai;

  return (
    <form action={formAction} className="flex flex-col items-center gap-4">
      <label className="text-lg font-medium">Uang Fisik di Laci</label>
      <p className="text-2xl font-bold">{formatRupiah(uangFisik)}</p>
      <input type="hidden" name="uang_fisik" value={amountStr} />
      <CashAmountPad value={amountStr} onChange={setAmountStr} />

      <div className="flex w-full justify-between text-lg">
        <span>Selisih</span>
        <span className={selisih < 0 ? "font-medium text-danger" : "font-medium"}>
          {formatRupiah(selisih)}
        </span>
      </div>

      {state?.error && (
        <p role="alert" className="text-lg font-medium text-danger">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || amountStr === ""} className="w-full">
        {pending ? "Menyimpan..." : "Simpan Tutup Kasir"}
      </Button>
    </form>
  );
}
