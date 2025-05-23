"use client"

import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/Navbar"
import Header from "@/components/Header"
import CentralButton from "@/components/CentralButton"
import CoinDisplay from "@/components/CoinDisplay"
import EnergyBar from "@/components/EnergyBar"
import LeagueOverlay from "@/components/LeagueOverlay"
import BoostOverlay from "@/components/BoostOverlay"
import LevelUpAnimation from "@/components/LevelUpAnimation"
import MainPageSkeletonLoading from "@/components/SkeletonMain"
import Popup from "@/components/Popup"
import { useUser } from "@/context/UserContext"

export default function Home() {
  const {
    userId,
    coins,
    energy,
    maxEnergy,
    earnPerTap,
    hourlyEarn,
    league,
    isLoading,
    isLevelingUp,
    previousLeague,
    boosts,
    handleTap,
    upgradeBoost,
    useRocketBoost,
    useFullEnergyBoost,
    collectHourlyEarnings,
    refreshUserData,
  } = useUser()

  // Game state
  const [coinsToLevelUp, setCoinsToLevelUp] = useState(10000)
  const [showHourlyPopup, setShowHourlyPopup] = useState(false)
  const [hourlyCoinsToCollect, setHourlyCoinsToCollect] = useState(0)
  const [canCollectHourly, setCanCollectHourly] = useState(false)
  const [timeUntilNextCollect, setTimeUntilNextCollect] = useState("")

  // Visual state
  const [showTapEffect, setShowTapEffect] = useState(false)
  const [comboCounter, setComboCounter] = useState(0)
  const [tapMultiplier, setTapMultiplier] = useState(1)

  // UI state
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false)
  const [showBoostOverlay, setShowBoostOverlay] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState<{
    show: boolean
    title: string
    message: string
    image: string
  }>({
    show: false,
    title: "",
    message: "",
    image: "",
  })

  // Initialize Telegram WebApp
  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [])

  // Calculate coins needed for next league
  useEffect(() => {
    const leagueThresholds = [
      0, // League 1 (Wooden)
      10000, // League 2 (Bronze)
      100000, // League 3 (Iron)
      1000000, // League 4 (Steel)
      10000000, // League 5 (Adamantite)
      100000000, // League 6 (Legendary)
      1000000000, // League 7 (Dragon)
    ]

    if (league < leagueThresholds.length) {
      setCoinsToLevelUp(leagueThresholds[league] - coins)
    }
  }, [league, coins])

  // Check for hourly earnings availability
  useEffect(() => {
    const checkHourlyEarnings = async () => {
      if (!userId) return

      try {
        const result = await collectHourlyEarnings()
        
        if (result.success && result.coins) {
          setHourlyCoinsToCollect(result.coins)
          setCanCollectHourly(true)
          setShowHourlyPopup(true)
        } else if (result.timeLeft) {
          setCanCollectHourly(false)
          // Update time until next collect
          const updateTimer = () => {
            const minutes = result.timeLeft
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            setTimeUntilNextCollect(`${hours}h ${mins}m`)
          }
          updateTimer()
        }
      } catch (error) {
        console.error("Error checking hourly earnings:", error)
      }
    }

    // Check on mount
    if (userId) {
      checkHourlyEarnings()
    }

    // Check every minute
    const interval = setInterval(() => {
      if (userId) {
        checkHourlyEarnings()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [userId, collectHourlyEarnings])

  // Combo system
  useEffect(() => {
    if (comboCounter > 0) {
      const comboTimeout = setTimeout(() => {
        setComboCounter(0)
        setTapMultiplier(1)
      }, 2000)

      return () => clearTimeout(comboTimeout)
    }
  }, [comboCounter])

  const handleCentralButtonClick = async () => {
    if (energy <= 0) {
      setShowSuccessPopup({
        show: true,
        title: "No Energy!",
        message: "Wait for energy to regenerate or use a boost.",
        image: "/energy-empty.png",
      })
      return
    }

    // Update combo
    const newCombo = comboCounter + 1
    setComboCounter(newCombo)

    // Calculate multiplier
    let multiplier = 1
    if (newCombo > 50) multiplier = 3
    else if (newCombo > 25) multiplier = 2
    else if (newCombo > 10) multiplier = 1.5

    setTapMultiplier(multiplier)

    // Show tap effect
    setShowTapEffect(true)
    setTimeout(() => setShowTapEffect(false), 200)

    // Handle tap
    await handleTap()
  }

  const handleCollectHourlyEarnings = async () => {
    if (!canCollectHourly || !userId) return

    try {
      const result = await collectHourlyEarnings()
      
      if (result.success && result.coins) {
        setShowHourlyPopup(false)
        setCanCollectHourly(false)
        
        // Refresh user data to update coins
        await refreshUserData()
        
        setShowSuccessPopup({
          show: true,
          title: "Hourly Earnings Collected!",
          message: `You earned ${result.coins.toLocaleString()} coins from your cards!`,
          image: "/coin.png",
        })
      }
    } catch (error) {
      console.error("Error collecting hourly earnings:", error)
    }
  }

  const handleBoostUpgrade = async (boostType: string) => {
    const result = await upgradeBoost(boostType)
    
    if (result.success) {
      let message = ""
      switch (boostType) {
        case "multiTouch":
          message = `Multi-Touch upgraded! Now earning ${earnPerTap} coins per tap.`
          break
        case "energyLimit":
          message = `Energy Limit upgraded! Max energy is now ${maxEnergy}.`
          break
        case "chargeSpeed":
          message = `Charge Speed upgraded! Energy regenerates ${boosts.chargeSpeed.level * 20}% faster.`
          break
      }

      setShowSuccessPopup({
        show: true,
        title: "Boost Upgraded!",
        message,
        image: "/boost-success.png",
      })
    } else {
      setShowSuccessPopup({
        show: true,
        title: "Upgrade Failed",
        message: result.message || "Not enough coins!",
        image: "/error.png",
      })
    }
  }

  const handleUseRocket = async () => {
    const { handleRocketBoost } = useRocketBoost()
    await handleRocketBoost()
    
    setShowBoostOverlay(false)
    setShowSuccessPopup({
      show: true,
      title: "Rocket Boost Used!",
      message: "You gained +500 energy instantly!",
      image: "/rocket-boost.png",
    })
  }

  const handleUseFullEnergy = async () => {
    const result = await useFullEnergyBoost()
    
    if (result.success) {
      setShowBoostOverlay(false)
      setShowSuccessPopup({
        show: true,
        title: "Energy Fully Restored!",
        message: "Your energy has been completely refilled!",
        image: "/energy-full.png",
      })
    } else {
      setShowSuccessPopup({
        show: true,
        title: "Already Used",
        message: result.message || "You've already used full energy today!",
        image: "/error.png",
      })
    }
  }

  if (isLoading) {
    return <MainPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Level up animation */}
      {isLevelingUp && previousLeague && (
        <LevelUpAnimation
          previousLeague={previousLeague}
          newLeague={league}
          onComplete={() => {}}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col min-h-screen px-4 pb-20 max-w-md mx-auto">
        {/* Header section */}
        <div className="mt-4">
          <Header 
            earnPerTap={earnPerTap} 
            coinsToLevelUp={coinsToLevelUp} 
            hourlyEarn={hourlyEarn}
          />
        </div>

        {/* Coin display section */}
        <div className="mt-4">
          <CoinDisplay 
            coins={coins} 
            league={league} 
            onclick={() => setShowLeagueOverlay(true)} 
          />
        </div>

        {/* Hourly earnings indicator */}
        {canCollectHourly && (
          <div className="my-2 text-center">
            <button
              onClick={handleCollectHourlyEarnings}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 rounded-full animate-pulse"
            >
              Collect {hourlyCoinsToCollect.toLocaleString()} coins from cards!
            </button>
          </div>
        )}

        {/* Time until next collect */}
        {!canCollectHourly && timeUntilNextCollect && (
          <div className="my-2 text-center text-gray-400 text-sm">
            Next hourly collect in: {timeUntilNextCollect}
          </div>
        )}

        {/* Combo counter */}
        {comboCounter > 0 && energy > 0 && (
          <div className="my-2 text-center">
            <span className="text-sm font-bold text-yellow-400">
              {comboCounter}x Combo
              {tapMultiplier > 1 && (
                <span className="ml-2 text-yellow-400">
                  ({tapMultiplier}x Multiplier)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Central button section */}
        <div className="flex-grow flex items-center justify-center py-8 relative">
          {showTapEffect && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 bg-yellow-500 rounded-full animate-pulse opacity-10"></div>
            </div>
          )}
          <CentralButton onClick={handleCentralButtonClick} league={league} />
        </div>

        {/* Energy bar section */}
        <div className="mb-20">
          <EnergyBar
            energy={energy}
            maxEnergy={maxEnergy}
            boost={handleUseRocket}
            onOpenBoostOverlay={() => setShowBoostOverlay(true)}
            league={league}
          />
        </div>
      </div>

      {/* Overlays */}
      {showLeagueOverlay && (
        <LeagueOverlay 
          onClose={() => setShowLeagueOverlay(false)} 
          coins={coins} 
        />
      )}

      {showBoostOverlay && (
        <BoostOverlay
          onClose={() => setShowBoostOverlay(false)}
          coins={coins}
          dailyRockets={boosts.dailyRockets}
          maxDailyRockets={boosts.maxDailyRockets}
          energyFull={boosts.energyFullUsed}
          boosts={boosts}
          onBoostUpgrade={handleBoostUpgrade}
          onUseRocket={handleUseRocket}
          onUseFullEnergy={handleUseFullEnergy}
        />
      )}

      {/* Hourly earnings popup */}
      {showHourlyPopup && (
        <Popup
          title="Hourly Earnings Ready!"
          message={`You earned ${hourlyCoinsToCollect.toLocaleString()} coins from your cards!`}
          image="/coin.png"
          onClose={handleCollectHourlyEarnings}
        />
      )}

      {/* Success popups */}
      {showSuccessPopup.show && (
        <Popup
          title={showSuccessPopup.title}
          message={showSuccessPopup.message}
          image={showSuccessPopup.image}
          onClose={() => setShowSuccessPopup({ ...showSuccessPopup, show: false })}
        />
      )}

      {/* Fixed navigation */}
      <Navbar />
    </main>
  )
}