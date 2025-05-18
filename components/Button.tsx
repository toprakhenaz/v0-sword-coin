import type React from "react"
import type { ButtonProps } from "@/types"

export const Button: React.FC<ButtonProps> = ({ className = "", children, disabled = false, ...props }) => (
  <button
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 
      ${disabled ? "cursor-not-allowed opacity-60" : "transform hover:-translate-y-1 active:translate-y-0"} 
      ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
)
