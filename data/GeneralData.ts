"use client"

export function useLeagueData() {
  const leagueData = [
    {
      id: 1,
      name: "Wooden",
      colors: {
        primary: "#8B4513",
        secondary: "#A0522D",
        glow: "#CD853F",
      },
    },
    {
      id: 2,
      name: "Bronze",
      colors: {
        primary: "#CD7F32",
        secondary: "#B87333",
        glow: "#D2691E",
      },
    },
    {
      id: 3,
      name: "Iron",
      colors: {
        primary: "#708090",
        secondary: "#778899",
        glow: "#B0C4DE",
      },
    },
    {
      id: 4,
      name: "Steel",
      colors: {
        primary: "#71797E",
        secondary: "#848884",
        glow: "#D3D3D3",
      },
    },
    {
      id: 5,
      name: "Adamantite",
      colors: {
        primary: "#9370DB",
        secondary: "#8A2BE2",
        glow: "#E6E6FA",
      },
    },
    {
      id: 6,
      name: "Legendary",
      colors: {
        primary: "#FFD700",
        secondary: "#FFA500",
        glow: "#FFFF00",
      },
    },
    {
      id: 7,
      name: "Dragon",
      colors: {
        primary: "#FF4500",
        secondary: "#FF0000",
        glow: "#FF7F50",
      },
    },
  ]

  const getLeagueById = (id: number) => {
    return leagueData.find((league) => league.id === id) || leagueData[0]
  }

  const getLeagueColors = (id: number) => {
    return getLeagueById(id).colors
  }

  return {
    leagueData,
    getLeagueById,
    getLeagueColors,
  }
}
