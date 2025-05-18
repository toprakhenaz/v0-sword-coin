"use client"

import type { BottomNavProps } from "@/types"

export default function BottomNav({ activeCategory, setActiveCategory }: BottomNavProps) {
  const categories = ["Ekipman", "İşçiler", "Isekai", "Özel"]

  return (
    <div className="flex justify-between bg-gray-800 rounded-full p-1 text-xs sm:text-sm">
      {categories.map((category) => (
        <button
          key={category}
          className={`flex-1 py-2 px-2 sm:px-4 rounded-full text-center transition-colors ${
            activeCategory === category
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:text-white hover:bg-gray-700/50"
          }`}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
