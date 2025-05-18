"use client"

import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { EnergyBarProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"

export default function EnergyBar({ energy, maxEnergy, boost, onOpenBoostOverlay, league = 1 }: EnergyBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const { getLeagueColors } = useLeagueData()
  const leagueColors = getLeagueColors(league)

  // Calculate energy percentage
  const energyPercentage = (energy / maxEnergy) * 100

  const handleBoostClick = () => {
    onOpenBoostOverlay()
  }

  return (
    <div className="bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-700">
      {/* Header row with energy info and boost button */}
      <div className="flex justify-between items-center mb-2">
        {/* Energy icon and title */}
        <div className="flex items-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
            style={{
              background: `radial-gradient(circle, ${leagueColors.secondary}, ${leagueColors.primary})`,
            }}
          >
            <FontAwesomeIcon icon={icons.bolt} className="text-sm" style={{ color: leagueColors.text }} />
          </div>
          <span className="text-base font-bold text-white">Energy</span>
        </div>

        {/* Energy counter */}
        <div className="text-right font-semibold">
          <span className="text-yellow-300">{energy.toLocaleString()}</span>
          <span className="text-gray-400"> / </span>
          <span className="text-white">{maxEnergy.toLocaleString()}</span>
        </div>

        {/* Boost button */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center"
          onClick={handleBoostClick}
          style={{
            background: `linear-gradient(135deg, ${leagueColors.secondary}, #f43f5e)`,
          }}
          aria-label="Boost energy"
        >
          <FontAwesomeIcon icon={icons.rocket} className="text-white text-sm" />
        </button>
      </div>

      {/* Progress bar container */}
      <div className="relative bg-gray-700 rounded-full overflow-hidden h-5">
        {/* Progress fill */}
        <div
          className="absolute h-full"
          style={{
            width: `${energyPercentage}%`,
            background: `linear-gradient(90deg, ${leagueColors.secondary}, ${leagueColors.primary})`,
          }}
        ></div>

        {/* Energy segments */}
        <div className="absolute inset-0 flex items-center px-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="h-2.5 w-1 bg-yellow-400 mx-0.5 rounded-sm opacity-80"
              style={{
                opacity: i < energyPercentage / 5 ? 0.8 : 0.2,
              }}
            ></div>
          ))}
        </div>

        {/* League level indicator */}
        <div
          className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${leagueColors.secondary}, ${leagueColors.primary})`,
          }}
        >
          <span className="text-xs font-bold" style={{ color: leagueColors.text }}>
            {league}
          </span>
        </div>
      </div>
    </div>
  )
}
