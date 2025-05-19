"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { motion } from "framer-motion"
import { useLeagueData } from "@/data/GeneralData"
import { useState } from "react"

interface DailyComboProps {
  reward: number
  isCheckedIn: boolean
  onCheckIn: () => void
  league: number
  streak: number
}

export default function DailyCombo({ reward, isCheckedIn, onCheckIn, league, streak }: DailyComboProps) {
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(league)
  const [isHovering, setIsHovering] = useState(false)

  return (
    <motion.div
      className="mb-4 rounded-xl overflow-hidden border border-gray-700/50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}60)`,
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 10px ${colors.glow}`,
              }}
            >
              <FontAwesomeIcon icon={icons.star} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Daily Check-in</h2>
              <p className="text-sm text-gray-300">
                <span className="text-yellow-300 font-medium">{streak} day</span> streak
              </p>
            </div>
          </div>
          <div className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full">
            <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-1" />
            <span className="text-yellow-300 font-bold">{reward}</span>
          </div>
        </div>

        {/* Daily check-in card */}
        <motion.div
          className={`bg-gray-800/70 rounded-lg p-4 flex items-center justify-between ${
            isCheckedIn ? "border border-green-500/50" : "border border-gray-700/50"
          }`}
          whileHover={{ scale: isCheckedIn ? 1 : 1.02 }}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          <div className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                isCheckedIn ? "bg-green-500/20" : "bg-gray-700/50"
              }`}
            >
              {isCheckedIn ? (
                <FontAwesomeIcon icon={icons.check} className="text-green-500 text-xl" />
              ) : (
                <FontAwesomeIcon
                  icon={icons.star}
                  className={`text-yellow-400 text-xl ${isHovering ? "animate-pulse" : ""}`}
                />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white">Daily Login Bonus</h3>
              <p className="text-sm text-gray-300">
                {isCheckedIn ? "You've claimed today's reward!" : "Tap to claim your daily reward"}
              </p>
            </div>
          </div>

          <button
            onClick={onCheckIn}
            disabled={isCheckedIn}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isCheckedIn
                ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700"
            }`}
          >
            {isCheckedIn ? "Claimed" : "Claim"}
          </button>
        </motion.div>

        {/* Streak info */}
        <div className="mt-3 text-center text-sm text-gray-400">Come back tomorrow for another reward!</div>
      </div>
    </motion.div>
  )
}
