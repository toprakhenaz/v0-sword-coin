"use client"

import { useCallback } from "react"

// League images mapping
export const ligImage: Record<number, string> = {
  1: "/leagues/bronze.png",
  2: "/leagues/silver.png",
  3: "/leagues/gold.png",
  4: "/leagues/platinum.png",
  5: "/leagues/diamond.png",
  6: "/leagues/master.png",
}

// League colors
const leagueColors: Record<number, string> = {
  1: "#CD7F32", // Bronze
  2: "#C0C0C0", // Silver
  3: "#FFD700", // Gold
  4: "#E5E4E2", // Platinum
  5: "#B9F2FF", // Diamond
  6: "#9D00FF", // Master
}

// League coin requirements
const leagueCoins: Record<number, number> = {
  1: 1000,
  2: 10000,
  3: 100000,
  4: 1000000,
  5: 10000000,
  6: 100000000,
}

// Custom hook for league data
export const useLeagueData = () => {
  const getLeagueImage = useCallback((league: number) => {
    return ligImage[league] || "/leagues/bronze.png"
  }, [])

  const getLeagueColor = useCallback((league: number) => {
    return leagueColors[league] || leagueColors[1]
  }, [])

  const getLeagueCoin = useCallback((league: number) => {
    return leagueCoins[league] || leagueCoins[1]
  }, [])

  return {
    getLeagueImage,
    getLeagueColor,
    getLeagueCoin,
  }
}
