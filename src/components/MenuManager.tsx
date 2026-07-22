"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  createMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  type MenuFormState,
} from "@/lib/menu-actions";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/format";
import type { Database } from "@/lib/supabase/types";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

const secondaryButton =
  "min-h-16 min-w-16 rounded-xl px-6 text-lg font-medium bg-zinc-200 active:opacity-80 disabled:opacity-40 dark:bg-zinc-800";
const dangerButton =
  "min-h-16 min-w-16 rounded-xl px-6 text-lg font-medium bg-red-600 text-white active:opacity-80 disabled:opacity-40";

export function MenuManager({ items }: { items: MenuItem[] }) {
  return (
    <div className="flex flex-col gap-8">
      <AddMenuItemForm />
      <ul className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-lg text-zinc-500">Belum ada item menu.</p>
        )}
        {items.map((item) => (
          <MenuItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function AddMenuItemForm() {
  const [state, formAction, pending] = useActionState<MenuFormState, FormData>(
    createMenuItemAction,
    undefined
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700"
    >
      <h2 className="text-lg font-bold">Tambah Item Menu</h2>
      <Field label="Nama" name="nama" required />
      <Field label="Harga (Rp)" name="harga" type="number" required />
      <Field label="Kategori (opsional)" name="kategori" />
      {state?.error && (
        <p role="alert" className="text-base font-medium text-red-600">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah Item"}
      </Button>
    </form>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [state, formAction, pending] = useActionState<MenuFormState, FormData>(
    updateMenuItemAction,
    undefined
  );
  const [deleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
    }
  }, [state]);

  function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    startDeleteTransition(async () => {
      await deleteMenuItemAction(item.id);
    });
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={item.id} />
          <Field label="Nama" name="nama" defaultValue={item.nama} required />
          <Field
            label="Harga (Rp)"
            name="harga"
            type="number"
            defaultValue={item.harga}
            required
          />
          <Field label="Kategori (opsional)" name="kategori" defaultValue={item.kategori ?? ""} />
          {state?.error && (
            <p role="alert" className="text-base font-medium text-red-600">
              {state.error}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={`flex-1 ${secondaryButton}`}
            >
              Batal
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
      <div>
        <p className="text-lg font-medium">{item.nama}</p>
        <p className="text-base text-zinc-500">
          {formatRupiah(item.harga)}
          {item.kategori ? ` · ${item.kategori}` : ""}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditing(true)} className={secondaryButton}>
          Ubah
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={deleting}
          className={dangerButton}
        >
          {confirmingDelete ? "Yakin?" : "Hapus"}
        </button>
      </div>
    </li>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-base font-medium">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        inputMode={type === "number" ? "numeric" : undefined}
        min={type === "number" ? 0 : undefined}
        className="min-h-16 rounded-xl border border-zinc-300 px-4 text-lg dark:border-zinc-700 dark:bg-zinc-900"
      />
    </label>
  );
}
