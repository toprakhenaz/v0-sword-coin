"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import { useLeagueData } from "@/data/GeneralData"
import { motion } from "framer-motion"

interface TokenCounterProps {
  totalTokens: number
  league: number
}

export default function TokenCounter({ totalTokens, league }: TokenCounterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getLeagueColors } = useLeagueData()
  const colors = getLeagueColors(league)

  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Set the listing date (3 months from now)
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      // Set listing date to 3 months from now
      const listingDate = new Date(now)
      listingDate.setMonth(now.getMonth() + 3)

      const difference = listingDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      }
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <motion.div
      className="mb-4 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="p-4 relative"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}70, ${colors.secondary}90)`,
          borderBottom: isExpanded ? `1px solid ${colors.secondary}40` : "none",
        }}
      >
        {/* Background pattern with swords instead of hamsters */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('/patterns/sword-pattern.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay",
          }}
        ></div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-lg"
              style={{
                background: `linear-gradient(135deg, #ff3e9d, #fe2d6d)`,
                boxShadow: `0 4px 10px rgba(254, 45, 109, 0.5)`,
              }}
            >
              <FontAwesomeIcon icon={icons.coins} className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Token Balance</h2>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white transition-colors"
          >
            <FontAwesomeIcon
              icon={isExpanded ? icons.chevronUp : icons.chevronDown}
              className="text-sm transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      {/* Expanded content with listing countdown */}
      {isExpanded && (
        <motion.div
          className="p-4"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}60)`,
          }}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-2 text-center">
            <div className="text-gray-200 text-sm mb-1">Token Listing Countdown</div>
            <div className="flex justify-center space-x-3">
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                  {countdown.days}
                </div>
                <div className="text-xs text-gray-300 mt-1">Days</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                  {countdown.hours}
                </div>
                <div className="text-xs text-gray-300 mt-1">Hours</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                  {countdown.minutes}
                </div>
                <div className="text-xs text-gray-300 mt-1">Mins</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-800/70 rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold text-white">
                  {countdown.seconds}
                </div>
                <div className="text-xs text-gray-300 mt-1">Secs</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <div className="text-sm text-gray-300">Exchange Listing</div>
            <div className="text-white font-medium">Binance, KuCoin, Gate.io</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
