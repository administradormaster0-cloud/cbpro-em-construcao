import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "cb-on-ink bg-[#0A2560] hover:bg-[#0B4DA2]",
        destructive: "cb-on-ink bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-[#DCE2EC] bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-[#F4F6FA] text-white hover:bg-[#F4F6FA]/80",
        ghost: "hover:bg-[#F4F6FA] hover:text-white",
        link: "text-[#0A2560] underline-offset-4 hover:underline",
        accent: "bg-[#FFC20E] text-[#0B1430] hover:bg-[#FFC20E]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
