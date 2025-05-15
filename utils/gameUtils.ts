// Game utility functions

export const cardCategories = ["Equipment", "Workers", "Isekai", "Special"]

export function calculateEarningsInterval(hourlyEarnings: number) {
  // Calculate how often to give coins based on hourly earnings
  // For small earnings, give more frequently but in smaller amounts
  // For large earnings, give less frequently but in larger amounts

  let intervalDuration = 1000 // Default: 1 second
  let earningsPerInterval = hourlyEarnings / 3600 // Default: hourly / 3600 seconds

  if (hourlyEarnings > 10000) {
    intervalDuration = 100 // 0.1 seconds
    earningsPerInterval = hourlyEarnings / 36000 // hourly / (3600 * 10)
  } else if (hourlyEarnings > 1000) {
    intervalDuration = 500 // 0.5 seconds
    earningsPerInterval = hourlyEarnings / 7200 // hourly / (3600 * 2)
  }

  return {
    intervalDuration,
    earningsPerInterval: Math.max(1, Math.floor(earningsPerInterval)),
  }
}

export function getLeagueUpgradeCost(league: number): number | null {
  switch (league) {
    case 1:
      return 10000
    case 2:
      return 50000
    case 3:
      return 250000
    case 4:
      return 1000000
    case 5:
      return 5000000
    case 6:
      return 25000000
    case 7:
      return 100000000
    case 8:
      return 500000000
    case 9:
      return 2500000000
    case 10:
      return 10000000000
    default:
      return null // No more leagues after 10
  }
}

export function getLeagueReward(league: number): number {
  switch (league) {
    case 1:
      return 0
    case 2:
      return 5000
    case 3:
      return 25000
    case 4:
      return 100000
    case 5:
      return 500000
    case 6:
      return 2500000
    case 7:
      return 10000000
    case 8:
      return 50000000
    case 9:
      return 250000000
    case 10:
      return 1000000000
    default:
      return 0
  }
}

export function getLeagueName(league: number): string {
  switch (league) {
    case 1:
      return "Bronze"
    case 2:
      return "Silver"
    case 3:
      return "Gold"
    case 4:
      return "Platinum"
    case 5:
      return "Diamond"
    case 6:
      return "Master"
    case 7:
      return "Grandmaster"
    case 8:
      return "Challenger"
    case 9:
      return "Legend"
    case 10:
      return "Mythic"
    default:
      return "Unknown"
  }
}

// Eksik olan dışa aktarım
export function getLeagueColor(league: number): string {
  const colors = {
    1: "#CD7F32", // Bronze
    2: "#C0C0C0", // Silver
    3: "#FFD700", // Gold
    4: "#E5E4E2", // Platinum
    5: "#B9F2FF", // Diamond
    6: "#9370DB", // Master
    7: "#FF4500", // Grandmaster
    8: "#FF8C00", // Challenger
    9: "#4B0082", // Legend
    10: "#FF00FF", // Mythic
  }
  return colors[league as keyof typeof colors] || colors[1]
}

export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B"
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
