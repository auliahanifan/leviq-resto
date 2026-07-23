"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAction, type LoginState } from "@/lib/auth-actions";
import { PinPad } from "@/components/PinPad";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (state?.error) setPin("");
  }, [state]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 bg-surface px-6 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-primary">LeviqResto</h1>
        <p className="text-lg text-muted">Masukkan PIN kasir</p>
      </div>
      <form action={formAction} className="flex flex-col items-center gap-8">
        <PinPad value={pin} onChange={setPin} />
        <input type="hidden" name="pin" value={pin} />
        <p role="alert" className="min-h-7 text-lg font-medium text-danger">
          {state?.error}
        </p>
        <Button type="submit" disabled={pending || pin.length !== 4} className="w-64">
          {pending ? "Memeriksa..." : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
