"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { UtensilsCrossed } from "lucide-react";
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

export function MenuManager({ items }: { items: MenuItem[] }) {
  return (
    <div className="flex flex-col gap-8">
      <AddMenuItemForm />
      <ul className="flex flex-col gap-3">
        {items.length === 0 && (
          <p className="text-lg text-muted">Belum ada item menu.</p>
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
      className="flex flex-col gap-4 rounded-2xl border border-border p-4"
    >
      <h2 className="text-lg font-bold">Tambah Item Menu</h2>
      <Field label="Nama" name="nama" required />
      <Field label="Harga (Rp)" name="harga" type="number" required />
      <Field label="Kategori (opsional)" name="kategori" />
      <Field label="Deskripsi (opsional)" name="deskripsi" type="textarea" />
      <Field label="Foto (opsional, maks 2MB, JPG/PNG/WebP)" name="foto" type="file" />
      {state?.error && (
        <p role="alert" className="text-base font-medium text-danger">
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
      <li className="rounded-2xl border border-border p-4">
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
          <Field
            label="Deskripsi (opsional)"
            name="deskripsi"
            type="textarea"
            defaultValue={item.deskripsi ?? ""}
          />
          {item.foto_url && (
            <label className="flex items-center gap-2 text-base font-medium">
              <input type="checkbox" name="hapus_foto" className="h-5 w-5" />
              Hapus foto saat ini
            </label>
          )}
          <Field
            label={item.foto_url ? "Ganti foto (opsional, maks 2MB, JPG/PNG/WebP)" : "Foto (opsional, maks 2MB, JPG/PNG/WebP)"}
            name="foto"
            type="file"
          />
          {state?.error && (
            <p role="alert" className="text-base font-medium text-danger">
              {state.error}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditing(false)}
              className="flex-1"
            >
              Batal
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
      <div className="flex items-center gap-4">
        {item.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.foto_url}
            alt={item.nama}
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface">
            <UtensilsCrossed className="h-6 w-6 text-muted" />
          </div>
        )}
        <div>
          <p className="text-lg font-medium">{item.nama}</p>
          <p className="text-base text-muted">
            {formatRupiah(item.harga)}
            {item.kategori ? ` · ${item.kategori}` : ""}
          </p>
          {item.deskripsi && <p className="text-sm text-muted">{item.deskripsi}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
          Ubah
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDeleteClick}
          disabled={deleting}
        >
          {confirmingDelete ? "Yakin?" : "Hapus"}
        </Button>
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
  if (type === "textarea") {
    return (
      <label className="flex flex-col gap-2 text-base font-medium">
        {label}
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={2}
          className="rounded-2xl border border-border px-4 py-3 text-lg"
        />
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-2 text-base font-medium">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={type === "file" ? undefined : defaultValue}
        required={required}
        accept={type === "file" ? "image/jpeg,image/png,image/webp" : undefined}
        inputMode={type === "number" ? "numeric" : undefined}
        min={type === "number" ? 0 : undefined}
        className="min-h-16 rounded-2xl border border-border px-4 text-lg"
      />
    </label>
  );
}
