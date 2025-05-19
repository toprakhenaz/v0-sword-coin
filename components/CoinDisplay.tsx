"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { CoinDisplayProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"

export default function CoinDisplay({ coins, league, onclick }: CoinDisplayProps) {
  const { getLeagueImage, getLeagueColors, getLeagueName } = useLeagueData()
  const colors = getLeagueColors(league)

  return (
    <div className="flex justify-between items-center gap-3 mb-4">
      <button
        className="w-40 flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full py-2 px-4 shadow-lg border-2 border-yellow-700"
        onClick={() => {}}
      >
        <FontAwesomeIcon icon={icons.coins} className="text-yellow-300 mr-2 text-lg" />
        <span className="text-white font-extrabold text-lg">{coins.toLocaleString()}</span>
      </button>

      <button
        className="flex items-center justify-center rounded-full py-2 px-4 border-2 shadow-md hover:bg-gray-800/30 transition-all duration-300 relative"
        style={{
          borderColor: colors.primary,
          background: "transparent",
        }}
        onClick={onclick}
      >
        <span className="text-white font-medium mr-1">{getLeagueName(league)}</span>
        <span className="text-white font-bold">{league}</span>

        {/* Added down arrow icon to indicate it's clickable */}
        <FontAwesomeIcon
          icon={icons.chevronDown}
          className="ml-1 text-yellow-400 animate-bounce"
          style={{
            fontSize: "0.75rem",
            animationDuration: "2s",
          }}
        />
      </button>
    </div>
  )
}
