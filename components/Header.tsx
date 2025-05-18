"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { HeaderProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"

export default function Header({ earnPerTap, coinsToLevelUp, hourlyEarn }: HeaderProps) {
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(6) // Default colors for league 6

  return (
    <div className="bg-[#0d1220] rounded-xl p-4 shadow-lg mb-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-300 mb-1">Saatlik Kazanç</p>
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
            <span className="text-white font-bold">{hourlyEarn.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-300 mb-1">Seviye İçin Gereken</p>
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.angleDoubleUp} className="text-white mr-1 text-sm" />
            <span className="text-white font-bold">{coinsToLevelUp.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-xs text-gray-300 mb-1">Tıklama Başına</p>
          <div className="flex items-center">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1 text-sm" />
            <span className="text-white font-bold">+{earnPerTap}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
