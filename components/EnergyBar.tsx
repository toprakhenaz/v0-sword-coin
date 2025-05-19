"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"

export default function EnergyBar({ energy, maxEnergy }: { energy: number; maxEnergy: number }) {
  const percentage = (energy / maxEnergy) * 100

  return (
    <div className="bg-gray-800/60 p-4 rounded-lg shadow-lg backdrop-blur-sm border border-gray-700/70">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FontAwesomeIcon icon={icons.bolt} className="text-yellow-400 mr-2" />
          <span className="text-white font-medium">Energy</span>
        </div>
        <div className="text-white">
          {energy}/{maxEnergy}
        </div>
      </div>
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
