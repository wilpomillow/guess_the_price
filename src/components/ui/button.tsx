"use client"

import * as React from "react"
import { cn } from "@/lib/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "rounded-2xl px-4 py-3",
        "text-sm font-semibold",
        "bg-orange-500 text-white",
        "hover:bg-orange-600",
        "disabled:opacity-50 disabled:pointer-events-none",
        "transition-colors",
        className
      )}
      {...props}
    />
  )
})

Button.displayName = "Button"
