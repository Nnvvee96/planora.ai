// Enhanced Button component using unified button variants
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "@/components/ui/button";
import { 
  buttonVariants, 
  type AllVariants 
} from "@/components/ui/variants/buttonVariants";
import { cn } from "@/lib/utils";
import React from "react";

// Enhanced ButtonProps type that includes all variants (standard + custom)
export interface ButtonProps extends Omit<ShadcnButtonProps, "variant"> {
  children: React.ReactNode;
  variant?: AllVariants;
}

// Simplified Button component using unified variant system
export const Button = ({
  className,
  variant = "default",
  size,
  children,
  ...props
}: ButtonProps) => {
  return (
    <ShadcnButton
      className={cn(buttonVariants({ variant, size }), className)}
      variant="default" // Always use default for ShadCN base, our variants handle styling
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};
