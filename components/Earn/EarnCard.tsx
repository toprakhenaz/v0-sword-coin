import type { EarnCardProps } from "@/types"

export function Card({ className, children }: EarnCardProps) {
  return <div className={`rounded-lg overflow-hidden shadow-md ${className || ""}`}>{children}</div>
}

export function CardContent({ className, children }: EarnCardProps) {
  return <div className={`p-4 ${className || ""}`}>{children}</div>
}
