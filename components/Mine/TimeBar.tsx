"use client"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { TimerBarProps } from "@/types"
import { getCardImage } from "@/data/cardData"

export default function TimerBar({ dailyCombo, foundCards }: TimerBarProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean[]>([false, false, false])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
      const timeRemaining = Math.floor((endOfDay.getTime() - now.getTime()) / 1000)
      setTimeLeft(timeRemaining)
    }

    calculateTimeLeft()

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalId)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  // Flip animation for cards
  const toggleCardFlip = (index: number) => {
    const newIsFlipped = [...isFlipped]
    newIsFlipped[index] = !newIsFlipped[index]
    setIsFlipped(newIsFlipped)
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <>
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center mr-3">
            <FontAwesomeIcon icon={icons.clock} className="text-gray-900 text-lg" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-semibold">Daily Combo</div>
            <div className="text-xs sm:text-sm text-yellow-300 font-mono">{formatTime(timeLeft)}</div>
          </div>
        </div>
        <div className="flex items-center">
          <FontAwesomeIcon icon={icons.coins} className="text-yellow-400 mr-2 text-lg" />
          <span className="text-lg sm:text-xl font-bold text-white">100,000</span>
          <FontAwesomeIcon icon={icons.infoCircle} className="ml-3 text-blue-300 hover:text-blue-200 cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 my-3">
        {dailyCombo.map((cardId, index) => (
          <div key={cardId} className="relative perspective cursor-pointer" onClick={() => toggleCardFlip(index)}>
            <div
              className={`card-inner transition-transform duration-500 preserve-3d ${isFlipped[index] && foundCards.includes(cardId) ? "rotate-y-180" : ""}`}
            >
              <div className="card-front absolute w-full bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg p-2 border-2 border-gray-600 shadow-lg flex items-center justify-center backface-hidden aspect-square">
                {foundCards.includes(cardId) ? (
                  <div className="opacity-0 animate-fadeIn">
                    <FontAwesomeIcon icon={icons.question} className="text-5xl text-yellow-400" />
                  </div>
                ) : (
                  <FontAwesomeIcon icon={icons.question} className="text-5xl text-yellow-400 animate-pulse" />
                )}
              </div>

              {foundCards.includes(cardId) && (
                <div className="card-back absolute w-full bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-lg p-2 border-2 border-yellow-400 shadow-lg rotate-y-180 backface-hidden aspect-square overflow-hidden">
                  <img
                    src={getCardImage(cardId) || "/placeholder.png"}
                    alt={`Card ${cardId}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
            </div>

            {foundCards.includes(cardId) && (
              <div className="absolute top-0 right-0 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 z-10 shadow-lg">
                <FontAwesomeIcon icon={icons.check} className="text-xs" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
