"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/providers/UserProvider"
import { Navbar } from "@/components/Navbar"
import { playSound } from "@/utils/soundEffects"

export default function BoostPage() {
  const { user, updateUser, loading } = useUser()
  const [activeBoosts, setActiveBoosts] = useState<string[]>([])
  const [boostCooldown, setBoostCooldown] = useState(0)

  useEffect(() => {
    if (user) {
      // Aktif boost'ları hesapla
      const lastBoostTime = new Date(user.lastBoostTime).getTime()
      const now = new Date().getTime()
      const timeDiff = now - lastBoostTime

      // Eğer son boost'tan bu yana 1 saat geçmediyse, kalan süreyi hesapla
      if (timeDiff < 3600000) {
        setBoostCooldown(3600000 - timeDiff)
      } else {
        setBoostCooldown(0)
      }

      // Her saniye kalan süreyi güncelle
      const interval = setInterval(() => {
        setBoostCooldown((prev) => {
          if (prev <= 1000) {
            clearInterval(interval)
            return 0
          }
          return prev - 1000
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [user])

  const activateBoost = async (boostType: string) => {
    if (!user) return

    // Boost kullanım hakkı kalmadıysa
    if (user.dailyBoostCount <= 0) {
      alert("Bugün için boost hakkınız kalmadı!")
      playSound("error")
      return
    }

    // Cooldown süresi dolmadıysa
    if (boostCooldown > 0) {
      alert("Boost kullanmak için beklemeniz gerekiyor!")
      playSound("error")
      return
    }

    // Boost'u aktifleştir
    playSound("boost")
    setActiveBoosts((prev) => [...prev, boostType])

    // Kullanıcı verilerini güncelle
    await updateUser({
      dailyBoostCount: user.dailyBoostCount - 1,
      lastBoostTime: new Date().toISOString(),
    })

    // Boost etkisini uygula
    if (boostType === "tap") {
      await updateUser({
        coinsPerTap: user.coinsPerTap * 2,
      })

      // 1 saat sonra etkiyi kaldır
      setTimeout(() => {
        updateUser({
          coinsPerTap: user.coinsPerTap / 2,
        })
        setActiveBoosts((prev) => prev.filter((b) => b !== boostType))
      }, 3600000)
    } else if (boostType === "energy") {
      await updateUser({
        energy: user.energyMax,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Navbar />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Boost Merkezi</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <p className="font-medium">Kalan Boost Hakkı: {user?.dailyBoostCount || 0}/3</p>

          {boostCooldown > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Sonraki boost için bekleyin: {Math.floor(boostCooldown / 60000)}:
                {Math.floor((boostCooldown % 60000) / 1000)
                  .toString()
                  .padStart(2, "0")}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: `${100 - (boostCooldown / 3600000) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Tap Boost */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Tıklama Boost</h3>
                <p className="text-sm text-gray-500">1 saat boyunca tıklama başına kazancınızı 2 katına çıkarır</p>
              </div>
            </div>

            <button
              onClick={() => activateBoost("tap")}
              disabled={boostCooldown > 0 || (user?.dailyBoostCount || 0) <= 0 || activeBoosts.includes("tap")}
              className={`w-full py-2 rounded ${
                boostCooldown > 0 || (user?.dailyBoostCount || 0) <= 0 || activeBoosts.includes("tap")
                  ? "bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white"
              }`}
            >
              {activeBoosts.includes("tap") ? "Aktif (1 saat)" : "Aktifleştir"}
            </button>
          </div>

          {/* Energy Boost */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Enerji Boost</h3>
                <p className="text-sm text-gray-500">Enerjinizi anında maksimum seviyeye çıkarır</p>
              </div>
            </div>

            <button
              onClick={() => activateBoost("energy")}
              disabled={
                boostCooldown > 0 ||
                (user?.dailyBoostCount || 0) <= 0 ||
                (user?.energy || 0) >= (user?.energyMax || 500)
              }
              className={`w-full py-2 rounded ${
                boostCooldown > 0 ||
                (user?.dailyBoostCount || 0) <= 0 ||
                (user?.energy || 0) >= (user?.energyMax || 500)
                  ? "bg-gray-300 text-gray-500"
                  : "bg-green-500 text-white"
              }`}
            >
              {(user?.energy || 0) >= (user?.energyMax || 500) ? "Enerji Zaten Maksimum" : "Aktifleştir"}
            </button>
          </div>

          {/* League Boost - Kilitli */}
          <div className="bg-white p-4 rounded-lg shadow opacity-75">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Lig Boost</h3>
                <p className="text-sm text-gray-500">Lig puanlarınızı 2 katına çıkarır (Lig 5'te açılır)</p>
              </div>
            </div>

            <button
              disabled={true}
              className="w-full py-2 rounded bg-gray-300 text-gray-500 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Lig 5'te Açılır
            </button>
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  )
}
