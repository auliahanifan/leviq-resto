"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Terjadi Kesalahan</h1>
      <p className="text-lg text-muted">
        Sepertinya ada masalah koneksi. Periksa jaringan WiFi lalu coba lagi.
      </p>
      <Button type="button" onClick={() => unstable_retry()}>
        Coba Lagi
      </Button>
    </div>
  );
}
