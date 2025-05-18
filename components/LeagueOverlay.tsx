"use client"

import { useState, useRef, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { LeagueOverlayProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"
import { leaderboardData } from "@/data/leaderboardData"
import Image from "next/image"

export default function LeagueOverlay({ onClose, coins }: LeagueOverlayProps) {
  const [currentLeague, setCurrentLeague] = useState<number>(3)
  const totalLeagues = Object.keys(leaderboardData).length
  const sliderRef = useRef<HTMLDivElement>(null)
  const { getLeagueImage, getLeagueColor, getLeagueCoin } = useLeagueData()
  const totalNeeded = getLeagueCoin(currentLeague)

  const handleNextLeague = () => {
    setCurrentLeague((prevLeague) => (prevLeague < totalLeagues ? prevLeague + 1 : 1))
  }

  const handlePrevLeague = () => {
    setCurrentLeague((prevLeague) => (prevLeague > 1 ? prevLeague - 1 : totalLeagues))
  }

  const handleSliderScroll = (direction: "up" | "down") => {
    const slider = sliderRef.current
    if (slider) {
      const scrollAmount = direction === "up" ? -100 : 100
      slider.scrollBy({ top: scrollAmount, behavior: "smooth" })
    }
  }

  useEffect(() => {
    const slider = sliderRef.current
    if (slider) {
      const handleScroll = () => {
        // Add scroll position logic here if needed
      }
      slider.addEventListener("scroll", handleScroll)
      return () => slider.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] bg-opacity-90 z-50 text-white p-6 flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-2xl text-yellow-400 hover:text-red-400 transition-colors"
      >
        <FontAwesomeIcon icon={icons.times} />
      </button>

      {/* League Image and Navigation */}
      <div className="flex-grow flex flex-col items-center justify-center space-y-4">
        <div className="relative w-full max-w-xs">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ backgroundColor: getLeagueColor(currentLeague) }}
            ></div>
            <Image
              src={getLeagueImage(currentLeague) || "/placeholder.svg"}
              alt={`League ${currentLeague}`}
              width={200}
              height={200}
              className="mx-auto relative z-10"
            />
          </div>
          <div className="text-center mt-4">
            <span className="text-2xl font-bold text-white">League {currentLeague}</span>
          </div>
          <button
            onClick={handlePrevLeague}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-yellow-400 text-gray-900 rounded-full p-2 hover:bg-yellow-300 transition-colors"
          >
            <FontAwesomeIcon icon={icons.chevronLeft} size="lg" />
          </button>
          <button
            onClick={handleNextLeague}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-yellow-400 text-gray-900 rounded-full p-2 hover:bg-yellow-300 transition-colors"
          >
            <FontAwesomeIcon icon={icons.chevronRight} size="lg" />
          </button>
        </div>

        {/* Coin Progress */}
        <div className="text-yellow-400 text-2xl flex items-center">
          <FontAwesomeIcon icon={icons.coins} className="mr-2" />
          {coins !== undefined ? coins.toLocaleString() : "0"} /{" "}
          {totalNeeded !== undefined ? totalNeeded.toLocaleString() : "0"}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs bg-gray-700 rounded-full h-6 overflow-hidden mt-2 border-2 border-yellow-400">
          <div
            className="bg-yellow-400 h-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${(coins / totalNeeded) * 100}%` }}
          >
            <span className="text-gray-900 font-bold text-sm">{Math.round((coins / totalNeeded) * 100)}%</span>
          </div>
        </div>

        {/* Top Players Section - Move up below the progress bar */}
        <div className="w-full max-w-xs bg-black bg-opacity-50 p-4 rounded-2xl shadow-2xl mt-4">
          <h3 className="text-lg font-bold mb-4 text-center">Top Players</h3>
          <div className="relative h-48">
            <div
              ref={sliderRef}
              className="overflow-y-auto scrollbar-hide h-full"
              style={{
                scrollSnapType: "y mandatory",
                scrollBehavior: "smooth",
              }}
            >
              {leaderboardData[currentLeague].map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-gray-700"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="flex items-center">
                    {index < 3 ? (
                      <FontAwesomeIcon
                        icon={icons.star}
                        className={`mr-2 text-lg ${index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-400" : "text-yellow-700"}`}
                      />
                    ) : (
                      <span className="mr-2 w-6 text-center text-lg">#{index + 1}</span>
                    )}
                    <Image
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-2 border-2 border-white"
                    />
                    <span className="text-lg font-bold">{user.name}</span>
                  </div>
                  <div className="text-yellow-400 text-lg font-semibold">
                    {user.coins.toLocaleString()} <FontAwesomeIcon icon={icons.coins} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleSliderScroll("up")}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 rounded-full p-1 hover:bg-yellow-300 transition-colors"
            >
              <FontAwesomeIcon icon={icons.chevronUp} />
            </button>
            <button
              onClick={() => handleSliderScroll("down")}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-yellow-400 text-gray-900 rounded-full p-1 hover:bg-yellow-300 transition-colors"
            >
              <FontAwesomeIcon icon={icons.chevronDown} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
