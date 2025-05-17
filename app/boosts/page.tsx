"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Zap, Clock, Coins, BarChart2, Rocket, ArrowLeft } from "lucide-react"
import Link from "next/link"
import CoinBalance from "@/components/coin-balance"

interface Boost {
  id: string
  name: string
  description: string
  cost: number
  duration: number // saniye cinsinden
  type: "tap" | "auto" | "buff"
  multiplier: number
  active: boolean
  timeLeft?: number
  icon: React.ReactNode
  color: string
}

export default function BoostsPage() {
  const [coins, setCoins] = useState(23951)
  const [boosts, setBoosts] = useState<Boost[]>([])
  const [activeTab, setActiveTab] = useState<"tap" | "auto" | "buff">("tap")
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false)
  const [purchasedBoost, setPurchasedBoost] = useState<Boost | null>(null)

  useEffect(() => {
    // Boostları yükle
    const initialBoosts: Boost[] = [
      {
        id: "tap-2x",
        name: "2x Tap Gücü",
        description: "Her dokunuşta kazandığın TP ve altını 2 katına çıkarır.",
        cost: 5000,
        duration: 300, // 5 dakika
        type: "tap",
        multiplier: 2,
        active: false,
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        color: "from-yellow-600 to-amber-700",
      },
      {
        id: "tap-5x",
        name: "5x Tap Gücü",
        description: "Her dokunuşta kazandığın TP ve altını 5 katına çıkarır.",
        cost: 15000,
        duration: 180, // 3 dakika
        type: "tap",
        multiplier: 5,
        active: false,
        icon: <Zap className="w-6 h-6 text-purple-400" />,
        color: "from-purple-600 to-purple-800",
      },
      {
        id: "auto-tap",
        name: "Otomatik Tap",
        description: "Saniyede 1 otomatik dokunuş yapar.",
        cost: 10000,
        duration: 600, // 10 dakika
        type: "auto",
        multiplier: 1,
        active: false,
        icon: <Clock className="w-6 h-6 text-blue-400" />,
        color: "from-blue-600 to-blue-800",
      },
      {
        id: "auto-tap-fast",
        name: "Hızlı Otomatik Tap",
        description: "Saniyede 3 otomatik dokunuş yapar.",
        cost: 25000,
        duration: 300, // 5 dakika
        type: "auto",
        multiplier: 3,
        active: false,
        icon: <Clock className="w-6 h-6 text-green-400" />,
        color: "from-green-600 to-green-800",
      },
      {
        id: "buff-xp",
        name: "2x TP Kazancı",
        description: "Tüm kaynaklardan kazandığın TP'yi 2 katına çıkarır.",
        cost: 20000,
        duration: 1800, // 30 dakika
        type: "buff",
        multiplier: 2,
        active: false,
        icon: <BarChart2 className="w-6 h-6 text-blue-400" />,
        color: "from-blue-600 to-blue-800",
      },
      {
        id: "buff-coins",
        name: "2x Altın Kazancı",
        description: "Tüm kaynaklardan kazandığın altını 2 katına çıkarır.",
        cost: 20000,
        duration: 1800, // 30 dakika
        type: "buff",
        multiplier: 2,
        active: false,
        icon: <Coins className="w-6 h-6 text-amber-400" />,
        color: "from-amber-600 to-amber-800",
      },
    ]

    // Kaydedilmiş boostları yükle
    const savedBoosts = localStorage.getItem("boosts")
    if (savedBoosts) {
      setBoosts(JSON.parse(savedBoosts))
    } else {
      setBoosts(initialBoosts)
    }

    // Oyuncu verilerini yükle
    const savedData = localStorage.getItem("swordAscensionSave")
    if (savedData) {
      const gameData = JSON.parse(savedData)
      setCoins(gameData.coins || 23951)
    }
  }, [])

  // Aktif boostları güncelle
  useEffect(() => {
    const timer = setInterval(() => {
      setBoosts((prevBoosts) => {
        const updatedBoosts = prevBoosts.map((boost) => {
          if (boost.active && boost.timeLeft) {
            const newTimeLeft = boost.timeLeft - 1

            if (newTimeLeft <= 0) {
              return { ...boost, active: false, timeLeft: undefined }
            }

            return { ...boost, timeLeft: newTimeLeft }
          }
          return boost
        })

        // Boostları kaydet
        localStorage.setItem("boosts", JSON.stringify(updatedBoosts))

        return updatedBoosts
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Boost satın al
  const purchaseBoost = (boostId: string) => {
    setBoosts((prevBoosts) => {
      const updatedBoosts = prevBoosts.map((boost) => {
        if (boost.id === boostId) {
          // Yeterli altın var mı kontrol et
          if (coins < boost.cost) {
            // Bildirim göster
            alert("Yetersiz altın!")
            return boost
          }

          // Altını düş
          setCoins((prev) => prev - boost.cost)

          // Oyun verilerini güncelle
          const savedData = localStorage.getItem("swordAscensionSave")
          if (savedData) {
            const gameData = JSON.parse(savedData)
            gameData.coins = coins - boost.cost
            localStorage.setItem("swordAscensionSave", JSON.stringify(gameData))
          }

          // Satın alma animasyonu göster
          setPurchasedBoost(boost)
          setShowPurchaseAnimation(true)
          setTimeout(() => setShowPurchaseAnimation(false), 1500)

          // Titreşim geri bildirimi (mümkünse)
          if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30])
          }

          // Boost'u aktifleştir
          return {
            ...boost,
            active: true,
            timeLeft: boost.duration,
          }
        }
        return boost
      })

      // Boostları kaydet
      localStorage.setItem("boosts", JSON.stringify(updatedBoosts))

      return updatedBoosts
    })
  }

  // Süreyi formatlama
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Filtrelenmiş boostlar
  const filteredBoosts = boosts.filter((boost) => boost.type === activeTab)

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="p-2 bg-[#1a2235] rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-amber-400">Güçlendirmeler</h1>
        <div className="w-9"></div> {/* Boş alan (dengeleme için) */}
      </div>

      <CoinBalance coins={coins} hourlyRate={11600} />

      {/* Sekmeler */}
      <div className="flex mx-4 mb-4">
        <button
          className={`flex-1 py-2 rounded-l-lg ${
            activeTab === "tap" ? "bg-amber-600 text-white" : "bg-[#1a2235] text-gray-400"
          }`}
          onClick={() => setActiveTab("tap")}
        >
          <div className="flex items-center justify-center">
            <Zap className="w-4 h-4 mr-1" />
            Tap Gücü
          </div>
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === "auto" ? "bg-amber-600 text-white" : "bg-[#1a2235] text-gray-400"}`}
          onClick={() => setActiveTab("auto")}
        >
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 mr-1" />
            Otomatik
          </div>
        </button>
        <button
          className={`flex-1 py-2 rounded-r-lg ${
            activeTab === "buff" ? "bg-amber-600 text-white" : "bg-[#1a2235] text-gray-400"
          }`}
          onClick={() => setActiveTab("buff")}
        >
          <div className="flex items-center justify-center">
            <Rocket className="w-4 h-4 mr-1" />
            Bufflar
          </div>
        </button>
      </div>

      {/* Boost Listesi */}
      <div className="space-y-4 mx-4">
        {filteredBoosts.map((boost) => (
          <div key={boost.id} className="bg-[#1a2235] rounded-xl p-4 shadow-md border border-gray-800/50">
            <div className="flex items-center mb-3">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${boost.color} flex items-center justify-center mr-3`}
              >
                {boost.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{boost.name}</h3>
                <p className="text-xs text-gray-400">{boost.description}</p>
              </div>
            </div>

            {boost.active && boost.timeLeft ? (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Kalan Süre</span>
                  <span>{formatTime(boost.timeLeft)}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full"
                    style={{ width: `${(boost.timeLeft / boost.duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                className="w-full bg-gradient-to-r from-green-600 to-green-700 py-2 rounded-lg flex items-center justify-center"
                onClick={() => purchaseBoost(boost.id)}
              >
                <Coins className="w-4 h-4 mr-2 text-white" />
                <span className="font-bold">{boost.cost.toLocaleString()} Altın</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Satın Alma Animasyonu */}
      {showPurchaseAnimation && purchasedBoost && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 animate-bounce-in shadow-lg">
            <div className="flex items-center">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${purchasedBoost.color} flex items-center justify-center mr-3`}
              >
                {purchasedBoost.icon}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{purchasedBoost.name}</h3>
                <p className="text-green-200">Güçlendirme aktifleştirildi!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
