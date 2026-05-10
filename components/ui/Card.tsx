import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hover?: boolean;
};

export function Card({ children, className = "", onClick, selected, hover }: CardProps) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-2xl transition-all ${
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border"
      } ${hover || isClickable ? "hover:border-primary hover:shadow-md cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
