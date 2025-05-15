"use client"

import { useState } from "react"
import Image from "next/image"
import { formatNumber } from "@/utils/gameUtils"
import { playSound } from "@/utils/soundEffects"
import { triggerConfetti } from "@/utils/confetti"

interface Card {
  id: number
  name: string
  image: string
  crystals: number
  upgradeCost: number
}

interface UserCard {
  id: number
  userId: number
  cardId: number
  level: number
}

interface CardDetailsProps {
  card: Card
  userCard: UserCard
  onClose: () => void
  onUpgrade: (cardId: number, newLevel: number) => Promise<void>
  userCoins: number
  userCrystals: number
}

export const CardDetails = ({ card, userCard, onClose, onUpgrade, userCoins, userCrystals }: CardDetailsProps) => {
  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    if (isUpgrading) return

    const upgradeCost = card.upgradeCost * (userCard.level + 1)

    if (userCoins < upgradeCost) {
      alert("Yeterli coin'iniz yok!")
      playSound("error")
      return
    }

    setIsUpgrading(true)

    try {
      await onUpgrade(card.id, userCard.level + 1)
      playSound("upgrade")
      triggerConfetti("levelUp")
    } catch (error) {
      console.error("Yükseltme hatası:", error)
      playSound("error")
    } finally {
      setIsUpgrading(false)
    }
  }

  const currentCrystals = card.crystals * (userCard.level || 1)
  const nextLevelCrystals = card.crystals * (userCard.level + 1)
  const upgradeCost = card.upgradeCost * (userCard.level + 1)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        {/* Başlık */}
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{card.name}</h2>
          <button onClick={onClose} className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Kart görseli */}
        <div className="p-4 flex justify-center">
          <Image
            src={card.image || "/placeholder.svg"}
            alt={card.name}
            width={150}
            height={150}
            className="h-40 object-contain"
          />
        </div>

        {/* Kart bilgileri */}
        <div className="p-4 bg-gray-50">
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Seviye</span>
              <span className="text-sm font-bold">{userCard.level}</span>
            </div>

            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Saatlik Kristal</span>
              <div className="flex items-center">
                <Image src="/crystal-hd.png" alt="Crystals" width={16} height={16} className="mr-1" />
                <span className="text-sm">{formatNumber(currentCrystals)}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium">Sonraki Seviye</span>
              <div className="flex items-center">
                <Image src="/crystal-hd.png" alt="Crystals" width={16} height={16} className="mr-1" />
                <span className="text-sm">{formatNumber(nextLevelCrystals)}</span>
              </div>
            </div>
          </div>

          {/* Yükseltme butonu */}
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading || userCoins < upgradeCost}
            className={`w-full py-3 rounded-lg flex items-center justify-center ${
              isUpgrading || userCoins < upgradeCost ? "bg-gray-300 text-gray-500" : "bg-blue-500 text-white"
            }`}
          >
            {isUpgrading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : (
              <Image src="/coins.png" alt="Coins" width={20} height={20} className="mr-2" />
            )}
            {isUpgrading ? "Yükseltiliyor..." : `Yükselt (${formatNumber(upgradeCost)})`}
          </button>
        </div>
      </div>
    </div>
  )
}
