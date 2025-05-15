import type { User } from "@prisma/client"
import axios from "axios"
import type { SpecialOffer } from "@/types"

export const ligCoin: { [key: number]: number } = {
  1: 0,
  2: 10000,
  3: 50000,
  4: 100000,
  5: 500000,
  6: 1000000,
  7: 5000000,
  8: 10000000,
  9: 50000000,
  10: 100000000,
}

export const ligEearningCoin: { [key: number]: number } = {
  1: 0,
  2: 5000,
  3: 25000,
  4: 50000,
  5: 250000,
  6: 500000,
  7: 2500000,
  8: 5000000,
  9: 25000000,
  10: 50000000,
}

export const ligImage: { [key: number]: string } = {
  1: "/leagues/bronze.png",
  2: "/leagues/silver.png",
  3: "/leagues/gold.png",
  4: "/leagues/platinum.png",
  5: "/leagues/diamond.png",
  6: "/leagues/master.png",
  7: "/leagues/grandmaster.png",
  8: "/leagues/challenger.png",
  9: "/leagues/legend.png",
  10: "/leagues/mythic.png",
}

export const dailyRewardData: number[] = [100, 200, 300, 400, 500, 750, 1000]

export const missions: SpecialOffer[] = [
  {
    id: 1,
    title: "Binance'e Kaydol",
    reward: 5000,
    link: "https://www.binance.com/",
  },
  {
    id: 2,
    title: "Coinbase'e Kaydol",
    reward: 4000,
    link: "https://www.coinbase.com/",
  },
  {
    id: 3,
    title: "Telegram Kanalına Katıl",
    reward: 1000,
    link: "https://t.me/swordcoin",
  },
  {
    id: 4,
    title: "Twitter'da Takip Et",
    reward: 1500,
    link: "https://twitter.com/swordcoin",
  },
  {
    id: 5,
    title: "Discord Sunucusuna Katıl",
    reward: 2000,
    link: "https://discord.gg/swordcoin",
  },
  {
    id: 6,
    title: "YouTube Kanalına Abone Ol",
    reward: 1200,
    link: "https://youtube.com/swordcoin",
  },
]

export const useLeagueData = () => {
  const getLeagueImage = (league: number): string => {
    return ligImage[league] || "/leagues/bronze.png"
  }

  const getLeagueColor = (league: number): string => {
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

  const getLeagueCoin = (league: number): number => {
    return ligCoin[league + 1] || 0
  }

  return { getLeagueImage, getLeagueColor, getLeagueCoin }
}

export const saveUserData = async (user: User) => {
  try {
    await axios.post("/api/saveUser", user)
  } catch (error) {
    console.error("Error saving user data:", error)
  }
}

export const calculateEarningsInterval = (hourlyEarnings: number) => {
  // For very small earnings, update less frequently but with larger amounts
  if (hourlyEarnings < 10) {
    return {
      intervalDuration: 60000, // 1 minute
      earningsPerInterval: hourlyEarnings / 60,
    }
  }

  // For medium earnings, update every 10 seconds
  if (hourlyEarnings < 1000) {
    return {
      intervalDuration: 10000, // 10 seconds
      earningsPerInterval: hourlyEarnings / 360,
    }
  }

  // For large earnings, update every 5 seconds
  if (hourlyEarnings < 10000) {
    return {
      intervalDuration: 5000, // 5 seconds
      earningsPerInterval: hourlyEarnings / 720,
    }
  }

  // For very large earnings, update every 2 seconds
  return {
    intervalDuration: 2000, // 2 seconds
    earningsPerInterval: hourlyEarnings / 1800,
  }
}
