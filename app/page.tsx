"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Header from "@/components/Header"
import CentralButton from "@/components/CentralButton"
import CoinDisplay from "@/components/CoinDisplay"
import EnergyBar from "@/components/EnergyBar"
import LeagueOverlay from "@/components/LeagueOverlay"
import BoostOverlay from "@/components/BoostOverlay"
import MainPageSkeletonLoading from "@/components/SkeletonMain"
import Popup from "@/components/Popup"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/context/UserContext"

export default function Home() {
  const { userId, coins, energy, maxEnergy, earnPerTap, hourlyEarn, league, isLoading, updateCoins, updateEnergy } =
    useUser()

  // Game state
  const [coinsToLevelUp, setCoinsToLevelUp] = useState(250000)
  const [lastHourlyCollectTime, setLastHourlyCollectTime] = useState<number | null>(null)
  const [showHourlyPopup, setShowHourlyPopup] = useState(false)
  const [hourlyCoinsToCollect, setHourlyCoinsToCollect] = useState(0)

  // Boost state
  const [dailyRockets, setDailyRockets] = useState(3)
  const [maxDailyRockets, setMaxDailyRockets] = useState(3)
  const [energyFull, setEnergyFull] = useState(false)
  const [boosts, setBoosts] = useState({
    multiTouch: { level: 1, cost: 2000 },
    energyLimit: { level: 1, cost: 2000 },
    chargeSpeed: { level: 1, cost: 2000 },
  })

  // UI state
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false)
  const [showBoostOverlay, setShowBoostOverlay] = useState(false)

  // Load boost data
  useEffect(() => {
    const loadBoosts = async () => {
      if (!userId) return

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
    }

    if (userId) {
      loadBoosts()
    }
  }, [userId])

  // Auto energy regeneration (subtle)
  useEffect(() => {
    const energyInterval = setInterval(() => {
      if (energy < maxEnergy) {
        updateEnergy(1)
      }
    }, 10000 / boosts.chargeSpeed.level) // Faster regeneration with higher charge speed level

    return () => clearInterval(energyInterval)
  }, [energy, maxEnergy, boosts.chargeSpeed.level, updateEnergy])

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

  // Game actions
  const handleTap = async () => {
    if (energy > 0) {
      // Update coins
      await updateCoins(earnPerTap, "tap", "Earned from tapping")

      // Update energy
      await updateEnergy(-1)
    }
  }

  const handleBoost = async () => {
    await updateEnergy(20)
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
    } else if (boostType === "energyLimit" && coins >= boosts.energyLimit.cost) {
      cost = boosts.energyLimit.cost
      newLevel = boosts.energyLimit.level + 1
      const newMaxEnergy = maxEnergy + 500

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
    }
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
    }
  }

  if (isLoading) {
    return <MainPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
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

        {/* Central button section - main focus */}
        <div className="flex-grow flex items-center justify-center py-8">
          <CentralButton onClick={handleTap} league={league} />
        </div>

        {/* Energy bar section - ensure it's below the central button */}
        <div className="mb-20 mt-4">
          <EnergyBar
            energy={energy}
            maxEnergy={maxEnergy}
            boost={handleBoost}
            onOpenBoostOverlay={() => setShowBoostOverlay(true)}
            league={league}
          />
        </div>
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
          title="Saatlik Kazanç"
          message={`${hourlyCoinsToCollect.toLocaleString()} coin kazandınız!`}
          image="/coin.png"
          onClose={handleCollectHourlyEarnings}
        />
      )}

      {/* Fixed navigation */}
      <Navbar />
    </main>
  )
}
