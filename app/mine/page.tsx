"use client"

import { useState, useEffect, useRef } from "react"
import { Hourglass, ChevronUp, Coins, Rocket, Zap } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { initTelegramWebApp } from "@/lib/telegram"
import UserProfile from "@/components/user-profile"

export default function MinePage() {
  const router = useRouter()
  const [energy, setEnergy] = useState(2793)
  const [coins, setCoins] = useState(23951)
  const [taps, setTaps] = useState(0)
  const [showCoinPopup, setShowCoinPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [popupValue, setPopupValue] = useState(6)
  const [boostActive, setBoostActive] = useState(false)
  const [boostTimeLeft, setBoostTimeLeft] = useState(0)
  const [multiTap, setMultiTap] = useState(1)
  const [comboCounter, setComboCounter] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [telegramApp, setTelegramApp] = useState<ReturnType<typeof initTelegramWebApp> | null>(null)

  const swordRef = useRef(null)
  const maxEnergy = 3000
  const energyPercentage = (energy / maxEnergy) * 100
  const earnPerTap = boostActive ? 12 : 6
  const comboTimeout = 1500 // ms

  useEffect(() => {
    // Telegram Web App API'sini başlat
    const tgApp = initTelegramWebApp()
    setTelegramApp(tgApp)

    // Check if first time user
    const firstVisit = localStorage.getItem("firstVisit") !== "false"
    if (firstVisit) {
      setShowTutorial(true)
      localStorage.setItem("firstVisit", "false")
    }

    // Simulate energy regeneration
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + 1, maxEnergy))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Boost timer countdown
    if (boostTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBoostTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (boostTimeLeft === 0 && boostActive) {
      setBoostActive(false)
    }
  }, [boostTimeLeft, boostActive])

  const handleTap = (e) => {
    if (energy >= 10) {
      // Get tap position for coin animation
      const rect = swordRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Calculate random position around the center
      const randomAngle = Math.random() * Math.PI * 2
      const randomDistance = 30 + Math.random() * 50
      const x = centerX + Math.cos(randomAngle) * randomDistance
      const y = centerY + Math.sin(randomAngle) * randomDistance

      setPopupPosition({ x, y })

      // Check for combo
      const now = Date.now()
      if (now - lastTapTime < comboTimeout) {
        setComboCounter((prev) => prev + 1)
        if (comboCounter >= 3) {
          setShowCombo(true)
          setTimeout(() => setShowCombo(false), 1500)
        }
      } else {
        setComboCounter(1)
      }
      setLastTapTime(now)

      // Calculate coins earned with multi-tap and combo
      let coinsEarned = earnPerTap * multiTap
      if (comboCounter >= 5) {
        coinsEarned = Math.floor(coinsEarned * 1.5) // 50% bonus for 5+ combo
      } else if (comboCounter >= 3) {
        coinsEarned = Math.floor(coinsEarned * 1.2) // 20% bonus for 3+ combo
      }

      setPopupValue(coinsEarned)

      // Add coins and show popup
      setCoins((prev) => prev + coinsEarned)
      setTaps((prev) => prev + 1)
      setEnergy((prev) => prev - 10)
      setShowCoinPopup(true)

      // Add haptic feedback using Telegram API if available
      if (telegramApp) {
        telegramApp.vibrate(comboCounter >= 5 ? "heavy" : comboCounter >= 3 ? "medium" : "light")
      } else if (navigator.vibrate) {
        navigator.vibrate(20)
      }

      // Hide popup after animation
      setTimeout(() => {
        setShowCoinPopup(false)
      }, 1000)
    }
  }

  const activateBoost = () => {
    setBoostActive(true)
    setBoostTimeLeft(300) // 5 minutes in seconds

    // Telegram bildirim efekti
    if (telegramApp) {
      telegramApp.showNotification("success", "Boost aktifleştirildi!")
    }
  }

  const activateMultiTap = () => {
    setMultiTap(5) // 5x taps
    setTimeout(() => {
      setMultiTap(1)
    }, 60000) // 1 minute

    // Telegram bildirim efekti
    if (telegramApp) {
      telegramApp.showNotification("success", "Multi-tap aktifleştirildi!")
    }
  }

  const closeTutorial = () => {
    setShowTutorial(false)
  }

  return (
    <div className="pb-4">
      <div className="text-center pt-4 pb-2 flex items-center justify-between px-4">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-full px-4 py-2 flex items-center shadow-lg">
          <Coins className="w-5 h-5 mr-2 text-black" />
          <span className="font-bold text-black">{coins.toLocaleString()}</span>
        </div>

        <h1 className="text-xl font-bold text-amber-400">Sword Coin</h1>

        <UserProfile />
      </div>

      <div className="bg-gradient-to-r from-[#1a2235] to-[#1e2738] rounded-xl mx-4 my-3 p-3 shadow-lg border border-gray-800/50">
        <div className="flex justify-between text-center">
          <div className="text-center">
            <p className="text-purple-300 text-xs">Hourly</p>
            <div className="flex items-center justify-center bg-[#1e2738]/70 px-2 py-1 rounded-lg mt-1">
              <Hourglass className="w-4 h-4 mr-1 text-white" />
              <span className="text-base font-bold">11.6K</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-green-300 text-xs">Next Lv</p>
            <div className="flex items-center justify-center bg-[#1e2738]/70 px-2 py-1 rounded-lg mt-1">
              <ChevronUp className="w-4 h-4 mr-1 text-white" />
              <span className="text-base font-bold">250K</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-amber-300 text-xs">Per Tap</p>
            <div className="flex items-center justify-center bg-[#1e2738]/70 px-2 py-1 rounded-lg mt-1">
              <Coins className="w-4 h-4 mr-1 text-white" />
              <span className="text-base font-bold">+{earnPerTap}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Boosts */}
      <div className="flex justify-center space-x-3 mx-4 mb-3">
        <button
          onClick={activateBoost}
          disabled={boostActive}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center shadow-md ${
            boostActive
              ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          }`}
        >
          <Zap className="w-4 h-4 mr-1" />
          {boostActive ? `${boostTimeLeft}s` : "2x Boost"}
        </button>

        <button
          onClick={activateMultiTap}
          disabled={multiTap > 1}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center shadow-md ${
            multiTap > 1
              ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
              : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
          }`}
        >
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 5H16M8 5V19M8 5L4 9M16 5V19M16 5L20 9M16 19H8M16 19L20 15M8 19L4 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {multiTap > 1 ? "5x Active" : "5x Tap"}
        </button>
      </div>

      <div className="flex justify-center items-center my-4 relative">
        <div
          ref={swordRef}
          className="relative cursor-pointer w-48 h-48 flex items-center justify-center"
          onClick={handleTap}
        >
          {boostActive && <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping"></div>}
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center relative shadow-2xl border-4 border-amber-600 active:scale-95 transition-transform">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-amber-800 to-amber-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/sword-pattern.png')] opacity-10"></div>
              <svg width="90" height="90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L16 6V10L22 16L20 18L18 16L14 20L10 16L6 20L4 18L10 12V6L12 2Z"
                  fill="#fcd34d"
                  stroke="#b45309"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* Tap count display */}
            {taps > 0 && (
              <div className="absolute -bottom-2 bg-[#1a2235] px-3 py-1 rounded-full text-sm border border-gray-700">
                Taps: {taps}
              </div>
            )}
          </div>

          {/* Coin popup animation */}
          {showCoinPopup && (
            <div
              className="absolute text-amber-400 font-bold text-lg"
              style={{
                left: `${popupPosition.x}px`,
                top: `${popupPosition.y}px`,
                animation: "float-up 1s forwards",
                opacity: 1,
              }}
            >
              +{popupValue}
            </div>
          )}

          {/* Combo display */}
          {showCombo && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-white font-bold animate-pulse">
              COMBO x{comboCounter}!
            </div>
          )}
        </div>
      </div>

      <div className="mx-4 my-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">Energy</span>
          <span className="font-bold">
            {energy} / {maxEnergy}
          </span>
        </div>
        <div className="relative">
          <div className="w-full bg-[#1a2235] rounded-full h-5 overflow-hidden border border-gray-700">
            <div
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 h-5 rounded-full relative"
              style={{ width: `${energyPercentage}%` }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="h-full w-full bg-[url('/energy-pattern.png')] opacity-30 bg-repeat-x"></div>
              </div>
              <div className="absolute inset-0 overflow-hidden">
                <div className="h-full w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
          <Link
            href="/boosts"
            className="absolute -right-3 -top-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2 shadow-lg border border-purple-400"
          >
            <Rocket className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a2235] rounded-xl p-6 max-w-xs">
            <h2 className="text-xl font-bold text-amber-400 mb-4">How to Play</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <div className="bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">1</div>
                <p>Tap the sword to mine coins</p>
              </li>
              <li className="flex items-start">
                <div className="bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">2</div>
                <p>Use coins to buy upgrades in the shop</p>
              </li>
              <li className="flex items-start">
                <div className="bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">3</div>
                <p>Upgrades increase your passive income</p>
              </li>
              <li className="flex items-start">
                <div className="bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">4</div>
                <p>Tap quickly for combo bonuses!</p>
              </li>
            </ul>
            <button
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg py-3 font-bold"
              onClick={closeTutorial}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
