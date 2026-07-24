import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <Link href="/" className="text-xl font-extrabold text-primary">
        LeviqResto
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/menu"
          className="text-base font-medium text-foreground underline-offset-4 hover:underline"
        >
          Kelola Menu
        </Link>
        <Link
          href="/rekap"
          className="text-base font-medium text-foreground underline-offset-4 hover:underline"
        >
          Rekap
        </Link>
        <Link
          href="/tutup-kasir"
          className="text-base font-medium text-foreground underline-offset-4 hover:underline"
        >
          Tutup Kasir
        </Link>
        <Link
          href="/ubah-pin"
          className="text-base font-medium text-foreground underline-offset-4 hover:underline"
        >
          Ubah PIN
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1 text-base font-medium text-danger underline-offset-4 hover:underline"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </nav>
    </header>
  );
}
