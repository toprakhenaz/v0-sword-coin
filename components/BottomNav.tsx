"use client"

import type { BottomNavProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"

export default function BottomNav({ activeCategory, setActiveCategory }: BottomNavProps) {
  const categories = ["Ekipman", "İşçiler", "Isekai", "Özel"]
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Use league 6 colors for the bottom nav

  return (
    <div
      className="flex justify-between rounded-full p-1 text-xs sm:text-sm"
      style={{
        background: `linear-gradient(to right, ${colors.primary}30, ${colors.secondary}30)`,
        border: `1px solid ${colors.secondary}40`,
        boxShadow: `0 4px 12px ${colors.glow}20`,
      }}
    >
      {categories.map((category) => (
        <button
          key={category}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-full text-center transition-colors ${
            activeCategory === category ? "text-white" : "text-gray-300 hover:text-white hover:bg-gray-700/50"
          }`}
          style={{
            background:
              activeCategory === category
                ? `linear-gradient(to right, ${colors.secondary}80, ${colors.primary}80)`
                : "transparent",
            boxShadow: activeCategory === category ? `0 2px 8px ${colors.glow}40` : "none",
          }}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
