import { ReactNode } from "react";

type BadgeProps = {
  variant?: "default" | "success" | "warning" | "error" | "info" | "primary";
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  default: "bg-bg-tertiary text-text-secondary",
  success: "bg-green-50 text-green-700",
  warning: "bg-yellow-50 text-yellow-700",
  error: "bg-red-50 text-red-700",
  info: "bg-blue-50 text-blue-700",
  primary: "bg-bg-soft-blue text-primary",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
