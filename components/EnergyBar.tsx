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

  return (
    <div className="bg-gray-800/60 p-5 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/70">
      {/* Header row with energy info and boost button */}
      <div className="flex justify-between items-center mb-3">
        {/* Energy icon and title */}
        <div className="flex items-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-lg"
            style={{
              background: `radial-gradient(circle, ${leagueColors.secondary}, ${leagueColors.primary})`,
              boxShadow: `0 0 8px ${leagueColors.glow}`,
            }}
          >
            <FontAwesomeIcon
              icon={icons.bolt}
              className="text-xl animate-pulse"
              style={{ color: leagueColors.text, animationDuration: "2s" }}
            />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Energy</span>
            <div className="text-xs text-gray-400">Regenerates over time</div>
          </div>
        </div>

        {/* Energy counter */}
        <div className="flex items-center">
          <div className="text-right font-bold mr-3">
            <span className="text-yellow-300 text-2xl">{energy.toLocaleString()}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-white text-2xl">{maxEnergy.toLocaleString()}</span>
          </div>

          {/* Boost button */}
          <button
            className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            onClick={onOpenBoostOverlay}
            style={{
              background: `linear-gradient(135deg, ${leagueColors.secondary}, #f43f5e)`,
              boxShadow: `0 0 15px ${leagueColors.glow}, 0 0 5px rgba(244, 63, 94, 0.5)`,
            }}
            aria-label="Boost energy"
          >
            <FontAwesomeIcon icon={icons.rocket} className="text-white text-xl" />
          </button>
        </div>
      </div>

      {/* Progress bar container */}
      <div className="relative bg-gray-700/70 rounded-full overflow-hidden h-8 backdrop-blur-sm border border-gray-600/30">
        {/* Progress fill with animated gradient */}
        <div
          className="absolute h-full"
          style={{
            width: `${energyPercentage}%`,
            background: `linear-gradient(90deg, ${leagueColors.secondary}, ${leagueColors.primary})`,
            boxShadow: `0 0 10px ${leagueColors.glow}`,
            transition: "width 0.5s ease-out",
          }}
        >
          {/* Animated energy particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-1 bg-white/30 animate-pulse"
                style={{
                  left: `${i * 10}%`,
                  animationDuration: `${1 + (i % 3)}s`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.3 + (i % 5) / 10,
                }}
              />
            ))}
          </div>
        </div>

        {/* Energy segments */}
        <div className="absolute inset-0 flex items-center px-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-1.5 mx-0.5 rounded-sm transition-opacity duration-300"
              style={{
                background: i < energyPercentage / 5 ? `${leagueColors.text}` : "rgba(255, 255, 255, 0.2)",
                opacity: i < energyPercentage / 5 ? 0.8 : 0.2,
                boxShadow: i < energyPercentage / 5 ? `0 0 5px ${leagueColors.glow}` : "none",
              }}
            />
          ))}
        </div>

        {/* Energy percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-md">{Math.round(energyPercentage)}%</span>
        </div>

        {/* League level indicator */}
        <div
          className="absolute right-1 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg z-10"
          style={{
            background: `radial-gradient(circle, ${leagueColors.secondary}, ${leagueColors.primary})`,
            boxShadow: `0 0 8px ${leagueColors.glow}`,
          }}
        >
          <span className="text-sm font-bold" style={{ color: leagueColors.text }}>
            {league}
          </span>
        </div>
      </div>
    </div>
  )
}
