"use client"

import { useState, useEffect, useRef } from "react"
import { Sword, Zap, Shield, Star } from "lucide-react"

interface TapSystemProps {
  playerLevel: number
  weaponLevel: number
  weaponRarity: string
  activeSkills: string[]
  onXpGain: (amount: number) => void
  onCoinGain: (amount: number) => void
}

export default function TapSystem({
  playerLevel,
  weaponLevel,
  weaponRarity,
  activeSkills,
  onXpGain,
  onCoinGain,
}: TapSystemProps) {
  const [taps, setTaps] = useState(0)
  const [comboCount, setComboCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [showXpPopup, setShowXpPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [popupValue, setPopupValue] = useState(0)
  const [isCritical, setIsCritical] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const swordRef = useRef<HTMLDivElement>(null)
  const comboTimeout = 1200 // ms

  // Belirli süre içinde dokunma olmazsa komboyu sıfırla
  useEffect(() => {
    if (comboCount > 0) {
      const timer = setTimeout(() => {
        setComboCount(0)
      }, comboTimeout)
      return () => clearTimeout(timer)
    }
  }, [comboCount, lastTapTime])

  const handleTap = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // Dokunma sayısını güncelle
    setTaps((prev) => prev + 1)

    // Kombo kontrolü
    const now = Date.now()
    if (now - lastTapTime < comboTimeout) {
      setComboCount((prev) => Math.min(prev + 1, 10))
    } else {
      setComboCount(1)
    }
    setLastTapTime(now)

    // Kombo çarpanı ile TP kazancını hesapla
    const comboMultiplier = 1 + comboCount * 0.1
    const criticalChance = 0.05 + playerLevel * 0.002 + weaponLevel * 0.003
    const isCrit = Math.random() < criticalChance
    const critMultiplier = isCrit ? 2.5 : 1

    const baseXp = 5 + Math.floor(playerLevel / 2) + weaponLevel * 0.5
    const totalXp = Math.floor(baseXp * comboMultiplier * critMultiplier)

    // Altın ekle (TP'nin %10'u)
    const coins = Math.floor(totalXp * 0.1)

    // Popup göster
    if (swordRef.current) {
      const rect = swordRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Merkez etrafında rastgele konum
      const angle = Math.random() * Math.PI * 2
      const distance = 30 + Math.random() * 40
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      setPopupPosition({ x, y })
      setPopupValue(totalXp)
      setIsCritical(isCrit)
      setShowXpPopup(true)

      setTimeout(() => setShowXpPopup(false), 1000)
    }

    // Titreşim geri bildirimi (mümkünse)
    if (navigator.vibrate) {
      navigator.vibrate(isCrit ? [10, 20, 10] : 10)
    }

    // Oyun durumunu güncelle
    onXpGain(totalXp)
    onCoinGain(coins)
  }

  // Silah görünümünü nadirliğe göre al
  const getSwordAppearance = () => {
    return weaponRarity
  }

  const swordAppearance = getSwordAppearance()

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Kombo sayacı */}
      {comboCount > 1 && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-white font-bold animate-pulse z-10">
          {comboCount}x Kombo!
        </div>
      )}

      {/* Dokunma alanı */}
      <div
        ref={swordRef}
        className="relative cursor-pointer w-48 h-48 flex items-center justify-center mb-4"
        onClick={handleTap}
      >
        <div
          className={`w-44 h-44 rounded-full flex items-center justify-center relative shadow-2xl border-4 
            ${isAnimating ? "scale-95" : "scale-100"} transition-transform duration-200
            ${swordAppearance === "common" && "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600"}
            ${swordAppearance === "uncommon" && "bg-gradient-to-br from-green-700 to-green-900 border-green-600"}
            ${swordAppearance === "rare" && "bg-gradient-to-br from-blue-700 to-blue-900 border-blue-500"}
            ${swordAppearance === "epic" && "bg-gradient-to-br from-purple-700 to-purple-900 border-purple-500"}
            ${swordAppearance === "legendary" && "bg-gradient-to-br from-amber-500 to-amber-800 border-amber-400"}
          `}
        >
          <div
            className={`w-36 h-36 rounded-full flex items-center justify-center relative overflow-hidden
              ${swordAppearance === "common" && "bg-gradient-to-br from-gray-800 to-gray-950"}
              ${swordAppearance === "uncommon" && "bg-gradient-to-br from-green-800 to-green-950"}
              ${swordAppearance === "rare" && "bg-gradient-to-br from-blue-800 to-blue-950"}
              ${swordAppearance === "epic" && "bg-gradient-to-br from-purple-800 to-purple-950"}
              ${swordAppearance === "legendary" && "bg-gradient-to-br from-amber-700 to-amber-950"}
            `}
          >
            <div className="absolute inset-0 bg-[url('/sword-pattern.png')] opacity-20"></div>

            {/* Nadirliğe göre farklı kılıç simgeleri */}
            {swordAppearance === "common" && <Sword className="w-20 h-20 text-gray-400" strokeWidth={1.5} />}

            {swordAppearance === "uncommon" && <Sword className="w-20 h-20 text-green-400" strokeWidth={1.5} />}

            {swordAppearance === "rare" && (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 3L17 6V10L22 15L20 17L18 15L14 19L10 15L6 19L4 17L9 12V6L14 3Z"
                  fill="#60a5fa"
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
              </svg>
            )}

            {swordAppearance === "epic" && (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L16 6V10L22 16L20 18L18 16L14 20L10 16L6 20L4 18L10 12V6L12 2Z"
                  fill="#a855f7"
                  stroke="#9333ea"
                  strokeWidth="1"
                />
                <path d="M12 6L14 8V10L12 12L10 10V8L12 6Z" fill="#f9fafb" stroke="#9333ea" strokeWidth="0.5" />
              </svg>
            )}

            {swordAppearance === "legendary" && (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L16 6V10L22 16L20 18L18 16L14 20L10 16L6 20L4 18L10 12V6L12 2Z"
                  fill="#fcd34d"
                  stroke="#f59e0b"
                  strokeWidth="1"
                />
                <path d="M12 6L14 8V10L12 12L10 10V8L12 6Z" fill="#f9fafb" stroke="#f59e0b" strokeWidth="0.5" />
                <circle cx="12" cy="9" r="1" fill="#f97316" />
              </svg>
            )}
          </div>

          {/* Dokunma sayısı gösterimi */}
          <div className="absolute -bottom-2 bg-[#1a2235] px-3 py-1 rounded-full text-sm border border-gray-700">
            Dokunma: {taps}
          </div>
        </div>

        {/* TP popup animasyonu */}
        {showXpPopup && (
          <div
            className={`absolute text-lg font-bold ${isCritical ? "text-amber-400 text-xl" : "text-blue-400"}`}
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              animation: "float-up 1s forwards",
              opacity: 1,
            }}
          >
            {isCritical && <Star className="w-4 h-4 inline mr-1" />}+{popupValue} TP
          </div>
        )}
      </div>

      {/* Aktif yetenekler */}
      <div className="flex space-x-2 mt-2">
        {activeSkills.includes("doubleStrike") && (
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-full"
            onClick={() => {
              /* Yetenek mantığı */
            }}
          >
            <Zap className="w-6 h-6" />
          </button>
        )}

        {activeSkills.includes("shieldBash") && (
          <button
            className="bg-gradient-to-r from-green-600 to-green-700 p-2 rounded-full"
            onClick={() => {
              /* Yetenek mantığı */
            }}
          >
            <Shield className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}
