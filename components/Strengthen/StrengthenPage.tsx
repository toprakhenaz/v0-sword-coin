"use client"

import { useState } from "react"
import Navbar from "../Navbar"
import HeaderCard from "../HeaderCard"
import DiamondIcon from "../DiamondIcon"
import type { User } from "@prisma/client"
import axios from "axios"
import toast from "react-hot-toast"

interface UserType {
  user: User
}

export default function StrengthenPage({ user }: UserType) {
  const [currentUser, setCurrentUser] = useState<User>(user)
  const [isUpgrading, setIsUpgrading] = useState(false)

  const strengthOptions = [
    {
      id: 1,
      name: "Tap Power",
      description: "Increase coins per tap",
      cost: 50,
      currentLevel: user.coinsPerTap,
      multiplier: 1.5,
    },
    {
      id: 2,
      name: "Energy Capacity",
      description: "Increase max energy",
      cost: 100,
      currentLevel: Math.floor(user.energyMax / 100),
      multiplier: 100,
    },
    {
      id: 3,
      name: "Energy Regen",
      description: "Faster energy regeneration",
      cost: 75,
      currentLevel: 1,
      multiplier: 0.1,
    },
    {
      id: 4,
      name: "Critical Chance",
      description: "Chance for double coins",
      cost: 150,
      currentLevel: 0,
      multiplier: 5,
    },
  ]

  const handleUpgrade = async (optionId: number) => {
    const option = strengthOptions.find((opt) => opt.id === optionId)
    if (!option) return

    const crystalCost = Math.floor(option.cost * Math.pow(1.5, option.currentLevel))

    if (currentUser.crystals < crystalCost) {
      toast.error("Not enough crystals!")
      return
    }

    setIsUpgrading(true)

    try {
      // Prepare the updated user data
      const updatedUser = { ...currentUser }
      updatedUser.crystals -= crystalCost

      // Apply the specific upgrade
      switch (optionId) {
        case 1: // Tap Power
          updatedUser.coinsPerTap = Math.floor(updatedUser.coinsPerTap + option.multiplier)
          break
        case 2: // Energy Capacity
          updatedUser.energyMax = updatedUser.energyMax + option.multiplier
          break
        case 3: // Energy Regen
          // This would need to be implemented in the energy regeneration logic
          break
        case 4: // Critical Chance
          // This would need to be implemented in the tap logic
          break
      }

      // Save the updated user data
      const response = await axios.post("/api/saveUser", updatedUser)

      if (response.data) {
        setCurrentUser(updatedUser)
        toast.success(`${option.name} upgraded successfully!`)
      }
    } catch (error) {
      console.error("Error upgrading:", error)
      toast.error("Failed to upgrade. Please try again.")
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-4">
      <HeaderCard coins={currentUser.coins} crystals={currentUser.crystals} />

      <div className="my-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Strengthen Your Power</h1>
        <p className="text-sm text-gray-300">Use crystals to enhance your abilities</p>
      </div>

      <div className="space-y-4 mb-20">
        {strengthOptions.map((option) => {
          const crystalCost = Math.floor(option.cost * Math.pow(1.5, option.currentLevel))
          const canAfford = currentUser.crystals >= crystalCost

          return (
            <div
              key={option.id}
              className={`bg-gradient-to-r ${canAfford ? "from-purple-900 to-indigo-900" : "from-gray-800 to-gray-700"} rounded-lg p-4 shadow-lg`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{option.name}</h3>
                  <p className="text-sm text-gray-300">{option.description}</p>
                  <div className="mt-1 text-sm">
                    <span className="text-yellow-400">Current Level: {option.currentLevel}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    <DiamondIcon size={20} />
                    <span className={`ml-1 font-bold ${canAfford ? "text-white" : "text-red-400"}`}>{crystalCost}</span>
                  </div>

                  <button
                    onClick={() => handleUpgrade(option.id)}
                    disabled={!canAfford || isUpgrading}
                    className={`px-4 py-2 rounded-lg ${
                      canAfford && !isUpgrading
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        : "bg-gray-600 cursor-not-allowed opacity-50"
                    } transition-all duration-300`}
                  >
                    {isUpgrading ? "Upgrading..." : "Upgrade"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Navbar />
    </div>
  )
}
