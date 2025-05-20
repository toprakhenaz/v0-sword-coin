import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with K, M, B suffixes (e.g., 1000 -> 1K, 1500000 -> 1.5M)
 * @param num The number to format
 * @param digits Number of decimal places (default: 1)
 */
export function formatNumber(num: number, digits = 1): string {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup
    .slice()
    .reverse()
    .find((item) => num >= item.value)
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0"
}
