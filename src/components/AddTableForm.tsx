"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
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
      <Button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="h-5 w-5" />
        Tambah Meja
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-border p-4"
    >
      <label className="flex flex-col gap-2 text-lg font-medium">
        Nama Meja
        <input
          type="text"
          name="nama"
          required
          autoFocus
          placeholder="mis. Meja 1"
          className="min-h-16 rounded-2xl border border-border px-4 text-lg"
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-lg font-medium text-danger">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
          Batal
        </Button>
      </div>
    </form>
  );
}
