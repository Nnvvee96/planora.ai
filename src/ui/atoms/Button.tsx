// Re-export from shadcn with custom variants
import { Button as ShadcnButton, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Extend the default button variants with any custom ones
export const Button = ({
  className,
  ...props
}: ButtonProps) => {
  return (
    <ShadcnButton
      className={cn("gap-2", className)}
      {...props}
    />
  )
}

// Re-export the button variants for consistency
export { buttonVariants } from "@/components/ui/button"
