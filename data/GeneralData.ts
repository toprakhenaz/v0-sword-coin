"use client"

import { useCallback } from "react"

// League images mapping
export const ligImage: Record<number, string> = {
  1: "/leagues/wooden-sword.png",
  2: "/leagues/bronze-sword.png",
  3: "/leagues/iron-sword.png",
  4: "/leagues/steel-sword.png",
  5: "/leagues/adamantite-sword.png",
  6: "/leagues/legendary-sword.png",
  7: "/leagues/dragon-sword.png",
}

// League colors - primary and secondary colors for each league
export const leagueColors: Record<number, { primary: string; secondary: string; text: string; glow: string }> = {
  1: {
    primary: "#8B4513", // Wooden - Brown
    secondary: "#A0522D",
    text: "#FFE0B2",
    glow: "rgba(139, 69, 19, 0.7)",
  },
  2: {
    primary: "#CD7F32", // Bronze
    secondary: "#B87333",
    text: "#FFE0B2",
    glow: "rgba(205, 127, 50, 0.7)",
  },
  3: {
    primary: "#6D7B8D", // Iron - Silver-blue
    secondary: "#4F5A6B",
    text: "#E0E7FF",
    glow: "rgba(109, 123, 141, 0.7)",
  },
  4: {
    primary: "#71797E", // Steel - Gray
    secondary: "#43464B",
    text: "#FFFFFF",
    glow: "rgba(113, 121, 126, 0.7)",
  },
  5: {
    primary: "#40E0D0", // Adamantite - Turquoise
    secondary: "#48D1CC",
    text: "#003366",
    glow: "rgba(64, 224, 208, 0.7)",
  },
  6: {
    primary: "#FFD700", // Legendary - Gold
    secondary: "#FFC000",
    text: "#442C2E",
    glow: "rgba(255, 215, 0, 0.7)",
  },
  7: {
    primary: "#FF69B4", // Dragon - Pink-red
    secondary: "#FF1493",
    text: "#FFFFFF",
    glow: "rgba(255, 105, 180, 0.7)",
  },
}

// League coin requirements
const leagueCoins: Record<number, number> = {
  1: 1000,
  2: 10000,
  3: 100000,
  4: 1000000,
  5: 10000000,
  6: 100000000,
  7: 1000000000,
}

// League names
export const leagueNames: Record<number, string> = {
  1: "Ahşap",
  2: "Bronz",
  3: "Demir",
  4: "Çelik",
  5: "Adamantit",
  6: "Efsanevi",
  7: "Ejderha",
}

// Custom hook for league data
export const useLeagueData = () => {
  const getLeagueImage = useCallback((league: number) => {
    return ligImage[league] || "/leagues/wooden-sword.png"
  }, [])

  const getLeagueColors = useCallback((league: number) => {
    return leagueColors[league] || leagueColors[1]
  }, [])

  const getLeagueCoin = useCallback((league: number) => {
    return leagueCoins[league] || leagueCoins[1]
  }, [])

  const getLeagueName = useCallback((league: number) => {
    return leagueNames[league] || leagueNames[1]
  }, [])

  return {
    getLeagueImage,
    getLeagueColors,
    getLeagueCoin,
    getLeagueName,
  }
}
