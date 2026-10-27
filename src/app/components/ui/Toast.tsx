import type { ReactNode } from "react";

interface ToastProps {
  variant?: "info" | "error";
  children: ReactNode;
}

export function Toast({ variant = "info", children }: ToastProps) {
  return (
    <div role={variant === "error" ? "alert" : "status"} className="lp-toast">
      {children}
    </div>
  );
}
