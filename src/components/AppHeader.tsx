import Link from "next/link";
import { logoutAction } from "@/lib/auth-actions";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <Link href="/" className="text-xl font-bold">
        LeviqResto
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/menu"
          className="text-base font-medium underline-offset-4 hover:underline"
        >
          Kelola Menu
        </Link>
        <Link
          href="/tutup-kasir"
          className="text-base font-medium underline-offset-4 hover:underline"
        >
          Tutup Kasir
        </Link>
        <Link
          href="/ubah-pin"
          className="text-base font-medium underline-offset-4 hover:underline"
        >
          Ubah PIN
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-base font-medium text-red-600 underline-offset-4 hover:underline"
          >
            Keluar
          </button>
        </form>
      </nav>
    </header>
  );
}
