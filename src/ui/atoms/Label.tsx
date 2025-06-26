import * as React from "react";
import { Label as ShadcnLabel } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Extend the default label with any custom variants
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <ShadcnLabel ref={ref} className={cn("font-medium", className)} {...props} />
));

Label.displayName = "Label";
