// Re-export from shadcn with custom variants
import { Button as ShadcnButton, buttonVariants as shadcnButtonVariants, type ButtonProps as ShadcnButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import React from "react"

// Extend the default button variants with new modern ones
const buttonStyles = cva(
  "", // Base styles come from shadcn button
  {
    variants: {
      variant: {
        gradient: "relative overflow-hidden bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink text-white shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300",
        glass: "backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-sm",
        glow: "relative bg-planora-purple-dark border border-planora-accent-purple/50 text-white hover:border-planora-accent-purple transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]",
        outline: "border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors",
        secondary: "bg-planora-purple-dark/60 text-white hover:bg-planora-purple-dark/80 transition-colors",
      },
    },
  }
)

// Define our custom variant types
type CustomVariant = 'gradient' | 'glass' | 'glow' | 'outline' | 'secondary';

// Extended ButtonProps type to include our custom variants
export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant'> {
  children: React.ReactNode;
  variant?: CustomVariant | NonNullable<ShadcnButtonProps['variant']>;
}

// Enhanced Button component that supports our custom variants
export const Button = ({
  className,
  variant,
  children,
  ...props
}: ButtonProps) => {
  // Define styles for our custom variants
  const customVariants = ['gradient', 'glass', 'glow', 'outline', 'secondary'] as const;
  
  // Check if this is one of our custom variants
  const isCustomVariant = variant && customVariants.includes(variant as any);
  
  // For our custom variants, use our buttonStyles
  if (isCustomVariant) {
    return (
      <ShadcnButton
        className={cn(
          buttonStyles({ variant: variant as CustomVariant }),
          className
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
      variant={variant as NonNullable<ShadcnButtonProps['variant']>}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};

// Define props type for buttonVariants function
type ButtonVariantsProps = Omit<Parameters<typeof shadcnButtonVariants>[0], 'variant'> & {
  variant?: CustomVariant | NonNullable<Parameters<typeof shadcnButtonVariants>[0]['variant']>;
};

// Enhanced version of buttonVariants that includes our custom variants
export const buttonVariants = (props: ButtonVariantsProps) => {
  const { variant, size, ...rest } = props as any;
  const customVariants = ['gradient', 'glass', 'glow', 'outline', 'secondary'] as const;
  
  // If using a custom variant, combine styles
  if (variant && customVariants.includes(variant)) {
    return cn(
      shadcnButtonVariants({ size, variant: "default", ...rest }),
      buttonStyles({ variant: variant as CustomVariant })
    );
  }
  
  // Otherwise, use the default shadcn variants
  return shadcnButtonVariants(props as Parameters<typeof shadcnButtonVariants>[0]);
};
