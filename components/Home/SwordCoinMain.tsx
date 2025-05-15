"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Header from "@/components/Home/Header"
import CoinDisplay from "@/components/Home/CoinDisplay"
import CentralButton from "@/components/Home/CentralButton"
import EnergyBar from "@/components/Home/EnergyBar"
import Navbar from "@/components/Navbar"
import { ligCoin, ligImage, ligEearningCoin, saveUserData, calculateEarningsInterval } from "@/data/GeneralData"
import Popup from "@/components/Popup"
import LeagueOverlay from "./LeagueOverlay"
import type { User } from "@prisma/client"

export interface UserData {
  user: User
}

export default function MainPage({ user: initialUser }: UserData) {
  const [myUser, setUser] = useState(initialUser)
  const [showPopup, setShowPopup] = useState(false)
  const [welcome, showWelcome] = useState(false)
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false)
  const [boostMessage, setBoostMessage] = useState("")
  const [earnTapPositions, setEarnTapPositions] = useState<
    Array<{ id: string; top: number; left: number; amount: number }>
  >([])
  const userRef = useRef(myUser)
  const centralButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (myUser.coins === 2500 && myUser.league === 1) {
      showWelcome(true)
    }
  }, [])

  useEffect(() => {
    userRef.current = myUser
  }, [myUser])

  // Auto-save user data periodically
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveUserData(userRef.current)
    }, 10000) // Save every 10 seconds

    return () => clearInterval(saveInterval)
  }, [])

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
      Math.max(1000 / Math.max(1, myUser.league), 200),
    ) // Ensure minimum interval

    return () => clearInterval(interval)
  }, [myUser.league])

  // Hourly coin earnings
  useEffect(() => {
    const { intervalDuration, earningsPerInterval } = calculateEarningsInterval(myUser.coinsHourly)

    const coinInterval = setInterval(() => {
      setUser((prevUser) => ({
        ...prevUser,
        coins: prevUser.coins + earningsPerInterval,
      }))
    }, intervalDuration)

    return () => clearInterval(coinInterval)
  }, [myUser.coinsHourly])

  // Boost function
  const handleBoost = () => {
    const now = new Date()
    const lastBoostTime = new Date(myUser.lastBoostTime)
    const hoursSinceLastBoost = (now.getTime() - lastBoostTime.getTime()) / (1000 * 60 * 60)

    if (myUser.dailyBoostCount > 0 && hoursSinceLastBoost >= 3) {
      setUser((prevUser) => ({
        ...prevUser,
        energy: prevUser.energyMax,
        lastBoostTime: now,
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
                amount: Math.floor(myUser.energyMax / 5),
              },
            ])
          }, i * 100)
        }
      }
    } else {
      setBoostMessage(
        myUser.dailyBoostCount === 0
          ? "Günlük boost hakkınızı doldurdunuz!"
          : "Boost özelliğini tekrar kullanmak için 3 saat beklemelisiniz!",
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
    if (myUser.energy >= myUser.coinsPerTap) {
      setUser((prevUser) => {
        let newCoin = prevUser.coins + myUser.coinsPerTap
        let newLig = prevUser.league
        let earnedCoin = 0
        let newCoinsPerTap = prevUser.coinsPerTap
        let newMaxEnergy = prevUser.energyMax

        if (ligCoin[prevUser.league + 1] && newCoin >= ligCoin[prevUser.league + 1]) {
          newLig = prevUser.league + 1
          earnedCoin = ligEearningCoin[newLig]
          newCoin = newCoin + earnedCoin
          newCoinsPerTap = newCoinsPerTap + 1
          newMaxEnergy = prevUser.energyMax + prevUser.league * 500
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
            amount: myUser.coinsPerTap,
          },
        ])

        const updatedUser = {
          ...prevUser,
          energy: Math.max(prevUser.energy - myUser.coinsPerTap, 0),
          energyMax: newMaxEnergy,
          coins: newCoin,
          league: newLig,
          coinsPerTap: newCoinsPerTap,
        }

        if (newLig > prevUser.league) {
          saveUserData(updatedUser)
        }

        return updatedUser
      })
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
    showWelcome(false)
  }

  const handleCloseWelcome = () => {
    showWelcome(false)
  }

  return (
    <div className="min-h-screen flex flex-col text-white space-y-6 p-4 md:p-6 overflow-x-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <Header
        hourlyEarn={myUser.coinsHourly}
        coinsToLevelUp={ligCoin[myUser.league + 1] ? ligCoin[myUser.league + 1] : 0}
        earnPerTap={myUser.coinsPerTap}
      />
      <CoinDisplay coins={myUser.coins} league={myUser.league} onclick={toggleLeagueOverlay} />
      <div ref={centralButtonRef} className="relative py-8 flex justify-center">
        <CentralButton onClick={handleButtonClick} league={myUser.league} />
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
      <EnergyBar energy={myUser.energy} maxEnergy={myUser.energyMax} boost={handleBoost} />
      <Navbar />

      {showPopup && (
        <Popup
          title="Tebrikler! Lig Atladınız!"
          message={`Yeni lig: ${myUser.league}. Bu ligde ${ligEearningCoin[myUser.league]} coin kazandınız.`}
          image={ligImage[myUser.league]}
          onClose={handleClosePopup}
        />
      )}

      {boostMessage && <Popup title="Uyarı" message={boostMessage} image="/rocket.png" onClose={handleClosePopup} />}

      {welcome && (
        <Popup
          title="Hoşgeldin!!"
          message="Sword Coin ailesine hoşgeldin, Arkadaşın sana 2500 coin kazandırdı Tebrikler!!"
          image="/welcome.png"
          onClose={handleCloseWelcome}
        />
      )}

      {showLeagueOverlay && <LeagueOverlay onClose={toggleLeagueOverlay} coins={myUser.coins} />}
    </div>
  )
}
