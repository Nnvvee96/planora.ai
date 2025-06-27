import { buttonVariants as shadcnButtonVariants } from "@/components/ui/variants/buttonVariants";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// Extend the default button variants with new modern ones
const buttonStyles = cva(
  "", // Base styles come from shadcn button
  {
    variants: {
      variant: {
        gradient:
          "relative overflow-hidden bg-gradient-to-r from-planora-accent-purple to-planora-accent-pink text-white shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-300",
        glass:
          "backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 shadow-sm",
        glow: "relative bg-planora-purple-dark border border-planora-accent-purple/50 text-white hover:border-planora-accent-purple transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]",
        outline:
          "border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors",
        secondary:
          "bg-planora-purple-dark/60 text-white hover:bg-planora-purple-dark/80 transition-colors",
      },
    },
  },
);

// Define our custom variant types
export type CustomVariant =
  | "gradient"
  | "glass"
  | "glow"
  | "outline"
  | "secondary";

// Enhanced version of buttonVariants that includes our custom variants
export const buttonVariants = (props: {
  variant?: string;
  size?: string;
  className?: string;
}) => {
  const { variant, size, className } = props;
  const customVariants = [
    "gradient",
    "glass",
    "glow",
    "outline",
    "secondary",
  ] as const;

  // If using a custom variant, combine styles
  if (variant && customVariants.includes(variant as CustomVariant)) {
    return cn(
      shadcnButtonVariants({
        size: size as "default" | "sm" | "lg" | "icon" | null | undefined,
        variant: "default",
      }),
      buttonStyles({ variant: variant as CustomVariant }),
      className,
    );
  }

  // Otherwise, use the default shadcn variants
  return shadcnButtonVariants({
    variant: variant as
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | null
      | undefined,
    size: size as "default" | "sm" | "lg" | "icon" | null | undefined,
    className,
  });
};

export { buttonStyles };
