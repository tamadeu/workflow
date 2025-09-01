import * as React from "react"

import { cn } from "@/lib/utils"

// Simple chart wrapper for recharts
const Chart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full h-[350px]", className)}
    {...props}
  />
))
Chart.displayName = "Chart"

export { Chart }
