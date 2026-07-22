import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-16 min-w-16 rounded-xl px-6 text-lg font-medium bg-foreground text-background active:opacity-80 disabled:opacity-40 ${className}`}
      {...props}
    />
  );
}
