// Re-export from shadcn with custom variants
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardFooter as ShadcnCardFooter,
  CardTitle as ShadcnCardTitle,
  CardDescription as ShadcnCardDescription,
  CardContent as ShadcnCardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Extend the default card variants with any custom ones
export const Card = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCard>) => (
  <ShadcnCard className={cn("shadow-sm", className)} {...props} />
)

export const CardHeader = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardHeader>) => (
  <ShadcnCardHeader className={cn("space-y-1.5", className)} {...props} />
)

export const CardFooter = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardFooter>) => (
  <ShadcnCardFooter className={cn("items-center", className)} {...props} />
)

export const CardTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardTitle>) => (
  <ShadcnCardTitle className={cn("text-2xl tracking-tight", className)} {...props} />
)

export const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardDescription>) => (
  <ShadcnCardDescription className={cn("text-sm", className)} {...props} />
)

export const CardContent = ({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnCardContent>) => (
  <ShadcnCardContent className={cn("p-6 pt-0", className)} {...props} />
)
