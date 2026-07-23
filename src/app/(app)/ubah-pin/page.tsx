"use client";

import { useActionState } from "react";
import { changePinAction, type ChangePinState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/Button";

export default function UbahPinPage() {
  const [state, formAction, pending] = useActionState<ChangePinState, FormData>(
    changePinAction,
    undefined
  );

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <h1 className="text-2xl font-bold">Ubah PIN Kasir</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <PinField label="PIN Lama" name="old_pin" />
        <PinField label="PIN Baru" name="new_pin" />
        <PinField label="Konfirmasi PIN Baru" name="confirm_pin" />
        {state?.error && (
          <p role="alert" className="text-lg font-medium text-danger">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-lg font-medium text-primary">
            PIN berhasil diubah.
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Menyimpan..." : "Simpan PIN Baru"}
        </Button>
      </form>
    </div>
  );
}

function PinField({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-2 text-lg font-medium">
      {label}
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        name={name}
        required
        className="min-h-16 rounded-2xl border border-border px-4 text-center text-2xl tracking-[0.5em]"
      />
    </label>
  );
}
