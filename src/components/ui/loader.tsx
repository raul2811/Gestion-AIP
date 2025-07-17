// src/components/ui/loader.tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const loaderVariants = cva(
  "animate-spin inline-flex items-center justify-center",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-2 w-2",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
        icon: "h-10 w-10",
      },
      variant: {
        default: "text-primary",
        destructive: "text-destructive",
        success: "text-success",
        warning: "text-warning",
        muted: "text-muted-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

interface LoaderProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof loaderVariants> {
  label?: string;
  showLabel?: boolean;
}

const Loader = React.forwardRef<HTMLSpanElement, LoaderProps>(
  ({ className, size, variant, label, showLabel = false, ...props }, ref) => {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          ref={ref}
          className={cn(loaderVariants({ size, variant, className }))}
          role="status"
          aria-label={label || "Loading"}
          {...props}
        >
          <Loader2 className="h-full w-full" />
        </span>
        {showLabel && label && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
      </span>
    );
  }
);

Loader.displayName = "Loader";

export { Loader, loaderVariants };