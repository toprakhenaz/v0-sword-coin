"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { TimerBarProps } from "@/types"
import { getCardImage } from "@/data/cardData"
import { useLeagueData } from "@/data/GeneralData"
import { useUser } from "@/context/UserContext"

export default function TimerBar({ dailyCombo, foundCards }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean[]>([false, false, false])
  const { getLeagueColors } = useLeagueData()
  const { findComboCard } = useUser()
  const colors = getLeagueColors(6) // Use league 6 colors for the timer bar

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      const timeRemaining = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)
      setTimeLeft(timeRemaining)
    }

    calculateTimeLeft()

    const intervalId = setInterval(() => {
      calculateTimeLeft()
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  // Flip animation for cards
  const toggleCardFlip = async (index: number) => {
    if (foundCards.includes(dailyCombo[index])) {
      // Card already found, just toggle flip animation
      const newIsFlipped = [...isFlipped]
      newIsFlipped[index] = !newIsFlipped[index]
      setIsFlipped(newIsFlipped)
    } else {
      // Find the card in the combo
      const result = await findComboCard(index)
      if (result.success) {
        // Show flip animation
        const newIsFlipped = [...isFlipped]
        newIsFlipped[index] = true
        setIsFlipped(newIsFlipped)
      }
    }
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <>
      <div
        className="rounded-lg p-4 flex items-center justify-between shadow-lg mb-4"
        style={{
          background: `linear-gradient(to right, ${colors.primary}40, ${colors.secondary}60)`,
          border: `1px solid ${colors.secondary}60`,
          boxShadow: `0 4px 12px ${colors.glow}30`,
        }}
      >
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          >
            <FontAwesomeIcon icon={icons.clock} className="text-lg" style={{ color: colors.text }} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-semibold text-white">Daily Combo</div>
            <div className="text-xs sm:text-sm font-mono" style={{ color: colors.text }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2 text-lg" />
          <span className="text-lg sm:text-xl font-bold text-white">100,000</span>
          <FontAwesomeIcon
            icon={icons.infoCircle}
            className="ml-3 text-blue-300 hover:text-blue-200 cursor-pointer transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 my-3">
        {dailyCombo.map((cardId, index) => (
          <div key={cardId} className="relative perspective cursor-pointer" onClick={() => toggleCardFlip(index)}>
            <div
              className={`relative w-full transition-transform duration-500 transform-style-3d ${
                isFlipped[index] && foundCards.includes(cardId) ? "rotate-y-180" : ""
              }`}
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 0.5s",
                transform: isFlipped[index] && foundCards.includes(cardId) ? "rotateY(180deg)" : "",
              }}
            >
              <div
                className="absolute w-full rounded-lg p-2 border-2 shadow-lg flex items-center justify-center aspect-square"
                style={{
                  backfaceVisibility: "hidden",
                  background: `linear-gradient(to bottom, ${colors.primary}60, ${colors.secondary}80)`,
                  borderColor: colors.secondary,
                  boxShadow: `0 4px 12px ${colors.glow}40`,
                }}
              >
                {foundCards.includes(cardId) ? (
                  <div className="opacity-0 animate-fadeIn">
                    <FontAwesomeIcon icon={icons.question} className="text-5xl" style={{ color: colors.text }} />
                  </div>
                ) : (
                  <FontAwesomeIcon
                    icon={icons.question}
                    className="text-5xl animate-pulse"
                    style={{ color: colors.text }}
                  />
                )}
              </div>

              {foundCards.includes(cardId) && (
                <div
                  className="absolute w-full rounded-lg p-2 border-2 shadow-lg aspect-square overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary})`,
                    borderColor: colors.secondary,
                    boxShadow: `0 4px 12px ${colors.glow}`,
                  }}
                >
                  <img
                    src={getCardImage(cardId) || "/placeholder.svg"}
                    alt={`Card ${cardId}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
            </div>

            {foundCards.includes(cardId) && (
              <div
                className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 z-10 shadow-lg"
                style={{
                  background: `linear-gradient(to bottom right, #22c55e, #16a34a)`,
                  boxShadow: `0 0 10px rgba(34, 197, 94, 0.5)`,
                }}
              >
                <FontAwesomeIcon icon={icons.check} className="text-xs text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
