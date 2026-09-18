import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-black shadow-glow hover:bg-secondary hover:scale-[1.04] hover:shadow-glow-intense",
  ghost: "bg-transparent text-ink-high border border-ink-low hover:border-ink-high hover:bg-card",
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-pill px-6 font-display text-base font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
