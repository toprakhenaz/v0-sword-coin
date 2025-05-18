"use client"

import { useState } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import { useUser } from "@/app/context/UserContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCoins, faGem, faArrowUp, faBolt, faShield } from "@fortawesome/free-solid-svg-icons"
import { toast } from "@/components/ui/use-toast"

export default function UpgradePage() {
  const { user, loading, updateUser } = useUser()
  const [upgrading, setUpgrading] = useState<string | null>(null)

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col text-white space-y-6 p-6 overflow-x-hidden animate-pulse">
        <div className="h-12 bg-gray-700 rounded-lg"></div>
        <div className="space-y-4 flex-grow">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-32 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        <div className="h-16 bg-gray-700 rounded-lg fixed bottom-0 left-0 right-0"></div>
      </div>
    )
  }

  const upgrades = [
    {
      id: "tap_power",
      name: "Tap Power",
      description: "Increase coins earned per tap",
      icon: faCoins,
      color: "from-yellow-600 to-amber-700",
      iconColor: "text-yellow-300",
      currentValue: user.earnPerTap,
      nextValue: user.earnPerTap + 1,
      cost: Math.floor(user.earnPerTap * 1000),
      costType: "coins",
    },
    {
      id: "max_energy",
      name: "Max Energy",
      description: "Increase your maximum energy",
      icon: faBolt,
      color: "from-blue-600 to-blue-800",
      iconColor: "text-blue-300",
      currentValue: user.maxEnergy,
      nextValue: user.maxEnergy + 10,
      cost: Math.floor(user.maxEnergy * 5),
      costType: "crystals",
    },
    {
      id: "energy_regen",
      name: "Energy Regeneration",
      description: "Faster energy regeneration",
      icon: faShield,
      color: "from-green-600 to-green-800",
      iconColor: "text-green-300",
      currentValue: "1 / min",
      nextValue: "1.2 / min",
      cost: 50,
      costType: "crystals",
    },
    {
      id: "offline_earnings",
      name: "Offline Earnings",
      description: "Increase coins earned while offline",
      icon: faArrowUp,
      color: "from-purple-600 to-purple-800",
      iconColor: "text-purple-300",
      currentValue: "10% / hour",
      nextValue: "15% / hour",
      cost: 5000,
      costType: "coins",
    },
  ]

  const handleUpgrade = async (upgradeId: string) => {
    const upgrade = upgrades.find((u) => u.id === upgradeId)
    if (!upgrade) return

    const canAfford = upgrade.costType === "coins" ? user.coins >= upgrade.cost : user.crystals >= upgrade.cost

    if (!canAfford) {
      toast({
        title: "Not Enough Resources",
        description: `You don't have enough ${upgrade.costType} for this upgrade.`,
        variant: "destructive",
      })
      return
    }

    setUpgrading(upgradeId)

    try {
      // Update user data based on the upgrade
      const updateData: any = {}

      if (upgrade.costType === "coins") {
        updateData.coins = user.coins - upgrade.cost
      } else {
        updateData.crystals = user.crystals - upgrade.cost
      }

      switch (upgradeId) {
        case "tap_power":
          updateData.earnPerTap = user.earnPerTap + 1
          break
        case "max_energy":
          updateData.maxEnergy = user.maxEnergy + 10
          updateData.energy = user.maxEnergy + 10 // Also refill energy
          break
        // Other upgrades would be implemented here
      }

      await updateUser(updateData)

      toast({
        title: "Upgrade Successful",
        description: `Your ${upgrade.name} has been upgraded!`,
      })
    } catch (error) {
      console.error("Error upgrading:", error)
      toast({
        title: "Upgrade Failed",
        description: "There was an error processing your upgrade.",
        variant: "destructive",
      })
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <HeaderCard />

      <h1 className="text-2xl font-bold mb-6 text-center">Upgrades</h1>

      <div className="space-y-4 pb-20">
        {upgrades.map((upgrade) => (
          <div key={upgrade.id} className={`bg-gradient-to-r ${upgrade.color} rounded-lg p-4 shadow-lg`}>
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-black bg-opacity-30 flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={upgrade.icon} className={`${upgrade.iconColor}`} />
              </div>
              <div>
                <h3 className="font-bold">{upgrade.name}</h3>
                <p className="text-sm opacity-80">{upgrade.description}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm">
                <span className="opacity-70">Current: </span>
                <span className="font-semibold">{upgrade.currentValue}</span>
                <span className="mx-2">→</span>
                <span className="opacity-70">Next: </span>
                <span className="font-semibold">{upgrade.nextValue}</span>
              </div>

              <button
                className={`px-4 py-2 rounded-lg flex items-center ${
                  upgrading === upgrade.id
                    ? "bg-gray-600 cursor-wait"
                    : upgrade.costType === "coins"
                      ? user.coins >= upgrade.cost
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-gray-600 cursor-not-allowed"
                      : user.crystals >= upgrade.cost
                        ? "bg-purple-500 hover:bg-purple-600"
                        : "bg-gray-600 cursor-not-allowed"
                }`}
                onClick={() => handleUpgrade(upgrade.id)}
                disabled={upgrading !== null}
              >
                <FontAwesomeIcon icon={upgrade.costType === "coins" ? faCoins : faGem} className="mr-2" />
                <span>{upgrade.cost}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Navbar />
    </main>
  )
}
