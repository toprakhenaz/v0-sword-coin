"use client"
import { useLeagueData } from "@/data/GeneralData"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { motion } from "framer-motion"

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

  return (
    <motion.div
      className="mb-4 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
        boxShadow: `0 4px 12px ${colors.glow}40`,
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Günlük Ödül</h2>
            <p className="text-sm text-white/80">Streak: {streak} gün</p>
          </div>
          <button
            onClick={onCheckIn}
            disabled={isCheckedIn}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isCheckedIn ? "bg-gray-700/50 text-gray-400 cursor-not-allowed" : "bg-yellow-300 text-yellow-900"
            }`}
          >
            <FontAwesomeIcon icon={icons.gift} className="mr-2" />
            {isCheckedIn ? "Alındı" : "Ödülü Al"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 relative h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="absolute h-full left-0 top-0 rounded-full bg-blue-500"
            style={{ width: `${(streak / 7) * 100}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  )
}
