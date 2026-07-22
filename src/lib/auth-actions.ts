"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSession, deleteSession, requireSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "");

  if (!/^\d{4}$/.test(pin)) {
    return { error: "PIN harus 4 digit angka." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_pin", { input_pin: pin });

  if (error || !data) {
    return { error: "PIN salah. Coba lagi." };
  }

  await createSession();
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

export type ChangePinState = { error?: string; success?: boolean } | undefined;

export async function changePinAction(
  _prevState: ChangePinState,
  formData: FormData
): Promise<ChangePinState> {
  await requireSession();

  const oldPin = String(formData.get("old_pin") ?? "");
  const newPin = String(formData.get("new_pin") ?? "");
  const confirmPin = String(formData.get("confirm_pin") ?? "");

  if (!/^\d{4}$/.test(oldPin) || !/^\d{4}$/.test(newPin)) {
    return { error: "PIN harus 4 digit angka." };
  }

  if (newPin !== confirmPin) {
    return { error: "Konfirmasi PIN baru tidak cocok." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("set_pin", {
    old_pin: oldPin,
    new_pin: newPin,
  });

  if (error || !data) {
    return { error: "PIN lama salah." };
  }

  return { success: true };
}
