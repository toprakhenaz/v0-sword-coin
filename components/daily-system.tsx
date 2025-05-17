"use client"

import { useState, useEffect } from "react"
import { Gift, Check, Clock } from "lucide-react"

interface DailySystemProps {
  onClaimReward: (rewards: { xp: number; coins: number; loot?: any }) => void
}

export default function DailySystem({ onClaimReward }: DailySystemProps) {
  const [streak, setStreak] = useState(0)
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null)
  const [canClaim, setCanClaim] = useState(false)
  const [timeUntilReset, setTimeUntilReset] = useState("")
  const [dailyTasks, setDailyTasks] = useState([
    { id: 1, name: "3 görev tamamla", progress: 0, target: 3, completed: false },
    { id: 2, name: "100 kez dokun", progress: 0, target: 100, completed: false },
    { id: 3, name: "Bir boss yen", progress: 0, target: 1, completed: false },
  ])

  // Günlük ödülün alınıp alınamayacağını kontrol et
  useEffect(() => {
    // Kaydedilmiş verileri yükle
    const savedStreak = localStorage.getItem("dailyStreak")
    const savedLastClaim = localStorage.getItem("lastClaimDate")
    const savedTasks = localStorage.getItem("dailyTasks")

    if (savedStreak) setStreak(Number.parseInt(savedStreak))
    if (savedLastClaim) setLastClaimDate(savedLastClaim)
    if (savedTasks) setDailyTasks(JSON.parse(savedTasks))

    // Ödülün alınıp alınamayacağını kontrol et
    const checkClaimStatus = () => {
      const now = new Date()
      const today = now.toDateString()

      if (lastClaimDate !== today) {
        setCanClaim(true)
      } else {
        setCanClaim(false)
      }

      // Bir sonraki sıfırlamaya kadar olan süreyi hesapla
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const timeLeft = tomorrow.getTime() - now.getTime()
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

      setTimeUntilReset(`${hoursLeft}s ${minutesLeft}d`)
    }

    checkClaimStatus()
    const interval = setInterval(checkClaimStatus, 60000) // Her dakika kontrol et

    return () => clearInterval(interval)
  }, [lastClaimDate])

  // Günlük ödülü al
  const claimDailyReward = () => {
    if (!canClaim) return

    const now = new Date()
    const today = now.toDateString()

    // Serinin devam edip etmediğini kontrol et
    if (lastClaimDate) {
      const lastDate = new Date(lastClaimDate)
      const daysSinceLastClaim = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceLastClaim <= 1) {
        // Seri devam ediyor
        setStreak((prev) => prev + 1)
      } else {
        // Seri sıfırlanıyor
        setStreak(1)
      }
    } else {
      // İlk talep
      setStreak(1)
    }

    // Seriye göre ödülleri hesapla
    const baseXp = 100
    const baseCoins = 50

    const streakMultiplier = 1 + Math.min(streak, 7) * 0.1
    const xpReward = Math.floor(baseXp * streakMultiplier)
    const coinReward = Math.floor(baseCoins * streakMultiplier)

    // 7 günlük seride özel ödül
    let loot = undefined
    if (streak % 7 === 0) {
      loot = {
        type: "special",
        name: "Seri Sandığı",
        rarity: "rare",
      }
    }

    // Durumu güncelle
    setLastClaimDate(today)
    setCanClaim(false)

    // localStorage'a kaydet
    localStorage.setItem("dailyStreak", streak.toString())
    localStorage.setItem("lastClaimDate", today)

    // Ödül geri çağrısını tetikle
    onClaimReward({ xp: xpReward, coins: coinReward, loot })

    // Günlük görevleri sıfırla
    const resetTasks = dailyTasks.map((task) => ({
      ...task,
      progress: 0,
      completed: false,
    }))

    setDailyTasks(resetTasks)
    localStorage.setItem("dailyTasks", JSON.stringify(resetTasks))
  }

  // Görev ilerlemesini güncelle (bu, üst bileşenden çağrılacak)
  const updateTaskProgress = (taskId: number, progress: number) => {
    setDailyTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === taskId) {
          const newProgress = Math.min(task.progress + progress, task.target)
          const completed = newProgress >= task.target

          return {
            ...task,
            progress: newProgress,
            completed,
          }
        }
        return task
      })

      localStorage.setItem("dailyTasks", JSON.stringify(updatedTasks))
      return updatedTasks
    })
  }

  // Demo amaçlı, ilk görevi güncelleme simülasyonu
  useEffect(() => {
    const timer = setTimeout(() => {
      updateTaskProgress(1, 1)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-[#1a2235] rounded-xl shadow-md border border-gray-800/50">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-bold">Günlük Ödüller</h2>
      </div>

      {/* Günlük Giriş Ödülü */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-medium">Günlük Giriş</h3>
            <p className="text-sm text-gray-400">Seri: {streak} gün</p>
          </div>

          {canClaim ? (
            <button
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
              onClick={claimDailyReward}
            >
              <Gift className="w-5 h-5 mr-1" />
              Al
            </button>
          ) : (
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm">{timeUntilReset}</span>
            </div>
          )}
        </div>

        {/* Seri takvimi */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center ${
                i < streak % 7 || (i === 0 && streak % 7 === 0 && streak > 0)
                  ? "bg-amber-600 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {i < streak % 7 || (i === 0 && streak % 7 === 0 && streak > 0) ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-center text-gray-400">7 günlük seri: Özel Sandık Ödülü</div>
      </div>

      {/* Günlük Görevler */}
      <div className="p-4">
        <h3 className="font-medium mb-3">Günlük Görevler</h3>

        <div className="space-y-3">
          {dailyTasks.map((task) => (
            <div key={task.id} className="bg-[#1e2738] rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{task.name}</span>
                {task.completed ? (
                  <div className="bg-green-600 text-white w-5 h-5 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">
                    {task.progress}/{task.target}
                  </span>
                )}
              </div>

              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${task.completed ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${(task.progress / task.target) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button
            className={`py-2 px-4 rounded-lg font-medium ${
              dailyTasks.every((task) => task.completed)
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!dailyTasks.every((task) => task.completed)}
          >
            Tüm Görev Ödüllerini Al
          </button>
        </div>
      </div>
    </div>
  )
}
