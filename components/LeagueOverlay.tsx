"use client"

import { useState, useRef, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { icons } from "@/icons"
import type { LeagueOverlayProps } from "@/types"
import { useLeagueData } from "@/data/GeneralData"
import { leaderboardData } from "@/data/leaderboardData"
import Image from "next/image"

export default function LeagueOverlay({ onClose, coins }: LeagueOverlayProps) {
  const [currentLeague, setCurrentLeague] = useState<number>(4)
  const [animateLeague, setAnimateLeague] = useState(false)
  const [isLeaderboardCollapsed, setIsLeaderboardCollapsed] = useState(false)
  const totalLeagues = 7
  const leaderboardRef = useRef<HTMLDivElement>(null)
  const { getLeagueImage, getLeagueColors, getLeagueCoin, getLeagueName } = useLeagueData()
  const totalNeeded = getLeagueCoin(currentLeague)
  const colors = getLeagueColors(currentLeague)

  // Animate on mount
  useEffect(() => {
    setAnimateLeague(true)
  }, [])

  const handleNextLeague = () => {
    setAnimateLeague(false)
    setTimeout(() => {
      setCurrentLeague((prevLeague) => (prevLeague < totalLeagues ? prevLeague + 1 : 1))
      setAnimateLeague(true)
    }, 300)
  }

  const handlePrevLeague = () => {
    setAnimateLeague(false)
    setTimeout(() => {
      setCurrentLeague((prevLeague) => (prevLeague > 1 ? prevLeague - 1 : totalLeagues))
      setAnimateLeague(true)
    }, 300)
  }

  const handleSliderScroll = (direction: "up" | "down") => {
    const slider = leaderboardRef.current
    if (slider) {
      const scrollAmount = direction === "up" ? -100 : 100
      slider.scrollBy({ top: scrollAmount, behavior: "smooth" })
    }
  }

  const toggleLeaderboard = () => {
    setIsLeaderboardCollapsed(!isLeaderboardCollapsed)
  }

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (coins / totalNeeded) * 100)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-500"
      style={{
        background: `linear-gradient(to bottom, rgba(13, 17, 28, 0.98), rgba(13, 17, 28, 0.95))`,
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 bg-opacity-50 text-gray-300 transition-all duration-300 hover:bg-opacity-70"
      >
        <FontAwesomeIcon icon={icons.times} size="lg" />
      </button>

      <div className="relative w-full max-w-md mx-auto h-full max-h-screen flex flex-col px-6 py-8 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-1">League Rankings</h2>
          <div className="text-gray-400">Climb the ranks to earn more rewards</div>
        </div>

        {/* League Image and Navigation */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center mb-4">
          <div className="flex items-center justify-center w-full mb-4">
            <button
              onClick={handlePrevLeague}
              className="h-12 w-12 rounded-full bg-gray-800 bg-opacity-70 text-white transition-all duration-300 hover:bg-opacity-100 flex items-center justify-center mr-6"
              style={{
                border: `1px solid ${colors.secondary}40`,
              }}
            >
              <FontAwesomeIcon icon={icons.chevronLeft} />
            </button>

            <div className="relative">
              <div
                className={`relative transition-all duration-500 ${animateLeague ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
              >
                <div
                  className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${colors.secondary}40, ${colors.primary}80)`,
                    boxShadow: `0 0 30px ${colors.glow}`,
                    border: `2px solid ${colors.secondary}80`,
                  }}
                >
                  <Image
                    src={getLeagueImage(currentLeague) || "/placeholder.svg"}
                    alt={`League ${currentLeague}`}
                    width={100}
                    height={100}
                    className="object-contain transition-all duration-500"
                    style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNextLeague}
              className="h-12 w-12 rounded-full bg-gray-800 bg-opacity-70 text-white transition-all duration-300 hover:bg-opacity-100 flex items-center justify-center ml-6"
              style={{
                border: `1px solid ${colors.secondary}40`,
              }}
            >
              <FontAwesomeIcon icon={icons.chevronRight} />
            </button>
          </div>

          <div
            className={`text-center transition-all duration-500 ${animateLeague ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
              {getLeagueName(currentLeague)} League
            </h3>
            <div className="text-gray-400">
              League {currentLeague} of {totalLeagues}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex-shrink-0 mb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-gray-400">Your Progress</div>
            <div className="flex items-center text-lg font-bold">
              <FontAwesomeIcon icon={icons.coins} className="mr-2 text-yellow-400" />
              <span className="text-yellow-300">{formatNumber(coins)}</span>
              <span className="mx-1 text-gray-500">/</span>
              <span className="text-white">{formatNumber(totalNeeded)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-800 mb-2 border border-gray-700">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-center"
              style={{
                width: `${progressPercentage}%`,
                background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`,
                boxShadow: `0 0 10px ${colors.glow}`,
              }}
            >
              {progressPercentage > 5 && (
                <span className="text-xs font-bold text-white px-2">{Math.round(progressPercentage)}%</span>
              )}
            </div>

            {progressPercentage <= 5 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{Math.round(progressPercentage)}%</span>
              </div>
            )}
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-300">
              Need <span className="font-bold text-yellow-300">{formatNumber(totalNeeded - coins)}</span> more coins to
              advance
            </span>
          </div>
        </div>

        {/* Leaderboard Section - Collapsible */}
        <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4 border border-gray-700 flex-1 min-h-0 flex flex-col">
          <div className="mb-2 flex items-center justify-between cursor-pointer" onClick={toggleLeaderboard}>
            <h3 className="text-xl font-bold text-white">Top Players</h3>
            <div className="flex">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSliderScroll("up")
                }}
                className="h-8 w-8 rounded-l-lg bg-gray-700 text-gray-300 transition-colors hover:bg-gray-600 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={icons.chevronUp} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSliderScroll("down")
                }}
                className="h-8 w-8 rounded-r-lg bg-gray-700 text-gray-300 transition-colors hover:bg-gray-600 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={icons.chevronDown} />
              </button>
            </div>
          </div>

          <div
            className={`relative overflow-hidden transition-all duration-500 flex-1 min-h-0 ${
              isLeaderboardCollapsed ? "max-h-0" : "max-h-full"
            }`}
          >
            <div
              ref={leaderboardRef}
              className="overflow-y-auto scrollbar-hide h-full"
              style={{
                scrollSnapType: "y mandatory",
                scrollBehavior: "smooth",
              }}
            >
              {leaderboardData[currentLeague]?.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center border-b border-gray-700 py-3 transition-all duration-300"
                  style={{ scrollSnapAlign: "start" }}
                >
                  {/* Rank */}
                  <div className="mr-3">
                    {index < 3 ? (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{
                          background:
                            index === 0
                              ? "linear-gradient(135deg, #FFD700, #FFA500)"
                              : index === 1
                                ? "linear-gradient(135deg, #C0C0C0, #A9A9A9)"
                                : "linear-gradient(135deg, #CD7F32, #8B4513)",
                          boxShadow: `0 0 10px ${index === 0 ? "rgba(255, 215, 0, 0.5)" : index === 1 ? "rgba(192, 192, 192, 0.5)" : "rgba(205, 127, 50, 0.5)"}`,
                        }}
                      >
                        <FontAwesomeIcon icon={icons.star} className="text-white" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 font-bold text-gray-300">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex flex-1 items-center">
                    <div
                      className="mr-3 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${colors.secondary}40, ${colors.primary}80)`,
                        color: colors.text,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">{user.name}</div>
                      <div className="text-sm text-gray-400">Rank #{index + 1}</div>
                    </div>
                    <div className="flex items-center text-xl font-bold text-yellow-400">
                      {formatNumber(user.coins)}
                      <FontAwesomeIcon icon={icons.coins} className="ml-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collapse/Expand indicator */}
          <div
            className="flex justify-center mt-2 cursor-pointer text-gray-400 hover:text-gray-300"
            onClick={toggleLeaderboard}
          >
            <FontAwesomeIcon
              icon={isLeaderboardCollapsed ? icons.chevronDown : icons.chevronUp}
              className="transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to format numbers in a more readable way
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
