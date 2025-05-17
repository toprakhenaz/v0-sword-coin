"use client"

import { useState, useEffect } from "react"
import { Sword, Shield, Zap, Heart } from "lucide-react"

interface PlayerStatsProps {
  playerLevel: number
  currentXp: number
  maxXp: number
  weaponLevel: number
  weaponName: string
  weaponRarity: string
  coins: number
  stats: {
    strength: number
    defense: number
    agility: number
    vitality: number
  }
}

export default function PlayerStats({
  playerLevel,
  currentXp,
  maxXp,
  weaponLevel,
  weaponName,
  weaponRarity,
  coins,
  stats,
}: PlayerStatsProps) {
  const [xpPercentage, setXpPercentage] = useState(0)

  useEffect(() => {
    setXpPercentage((currentXp / maxXp) * 100)
  }, [currentXp, maxXp])

  // Silah nadirliğine göre renk belirle
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400"
      case "uncommon":
        return "text-green-400"
      case "rare":
        return "text-blue-400"
      case "epic":
        return "text-purple-400"
      case "legendary":
        return "text-amber-400"
      default:
        return "text-gray-400"
    }
  }

  // Silah nadirliğine göre Türkçe isim
  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "Sıradan"
      case "uncommon":
        return "Yaygın Olmayan"
      case "rare":
        return "Nadir"
      case "epic":
        return "Destansı"
      case "legendary":
        return "Efsanevi"
      default:
        return "Sıradan"
    }
  }

  const rarityColor = getRarityColor(weaponRarity)
  const rarityBgColor =
    weaponRarity === "common"
      ? "bg-gray-700"
      : weaponRarity === "uncommon"
        ? "bg-green-700"
        : weaponRarity === "rare"
          ? "bg-blue-700"
          : weaponRarity === "epic"
            ? "bg-purple-700"
            : "bg-amber-600"

  return (
    <div className="bg-gradient-to-r from-[#1a2235] to-[#1e2738] rounded-xl p-4 mx-4 my-4 shadow-lg border border-gray-800/50">
      {/* Oyuncu seviyesi ve XP */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2">
            {playerLevel}
          </div>
          <span className="font-bold">Seviye {playerLevel}</span>
        </div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full ${rarityBgColor} flex items-center justify-center mr-2`}>
            <Sword className={`w-5 h-5 ${rarityColor}`} />
          </div>
          <span className={`font-bold ${rarityColor}`}>Sv.{weaponLevel}</span>
        </div>
      </div>

      {/* XP Çubuğu */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>
            TP: {currentXp}/{maxXp}
          </span>
          <span className={rarityColor}>{weaponName}</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
            style={{ width: `${xpPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Para */}
      <div className="flex items-center justify-between p-2 bg-[#1e2738]/70 rounded-lg mb-3">
        <span className="font-medium">Altın</span>
        <div className="flex items-center text-amber-400 font-bold">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
            <circle cx="12" cy="12" r="8" fill="currentColor" />
            <circle cx="12" cy="12" r="4" fill="#1a2235" />
          </svg>
          {coins.toLocaleString()}
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center p-2 bg-[#1e2738]/70 rounded-lg">
          <Sword className="w-4 h-4 text-red-400 mb-1" />
          <span className="text-xs">GÜÇ: {stats.strength}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-[#1e2738]/70 rounded-lg">
          <Shield className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-xs">SAV: {stats.defense}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-[#1e2738]/70 rounded-lg">
          <Zap className="w-4 h-4 text-yellow-400 mb-1" />
          <span className="text-xs">ÇEV: {stats.agility}</span>
        </div>
        <div className="flex flex-col items-center p-2 bg-[#1e2738]/70 rounded-lg">
          <Heart className="w-4 h-4 text-red-400 mb-1" />
          <span className="text-xs">CAN: {stats.vitality}</span>
        </div>
      </div>
    </div>
  )
}
