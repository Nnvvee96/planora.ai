// Re-export from shadcn with custom variants
import {
  Button as ShadcnButton,
  type ButtonProps as ShadcnButtonProps,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { buttonVariants, type CustomVariant } from "./buttonVariants";

// Extended ButtonProps type to include our custom variants
export interface ButtonProps extends Omit<ShadcnButtonProps, "variant"> {
  children: React.ReactNode;
  variant?: CustomVariant | NonNullable<ShadcnButtonProps["variant"]>;
}

// Enhanced Button component that supports our custom variants
export const Button = ({
  className,
  variant,
  children,
  ...props
}: ButtonProps) => {
  // Define styles for our custom variants
  const customVariants = [
    "gradient",
    "glass",
    "glow",
    "outline",
    "secondary",
  ] as const;

  // Check if this is one of our custom variants
  const isCustomVariant =
    variant && customVariants.includes(variant as CustomVariant);

  // For our custom variants, use our buttonVariants
  if (isCustomVariant) {
    return (
      <ShadcnButton
        className={cn(
          buttonVariants({ variant: variant as string, className }),
        )}
        variant="default" // Pass a valid shadcn variant
        {...props}
      >
        {children}
      </ShadcnButton>
    );
  }

  // For default shadcn variants, use the ShadcnButton directly
  return (
    <ShadcnButton
      className={cn("gap-2", className)}
      variant={variant as NonNullable<ShadcnButtonProps["variant"]>}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};
