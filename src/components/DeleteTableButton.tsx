"use client";

import { useState, useTransition } from "react";
import { deleteTableAction } from "@/lib/table-actions";

export function DeleteTableButton({ id, nama }: { id: string; nama: string }) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Hapus meja "${nama}"?`)) return;
    startTransition(async () => {
      const result = await deleteTableAction(id);
      setError(result?.error);
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="min-h-12 rounded-lg border border-red-300 px-4 text-base font-medium text-red-600 active:opacity-80 disabled:opacity-40 dark:border-red-800"
      >
        {pending ? "Menghapus..." : "Hapus"}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
