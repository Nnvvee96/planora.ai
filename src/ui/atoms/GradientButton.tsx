import React from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const GradientButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  ...props
}: GradientButtonProps) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-planora-purple to-planora-accent-purple text-white",
    secondary:
      "bg-gradient-to-r from-planora-accent-purple to-planora-accent-blue text-white",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3",
  };

  return (
    <button
      className={cn(
        "font-medium rounded-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-planora-purple/50 inline-flex items-center justify-center",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
};

export { GradientButton };
