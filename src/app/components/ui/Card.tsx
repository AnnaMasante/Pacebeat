import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`rounded-card bg-card p-md ${className}`} {...props}>
      {children}
    </div>
  );
}
