"use client"

import { useState } from "react"

// League data
const leagueData = [
  {
    id: 1,
    name: "Wooden",
    threshold: 0,
    colors: {
      primary: "#8B4513",
      secondary: "#A0522D",
      glow: "#CD853F",
    },
  },
  {
    id: 2,
    name: "Bronze",
    threshold: 10000,
    colors: {
      primary: "#CD7F32",
      secondary: "#B87333",
      glow: "#D2691E",
    },
  },
  {
    id: 3,
    name: "Iron",
    threshold: 100000,
    colors: {
      primary: "#708090",
      secondary: "#778899",
      glow: "#B0C4DE",
    },
  },
  {
    id: 4,
    name: "Steel",
    threshold: 1000000,
    colors: {
      primary: "#71797E",
      secondary: "#848884",
      glow: "#D3D3D3",
    },
  },
  {
    id: 5,
    name: "Adamantite",
    threshold: 10000000,
    colors: {
      primary: "#50C878",
      secondary: "#3CB371",
      glow: "#7FFFD4",
    },
  },
  {
    id: 6,
    name: "Legendary",
    threshold: 100000000,
    colors: {
      primary: "#FFD700",
      secondary: "#FFA500",
      glow: "#FFFF00",
    },
  },
  {
    id: 7,
    name: "Dragon",
    threshold: 1000000000,
    colors: {
      primary: "#FF4500",
      secondary: "#FF0000",
      glow: "#FF7F50",
    },
  },
]

export function useLeagueData() {
  const [leagues, setLeagues] = useState(leagueData)

  // Get league by ID
  const getLeague = (id: number) => {
    return leagues.find((league) => league.id === id) || leagues[0]
  }

  // Get league colors by ID
  const getLeagueColors = (id: number) => {
    const league = getLeague(id)
    return league.colors
  }

  // Get league name by ID
  const getLeagueName = (id: number) => {
    const league = getLeague(id)
    return league.name
  }

  // Get next league by current league ID
  const getNextLeague = (id: number) => {
    const nextId = id + 1
    return leagues.find((league) => league.id === nextId)
  }

  // Get league by coins amount
  const getLeagueByCoins = (coins: number) => {
    for (let i = leagues.length - 1; i >= 0; i--) {
      if (coins >= leagues[i].threshold) {
        return leagues[i]
      }
    }
    return leagues[0]
  }

  return {
    leagues,
    getLeague,
    getLeagueColors,
    getLeagueName,
    getNextLeague,
    getLeagueByCoins,
  }
}
