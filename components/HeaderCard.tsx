"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagueData } from "@/data/GeneralData"
import { useUser } from "@/context/UserContext"

export default function HeaderCard({
  coins,
  league,
  hourlyEarn,
}: {
  coins?: number
  league?: number
  hourlyEarn?: number
}) {
  const { getLeagueColors } = useLeagueData()
  const { hourlyEarn: contextHourlyEarn } = useUser()

  // Use the hourlyEarn from props if provided, otherwise use from context
  const displayHourlyEarn = hourlyEarn !== undefined ? hourlyEarn : contextHourlyEarn

  // Use league 6 if not provided
  const colors = getLeagueColors(league || 6)

  return (
    <div className="bg-gray-800/60 py-3 px-4 mb-4 rounded-lg flex justify-between items-center shadow-lg backdrop-blur-sm border border-gray-700/70">
      <div
        className="flex items-center bg-gradient-to-r rounded-full py-2 px-4 shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: `linear-gradient(135deg, #b47300, #ffd700)`,
          boxShadow: `0 4px 12px rgba(255, 215, 0, 0.3)`,
        }}
      >
        <FontAwesomeIcon
          icon={icons.coins}
          className="text-yellow-300 mr-2 animate-pulse"
          style={{ animationDuration: "3s" }}
        />
        <span className="text-white font-bold text-lg">{coins?.toLocaleString()}</span>
      </div>

      <div
        className="flex items-center rounded-full py-2 px-4 border transition-all hover:shadow-lg"
        style={{
          background: `linear-gradient(to right, ${colors.primary}30, ${colors.secondary}30)`,
          borderColor: `${colors.secondary}60`,
          boxShadow: `0 2px 8px ${colors.glow}30`,
        }}
      >
        <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
        <div>
          <span className="font-medium text-white text-lg">{displayHourlyEarn.toLocaleString()}</span>
          <span className="text-gray-400 text-xs ml-1">/hour</span>
        </div>
      </div>
    </div>
  )
}
