"use client"

import { useState } from "react"
import { useUser } from "@/context/UserContext"
import HeaderCard from "@/components/HeaderCard"
import EnergyBar from "@/components/EnergyBar"
import TapButton from "@/components/TapButton"

export default function MainPage() {
  const { coins, energy, maxEnergy, league, handleTap } = useUser()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleTapClick = async () => {
    if (energy > 0 && !isAnimating) {
      setIsAnimating(true)
      await handleTap()
      setTimeout(() => setIsAnimating(false), 100)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <HeaderCard coins={coins} league={league} />
      <EnergyBar energy={energy} maxEnergy={maxEnergy} />

      <div className="flex justify-center my-8">
        <TapButton onClick={handleTapClick} isAnimating={isAnimating} />
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-400">Tap to earn coins!</p>
      </div>
    </div>
  )
}
