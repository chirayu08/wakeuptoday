import * as React from "react"
import { cn } from "@/lib/utils"

interface SlideToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

const SlideToggle = React.forwardRef<
  HTMLButtonElement,
  SlideToggleProps
>(({ checked, onCheckedChange, disabled, className, children, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked 
          ? "bg-[hsl(var(--ios-green))]" 
          : "bg-[hsl(var(--ios-gray))]",
        className
      )}
      ref={ref}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
      {children && (
        <span className="ml-3 text-sm font-medium text-foreground">
          {children}
        </span>
      )}
    </button>
  )
})

SlideToggle.displayName = "SlideToggle"

export { SlideToggle }