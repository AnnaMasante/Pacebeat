import type { ReactNode } from "react";

interface ToastProps {
  variant?: "info" | "error";
  children: ReactNode;
}

export function Toast({ variant = "info", children }: ToastProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className="flex items-center gap-sm rounded-pill bg-hover px-md py-sm font-body text-sm tracking-wide text-ink-high"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-pill shadow-glow ${variant === "error" ? "bg-secondary" : "bg-primary"}`}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
