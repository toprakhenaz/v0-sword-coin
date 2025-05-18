"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { CardProps } from "@/types"
import { useState } from "react"

export default function Card({ card, onUpgrade, coins }: CardProps) {
  const isDisabled = coins < card.upgradeCost
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 relative flex flex-col justify-between shadow-lg transition-all duration-300 ${isHovered ? "transform scale-105" : ""}`}
      style={{
        boxShadow: isHovered ? "0 8px 20px rgba(0, 0, 0, 0.6)" : "0 4px 8px rgba(0, 0, 0, 0.4)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-lg mb-2" style={{ height: "120px" }}>
        <img
          src={card.image || "/placeholder.svg"}
          alt={card.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="space-y-1 mb-2">
        <div className="text-center font-semibold text-sm sm:text-base text-white">{card.name}</div>

        <div className="text-center text-sm sm:text-base text-yellow-300 font-semibold">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1" />+{card.hourlyIncome}/Saat
        </div>

        <div className="flex justify-center items-center mt-1">
          <div className="px-3 py-1 rounded-full bg-gray-700/70 text-xs text-blue-300">Seviye {card.level}</div>
        </div>
      </div>

      <button
        onClick={() => onUpgrade(card.id)}
        className={`mt-2 w-full py-2 px-4 rounded-lg font-medium text-center transition-all duration-300 flex items-center justify-center
          ${
            isDisabled
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20"
          }`}
        disabled={isDisabled}
      >
        <FontAwesomeIcon icon={icons.coins} className="mr-2" />
        <span className="text-lg">{card.upgradeCost}</span>
      </button>

      {/* Add sparkle effect on higher level cards */}
      {card.level > 2 && (
        <div className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-yellow-400 rounded-full shadow-lg">
          <FontAwesomeIcon icon={icons.star} className="text-xs text-yellow-900" />
        </div>
      )}
    </div>
  )
}
