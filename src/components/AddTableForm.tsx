"use client";

import { useActionState, useState } from "react";
import { addTableAction, type AddTableState } from "@/lib/table-actions";
import { Button } from "@/components/ui/Button";

export function AddTableForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AddTableState, FormData>(
    addTableAction,
    undefined
  );
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) setOpen(false);
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        + Tambah Meja
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700"
    >
      <label className="flex flex-col gap-2 text-lg font-medium">
        Nama Meja
        <input
          type="text"
          name="nama"
          required
          autoFocus
          placeholder="mis. Meja 1"
          className="min-h-16 rounded-xl border border-zinc-300 px-4 text-lg dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-lg font-medium text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-16 flex-1 rounded-xl border border-zinc-300 px-6 text-lg font-medium active:opacity-80 dark:border-zinc-700"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
