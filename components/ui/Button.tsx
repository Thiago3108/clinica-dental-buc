import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "whatsapp";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
};

const variantClasses = {
  primary: "bg-primary hover:bg-primary-dark text-white shadow-sm",
  secondary: "bg-bg-soft-blue hover:bg-blue-100 text-primary",
  outline: "border border-border hover:bg-bg-secondary text-text-primary",
  ghost: "hover:bg-bg-secondary text-text-primary",
  danger: "bg-error hover:bg-red-600 text-white",
  whatsapp: "bg-whatsapp hover:bg-green-600 text-white",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth, className = "", children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
