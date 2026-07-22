import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
