"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { EnergyBarProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"

export default function EnergyBar({ energy, maxEnergy, boost, onOpenBoostOverlay, league }: EnergyBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevEnergy, setPrevEnergy] = useState(energy)
  const { getLeagueColors } = useLeagueData()
  const leagueColors = getLeagueColors(league)

  // Calculate energy percentage
  const energyPercentage = (energy / maxEnergy) * 100

  // Track energy changes for animations
  useEffect(() => {
    if (energy !== prevEnergy) {
      setIsAnimating(true)
      setPrevEnergy(energy)

      // End animation after transition
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [energy, prevEnergy])

  // Format energy with colored value
  const formattedEnergy = (
    <span>
      <span
        className={energy < maxEnergy * 0.2 ? "text-red-400" : energy === maxEnergy ? "text-green-400" : "text-white"}
      >
        {energy}
      </span>
      <span className="text-gray-300"> / {maxEnergy}</span>
    </span>
  )

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-bold text-lg flex items-center">
          <FontAwesomeIcon
            icon={icons.bolt}
            className={`mr-2 ${isAnimating ? "animate-pulse text-yellow-300" : "text-white"}`}
            style={{ animationDuration: "0.5s" }}
          />
          Energy
        </div>
        <div className="text-white font-bold text-lg">{formattedEnergy}</div>
      </div>

      <div className="flex items-center mt-2">
        {/* Progress bar container */}
        <div className="flex-grow relative bg-gray-800/60 rounded-full overflow-hidden h-12 mr-3 shadow-inner border border-gray-700/30">
          {/* Progress fill with gradient */}
          <div
            id="energy-progress-bar"
            className="absolute h-full"
            style={{
              width: `${energyPercentage}%`,
              background: `linear-gradient(to right, ${leagueColors.primary}, ${leagueColors.secondary})`,
              transition: "width 0.5s ease-out, background 0.5s ease",
              boxShadow: `0 0 10px ${leagueColors.glow}`,
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shine"></div>
            </div>
          </div>

          {/* Low energy warning pulse */}
          {energy < maxEnergy * 0.2 && (
            <div
              className="absolute inset-0 bg-red-500/20 animate-pulse rounded-full"
              style={{ animationDuration: "1.5s" }}
            ></div>
          )}
        </div>

        {/* Boost button */}
        <button
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg transform hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(to bottom right, ${leagueColors.primary}, ${leagueColors.secondary})`,
            boxShadow: `0 4px 12px ${leagueColors.glow}`,
            transition: "all 0.3s ease, background 0.5s ease, box-shadow 0.5s ease",
          }}
          onClick={onOpenBoostOverlay}
          aria-label="Boost energy"
        >
          <FontAwesomeIcon
            icon={icons.rocket}
            className={`text-white text-lg ${energy < maxEnergy * 0.3 ? "animate-pulse" : ""}`}
            style={{ animationDuration: "2s" }}
          />
        </button>
      </div>
    </div>
  )
}
