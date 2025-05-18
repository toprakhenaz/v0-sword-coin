"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { CoinDisplayProps } from "@/types"
import { ligImage } from "@/data/GeneralData"

export default function CoinDisplay({ coins, league, onclick }: CoinDisplayProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full py-2 px-4 shadow-md">
        <FontAwesomeIcon icon={icons.coins} className="text-yellow-100 mr-2 text-xl" />
        <span className="text-2xl font-bold text-white">{coins}</span>
      </div>
      <button
        className="flex items-center bg-gradient-to-r from-blue-400 to-blue-600 rounded-full py-2 px-4 shadow-md transform hover:scale-105 transition-transform duration-300"
        onClick={onclick}
      >
        <img src={ligImage[league] || "/placeholder.svg"} className="text-blue-100 mr-2 text-xl w-8 h-8" />
        <span className="text-lg font-semibold whitespace-nowrap text-white">Lig {league}</span>
        <FontAwesomeIcon icon={icons.arrowRight} className="ml-2 text-blue-100" />
      </button>
    </div>
  )
}
