import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "danger";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary text-white active:bg-primary-dark",
  secondary: "bg-surface text-foreground active:bg-border",
  outline: "border-2 border-border text-foreground active:bg-surface",
  danger: "border-2 border-danger text-danger active:bg-danger-light",
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-16 min-w-16 rounded-2xl px-6 text-lg font-semibold disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
