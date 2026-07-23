"use client";

import { useState, useTransition } from "react";
import { deleteTableAction } from "@/lib/table-actions";

export function DeleteTableButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteTableAction(id);
      setError(result?.error);
      if (!result?.error) setConfirming(false);
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="min-h-12 rounded-full border-2 border-danger px-4 text-base font-medium text-danger active:bg-danger-light disabled:opacity-40"
      >
        {pending ? "Menghapus..." : confirming ? "Yakin?" : "Hapus"}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
