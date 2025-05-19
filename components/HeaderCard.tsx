"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
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
  const { hourlyEarn: contextHourlyEarn, logout } = useUser()

  // Use the hourlyEarn from props if provided, otherwise use from context
  const displayHourlyEarn = hourlyEarn !== undefined ? hourlyEarn : contextHourlyEarn

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

      <div className="flex items-center space-x-3">
        <div
          className="flex items-center rounded-full py-2 px-4 border transition-all hover:shadow-lg"
          style={{
            background: `linear-gradient(to right, #3b82f630, #60a5fa30)`,
            borderColor: `#60a5fa60`,
            boxShadow: `0 2px 8px #60a5fa30`,
          }}
        >
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2" />
          <div>
            <span className="font-medium text-white text-lg">{displayHourlyEarn.toLocaleString()}</span>
            <span className="text-gray-400 text-xs ml-1">/hour</span>
          </div>
        </div>

        <button onClick={logout} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
          <FontAwesomeIcon icon={icons.signOut} className="text-gray-300" />
        </button>
      </div>
    </div>
  )
}
