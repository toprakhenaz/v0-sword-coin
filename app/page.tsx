"use client"

import { useState, useEffect } from "react"
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
import { supabase } from "@/lib/supabase"
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
    updateCoins,
    updateEnergy,
    refreshUserData,
    setLeague,
  } = useUser()

  // Game state
  const [coinsToLevelUp, setCoinsToLevelUp] = useState(10000)
  const [lastHourlyCollectTime, setLastHourlyCollectTime] = useState<number | null>(null)
  const [showHourlyPopup, setShowHourlyPopup] = useState(false)
  const [hourlyCoinsToCollect, setHourlyCoinsToCollect] = useState(0)
  const [tapMultiplier, setTapMultiplier] = useState(1) // For combo multiplier effects

  // Boost state
  const [dailyRockets, setDailyRockets] = useState(3)
  const [maxDailyRockets, setMaxDailyRockets] = useState(3)
  const [energyFull, setEnergyFull] = useState(false)
  const [boosts, setBoosts] = useState({
    multiTouch: { level: 1, cost: 2000 },
    energyLimit: { level: 1, cost: 2000 },
    chargeSpeed: { level: 1, cost: 2000 },
  })

  // Visual state
  const [showTapEffect, setShowTapEffect] = useState(false)
  const [comboCounter, setComboCounter] = useState(0)

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

  // Load boost data on init
  useEffect(() => {
    const loadBoosts = async () => {
      if (!userId) return

      try {
        const { data: userBoosts } = await supabase.from("user_boosts").select("*").eq("user_id", userId).single()

        if (userBoosts) {
          setDailyRockets(userBoosts.daily_rockets)
          setMaxDailyRockets(userBoosts.max_daily_rockets)
          setEnergyFull(userBoosts.energy_full_used)
          setBoosts({
            multiTouch: {
              level: userBoosts.multi_touch_level,
              cost: 2000 * Math.pow(1.5, userBoosts.multi_touch_level - 1),
            },
            energyLimit: {
              level: userBoosts.energy_limit_level,
              cost: 2000 * Math.pow(1.5, userBoosts.energy_limit_level - 1),
            },
            chargeSpeed: {
              level: userBoosts.charge_speed_level,
              cost: 2000 * Math.pow(1.5, userBoosts.charge_speed_level - 1),
            },
          })
        }
      } catch (error) {
        console.error("Error loading boosts:", error)
      }
    }

    if (userId) {
      loadBoosts()
    }
  }, [userId])

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

  // Hourly earnings system
  useEffect(() => {
    // Check if we need to initialize the last collect time
    if (lastHourlyCollectTime === null && userId) {
      const fetchLastCollectTime = async () => {
        const { data: user } = await supabase.from("users").select("last_hourly_collect").eq("id", userId).single()
        if (user) {
          setLastHourlyCollectTime(new Date(user.last_hourly_collect).getTime())
        } else {
          setLastHourlyCollectTime(Date.now())
        }
      }

      fetchLastCollectTime()
    }

    // Calculate hourly earnings
    const calculateHourlyEarnings = () => {
      if (lastHourlyCollectTime) {
        const now = Date.now()
        const hoursPassed = (now - lastHourlyCollectTime) / (1000 * 60 * 60)

        if (hoursPassed >= 1) {
          // Calculate coins earned (proportional to time passed, up to 24 hours)
          const hoursToCount = Math.min(hoursPassed, 24)
          const coinsEarned = Math.floor(hourlyEarn * hoursToCount)

          setHourlyCoinsToCollect(coinsEarned)
          setShowHourlyPopup(true)
        }
      }
    }

    // Check for hourly earnings on load
    calculateHourlyEarnings()

    // Set up interval to check for hourly earnings
    const hourlyCheckInterval = setInterval(calculateHourlyEarnings, 60000) // Check every minute

    return () => clearInterval(hourlyCheckInterval)
  }, [lastHourlyCollectTime, hourlyEarn, userId])

  // Combo system
  useEffect(() => {
    if (comboCounter > 0) {
      const comboTimeout = setTimeout(() => {
        setComboCounter(0)
        setTapMultiplier(1)
      }, 2000) // Reset combo after 2 seconds of inactivity

      return () => clearTimeout(comboTimeout)
    }
  }, [comboCounter])

  // Component mount olduğunda ligi 3'e ayarla
  useEffect(() => {
    // Component mount olduğunda ligi 3'e ayarla
    if (league !== 3) {
      setLeague(3)
    }
  }, []) // Boş dependency array ile sadece bir kez çalışacak

  // Game actions
  const handleTap = async () => {
    if (energy <= 0) return // Don't proceed if no energy

    // Immediately update UI state first for responsive feedback
    const newCombo = comboCounter + 1
    setComboCounter(newCombo)

    // Calculate tap multiplier
    let multiplier = 1
    if (newCombo > 50) multiplier = 3
    else if (newCombo > 25) multiplier = 2
    else if (newCombo > 10) multiplier = 1.5

    setTapMultiplier(multiplier)

    // Calculate coins to earn
    const coinsToEarn = Math.round(earnPerTap * multiplier)

    // Show tap effect
    setShowTapEffect(true)
    setTimeout(() => setShowTapEffect(false), 200)

    // Update coins and energy in parallel
    await Promise.all([updateCoins(coinsToEarn, "tap", `Earned from tapping (${multiplier}x combo)`), updateEnergy(-1)])
  }

  const handleCollectHourlyEarnings = async () => {
    if (userId) {
      // Update coins
      await updateCoins(hourlyCoinsToCollect, "hourly", "Hourly earnings")

      // Update last collect time
      const now = Date.now()
      setLastHourlyCollectTime(now)

      await supabase
        .from("users")
        .update({
          last_hourly_collect: new Date(now).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      setShowHourlyPopup(false)
      setHourlyCoinsToCollect(0)
    }
  }

  const handleBoostUpgrade = async (boostType: string) => {
    if (!userId) return

    let cost = 0
    let newLevel = 0

    if (boostType === "multiTouch" && coins >= boosts.multiTouch.cost) {
      cost = boosts.multiTouch.cost
      newLevel = boosts.multiTouch.level + 1

      // Update local state
      await updateCoins(-cost, "boost_upgrade", `Upgraded ${boostType} to level ${newLevel}`)
      setBoosts({
        ...boosts,
        multiTouch: {
          level: newLevel,
          cost: Math.floor(boosts.multiTouch.cost * 1.5),
        },
      })

      // Update in database
      await supabase
        .from("user_boosts")
        .update({
          multi_touch_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await supabase
        .from("users")
        .update({
          earn_per_tap: earnPerTap + 2,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Show success popup
      setShowSuccessPopup({
        show: true,
        title: "Multi-Touch Upgraded!",
        message: `Your Multi-Touch is now level ${newLevel}, giving you +${newLevel * 2} coins per tap.`,
        image: "/boost-power.png",
      })
    } else if (boostType === "energyLimit" && coins >= boosts.energyLimit.cost) {
      cost = boosts.energyLimit.cost
      newLevel = boosts.energyLimit.level + 1
      const newMaxEnergy = 100 + (newLevel - 1) * 500

      // Update local state
      await updateCoins(-cost, "boost_upgrade", `Upgraded ${boostType} to level ${newLevel}`)
      setBoosts({
        ...boosts,
        energyLimit: {
          level: newLevel,
          cost: Math.floor(boosts.energyLimit.cost * 1.5),
        },
      })

      // Update in database
      await supabase
        .from("user_boosts")
        .update({
          energy_limit_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      await supabase
        .from("users")
        .update({
          max_energy: newMaxEnergy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      // Show success popup
      setShowSuccessPopup({
        show: true,
        title: "Energy Limit Upgraded!",
        message: `Your Energy Limit is now level ${newLevel}, increasing your max energy to ${newMaxEnergy}.`,
        image: "/energy-power.png",
      })
    } else if (boostType === "chargeSpeed" && coins >= boosts.chargeSpeed.cost) {
      cost = boosts.chargeSpeed.cost
      newLevel = boosts.chargeSpeed.level + 1

      // Update local state
      await updateCoins(-cost, "boost_upgrade", `Upgraded ${boostType} to level ${newLevel}`)
      setBoosts({
        ...boosts,
        chargeSpeed: {
          level: newLevel,
          cost: Math.floor(boosts.chargeSpeed.cost * 1.5),
        },
      })

      // Update in database
      await supabase
        .from("user_boosts")
        .update({
          charge_speed_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      // Show success popup
      setShowSuccessPopup({
        show: true,
        title: "Charge Speed Upgraded!",
        message: `Your Charge Speed is now level ${newLevel}, increasing energy regeneration by ${newLevel * 20}%.`,
        image: "/speed-power.png",
      })
    }

    // Refresh user data to get the updated values
    await refreshUserData()
  }

  const handleUseRocket = async () => {
    if (dailyRockets > 0 && userId) {
      // Update local state
      setDailyRockets(dailyRockets - 1)
      await updateEnergy(500)

      // Update in database
      await supabase
        .from("user_boosts")
        .update({
          daily_rockets: dailyRockets - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      setShowBoostOverlay(false)

      // Show success popup
      setShowSuccessPopup({
        show: true,
        title: "Rocket Boost Used!",
        message: "You gained +500 energy instantly.",
        image: "/rocket-boost.png",
      })
    }
  }

  const handleUseFullEnergy = async () => {
    if (!energyFull && userId) {
      // Update local state
      setEnergyFull(true)
      await updateEnergy(maxEnergy - energy) // Fill to max

      // Update in database
      await supabase
        .from("user_boosts")
        .update({
          energy_full_used: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      setShowBoostOverlay(false)

      // Show success popup
      setShowSuccessPopup({
        show: true,
        title: "Energy Fully Restored!",
        message: "Your energy has been completely refilled.",
        image: "/energy-full.png",
      })
    }
  }

  const handleCloseSuccessPopup = () => {
    setShowSuccessPopup({ ...showSuccessPopup, show: false })
  }

  // Test için seviye değiştirme fonksiyonu (geliştirme amaçlı)
  const handleTestLevelChange = () => {
    const nextLeague = league < 7 ? league + 1 : 1
    setLeague(nextLeague)
  }

  if (isLoading) {
    return <MainPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Seviye atlama animasyonu */}
      {isLevelingUp && previousLeague && (
        <LevelUpAnimation previousLeague={previousLeague} newLeague={league} onComplete={() => {}} />
      )}

      {/* Main content */}
      <div className="flex flex-col min-h-screen px-4 pb-20 max-w-md mx-auto">
        {/* Header section */}
        <div className="mt-4">
          <Header earnPerTap={earnPerTap} coinsToLevelUp={coinsToLevelUp} hourlyEarn={hourlyEarn} />
        </div>

        {/* Coin display section */}
        <div className="mt-4">
          <CoinDisplay coins={coins} league={league} onclick={() => setShowLeagueOverlay(true)} />
        </div>

        {/* Combo counter */}
        {comboCounter > 0 && (
          <div className="my-2 text-center">
            <span className="text-sm font-bold text-yellow-400">
              {comboCounter}x Combo
              {tapMultiplier > 1 && <span className="ml-2 text-green-400">({tapMultiplier}x Multiplier)</span>}
            </span>
          </div>
        )}

        {/* Central button section - main focus */}
        <div className="flex-grow flex items-center justify-center py-8 relative">
          {showTapEffect && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 bg-yellow-500 rounded-full animate-pulse opacity-10"></div>
            </div>
          )}
          <CentralButton onClick={handleTap} league={league} />
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

        {/* Test butonu - geliştirme amaçlı */}
        <button
          onClick={handleTestLevelChange}
          className="fixed bottom-24 right-4 bg-gray-800 text-white px-3 py-1 rounded-full text-xs opacity-50 hover:opacity-100"
        >
          Test: Seviye Değiştir
        </button>
      </div>

      {/* Overlays */}
      {showLeagueOverlay && <LeagueOverlay onClose={() => setShowLeagueOverlay(false)} coins={coins} />}

      {showBoostOverlay && (
        <BoostOverlay
          onClose={() => setShowBoostOverlay(false)}
          coins={coins}
          dailyRockets={dailyRockets}
          maxDailyRockets={maxDailyRockets}
          energyFull={energyFull}
          boosts={boosts}
          onBoostUpgrade={handleBoostUpgrade}
          onUseRocket={handleUseRocket}
          onUseFullEnergy={handleUseFullEnergy}
        />
      )}

      {/* Hourly earnings popup */}
      {showHourlyPopup && (
        <Popup
          title="Hourly Earnings"
          message={`You earned ${hourlyCoinsToCollect.toLocaleString()} coins while away!`}
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
          onClose={handleCloseSuccessPopup}
        />
      )}

      {/* Fixed navigation */}
      <Navbar />
    </main>
  )
}
