import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent cb-on-ink bg-[#0A2560] hover:bg-[#0B4DA2]",
        secondary:
          "border-transparent bg-[#F4F6FA] text-white hover:bg-[#F4F6FA]/80",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-500/80",
        outline: "text-white border-[#DCE2EC]",
        warning: "border-transparent bg-yellow-500 text-[#0B1430] hover:bg-yellow-500/80",
        info: "border-transparent bg-[#00d4ff] text-[#0B1430] hover:bg-[#00d4ff]/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
