import type { ReactNode } from "react";

export default function OrderLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">{children}</div>;
}
