"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Header from "./Header"
import CoinDisplay from "./CoinDisplay"
import CentralButton from "./CentralButton"
import EnergyBar from "./EnergyBar"
import Navbar from "../Navbar"
import { useUser } from "@/providers/UserProvider"
import Popup from "../Popup"
import LeagueOverlay from "./LeagueOverlay"
import toast from "react-hot-toast"
import type { User } from "@/types"
import { calculateEarningsInterval, getLeagueUpgradeCost, getLeagueReward } from "@/utils/gameUtils"
import { playBoostSound, playLevelUpSound } from "@/utils/soundEffects"
import confetti from "canvas-confetti"

export default function MainPage({ user: initialUser }: { user: User }) {
  const { updateUser } = useUser()
  const [user, setUser] = useState(initialUser)
  const [showPopup, setShowPopup] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false)
  const [boostMessage, setBoostMessage] = useState("")
  const [earnTapPositions, setEarnTapPositions] = useState<
    Array<{ id: string; top: number; left: number; amount: number }>
  >([])
  const userRef = useRef(user)
  const centralButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    if (user.coins === 2500 && user.league === 1 && user.referrerId) {
      setShowWelcome(true)
    }
  }, [user.coins, user.league, user.referrerId])

  // Auto-save user data periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      updateUser(userRef.current)
    }, 10000) // Save every 10 seconds

    return () => clearInterval(saveInterval)
  }, [updateUser])

  const toggleLeagueOverlay = useCallback(() => {
    setShowLeagueOverlay((prev) => !prev)
  }, [])

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(
      () => {
        setUser((prevUser) => {
          if (prevUser.energy < prevUser.energyMax) {
            return { ...prevUser, energy: Math.min(prevUser.energy + 1, prevUser.energyMax) }
          }
          return prevUser
        })
      },
      Math.max(1000 / Math.max(1, user.league), 200),
    ) // Ensure minimum interval

    return () => clearInterval(interval)
  }, [user.league, user.energyMax])

  // Hourly coin earnings
  useEffect(() => {
    const { intervalDuration, earningsPerInterval } = calculateEarningsInterval(user.coinsHourly)

    const coinInterval = setInterval(() => {
      setUser((prevUser) => ({
        ...prevUser,
        coins: prevUser.coins + earningsPerInterval,
      }))
    }, intervalDuration)

    return () => clearInterval(coinInterval)
  }, [user.coinsHourly])

  // Boost function
  const handleBoost = () => {
    const now = new Date()
    const lastBoostTime = new Date(user.lastBoostTime)
    const hoursSinceLastBoost = (now.getTime() - lastBoostTime.getTime()) / (1000 * 60 * 60)

    if (user.dailyBoostCount > 0 && hoursSinceLastBoost >= 3) {
      playBoostSound()
      
      setUser((prevUser) => ({
        ...prevUser,
        energy: prevUser.energyMax,
        lastBoostTime: now.toISOString(),
        dailyBoostCount: prevUser.dailyBoostCount - 1,
      }))

      // Show success animation
      if (centralButtonRef.current) {
        const buttonRect = centralButtonRef.current.getBoundingClientRect()
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const angle = Math.random() * Math.PI * 2
            const distance = 50 + Math.random() * 100

            setEarnTapPositions((prev) => [
              ...prev,
              {
                id: `boost-${Date.now()}-${i}`,
                top: buttonRect.top + buttonRect.height / 2 - Math.sin(angle) * distance,
                left: buttonRect.left + buttonRect.width / 2 + Math.cos(angle) * distance,
                amount: Math.floor(user.energyMax / 5),
              },
            ])
          }, i * 100)
        }
      }
    } else {
      setBoostMessage(
        user.dailyBoostCount === 0 ? "You've used all your daily boosts!" : "You need to wait 3 hours between boosts!",
      )
      setShowPopup(true)
    }
  }

  const getRandomPosition = () => {
    if (centralButtonRef.current) {
      const buttonRect = centralButtonRef.current.getBoundingClientRect()
      const horizontalOffset = (Math.random() - 0.5) * buttonRect.width
      const verticalOffset = Math.random() * 30 + 20

      return {
        left: buttonRect.left + buttonRect.width / 2 + horizontalOffset,
        top: buttonRect.top - verticalOffset,
      }
    }
    return { left: 0, top: 0 }
  }

  const handleButtonClick = () => {
    if (user.energy >= user.coinsPerTap) {
      setUser((prevUser) => {
        let newCoins = prevUser.coins + prevUser.coinsPerTap
        let newLeague = prevUser.league
        let earnedCoins = 0
        let newCoinsPerTap = prevUser.coinsPerTap
        let newMaxEnergy = prevUser.energyMax

        const nextLeagueRequirement = getLeagueUpgradeCost(prevUser.league + 1)

        if (nextLeagueRequirement && newCoins >= nextLeagueRequirement) {
          newLeague = prevUser.league + 1
          earnedCoins = getLeagueReward(newLeague)
          newCoins = newCoins + earnedCoins
          newCoinsPerTap = newCoinsPerTap + 1
          newMaxEnergy = prevUser.energyMax + prevUser.league * 500
          
          // Play level up sound
          playLevelUpSound()
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
          
          setShowPopup(true)
        }

        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }

        const position = getRandomPosition()
        setEarnTapPositions((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            ...position,
            amount: prevUser.coinsPerTap,
          },
        ])

        const updatedUser = {
          ...prevUser,
          energy: Math.max(prevUser.energy - prevUser.coinsPerTap, 0),
          energyMax: newMaxEnergy,
          coins: newCoins,
          league: newLeague,
          coinsPerTap: newCoinsPerTap,
        }

        if (newLeague > prevUser.league) {
          updateUser(updatedUser)
        }

        return updatedUser
      })
    } else {
      toast.error("Not enough energy!")
    }
  }

  useEffect(() => {
    earnTapPositions.forEach((position) => {
      const timer = setTimeout(() => {
        setEarnTapPositions((prev) => prev.filter((p) => p.id !== position.id))
      }, 800) // Animation duration

      return () => clearTimeout(timer)
    })
  }, [earnTapPositions])

  const handleClosePopup = () => {
    setShowPopup(false)
    setBoostMessage("")
  }

  const handleCloseWelcome = () => {
    setShowWelcome(false)
  }

  return (
    <div className="min-h-screen flex flex-col text-white space-y-6 p-4 md:p-6 overflow-x-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <Header
        earnPerTap={user.coinsPerTap}
        coinsToLevelUp={getLeagueUpgradeCost(user.league + 1) || 0}
        crystals={user.crystals}
      />
      <CoinDisplay coins={user.coins} league={user.league} onclick={toggleLeagueOverlay} />
      <div ref={centralButtonRef} className="relative py-8 flex justify-center">
        <CentralButton onClick={handleButtonClick} league={user.league} />
        {earnTapPositions.map((position) => (
          <div
            key={position.id}
            className="absolute text-xl z-50 animate-riseAndFade font-bold text-yellow-300"
            style={{
              top: position.top,
              left: position.left,
              transform: "translate(-50%, -50%)",
              textShadow: "0 0 5px rgba(255, 215, 0, 0.7)",
            }}
          >
            +{position.amount}
          </div>
        ))}
      </div>
      <EnergyBar energy={user.energy} maxEnergy={user.energyMax} boost={handleBoost} />
      <Navbar />

      {showPopup && (
        <Popup
          title="Congratulations! League Up!"
          message={`New league: ${user.league}. You earned ${getLeagueReward(user.league)} coins in this league.`}
          image={`/leagues/league-${user.league}.png`}
          onClose={handleClosePopup}
        />
      )}

      {boostMessage && <Popup title="Warning" message={boostMessage} image="/rocket.png" onClose={handleClosePopup} />}

      {showWelcome && (
        <Popup
          title="Welcome!"
          message="Welcome to Sword Coin! Your friend has earned you 2500 coins. Congratulations!"
          image="/welcome.png"
          onClose={handleCloseWelcome}
        />
      )}

      {showLeagueOverlay && <LeagueOverlay onClose={toggleLeagueOverlay} coins={user.coins} />}
    </div>
  )
}
