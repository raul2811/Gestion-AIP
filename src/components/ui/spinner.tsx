// src/components/ui/spinner.tsx
import { cn } from "@/lib/utils"

export function Spinner({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent",
        className
      )}
      {...props}
    />
  )
}