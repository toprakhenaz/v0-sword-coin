"use client"

import { useState, useEffect } from "react"
import PlayerStats from "@/components/player-stats"
import QuestSystem from "@/components/quest-system"

export default function QuestsPage() {
  // Oyuncu durumu (gerçek bir uygulamada üst bileşenden veya bağlamdan geçirilir)
  const [playerLevel, setPlayerLevel] = useState(1)
  const [currentXp, setCurrentXp] = useState(0)
  const [maxXp, setMaxXp] = useState(100)
  const [coins, setCoins] = useState(100)
  const [weaponLevel, setWeaponLevel] = useState(1)
  const [weaponName, setWeaponName] = useState("Paslı Kılıç")
  const [weaponRarity, setWeaponRarity] = useState("common")
  const [stats, setStats] = useState({
    strength: 5,
    defense: 3,
    agility: 4,
    vitality: 5,
  })

  // Bildirimler
  const [notifications, setNotifications] = useState<any[]>([])

  // Oyun verilerini yükle
  useEffect(() => {
    const savedData = localStorage.getItem("swordAscensionSave")
    if (savedData) {
      const gameData = JSON.parse(savedData)
      setPlayerLevel(gameData.playerLevel || 1)
      setCurrentXp(gameData.currentXp || 0)
      setMaxXp(100 * Math.pow(1.2, (gameData.playerLevel || 1) - 1))
      setCoins(gameData.coins || 100)
      setWeaponLevel(gameData.weaponLevel || 1)
      setWeaponName(gameData.weaponName || "Paslı Kılıç")
      setWeaponRarity(gameData.weaponRarity || "common")
      setStats(gameData.stats || { strength: 5, defense: 3, agility: 4, vitality: 5 })
    }
  }, [])

  // Görev tamamlamayı işle
  const handleQuestComplete = (rewards: { xp: number; coins: number; loot?: any }) => {
    // TP'yi güncelle
    setCurrentXp((prev) => {
      const newXp = prev + rewards.xp

      // Seviye atlama kontrolü
      if (newXp >= maxXp) {
        setPlayerLevel((prevLevel) => {
          const newLevel = prevLevel + 1

          // Bildirim göster
          addNotification({
            type: "levelUp",
            title: "Seviye Atladın!",
            message: `Seviye ${newLevel}'e ulaştın!`,
            duration: 3000,
          })

          // Yeni maksimum TP'yi hesapla
          setMaxXp(100 * Math.pow(1.2, newLevel - 1))

          // İlerlemeyi kaydet
          saveGame(newLevel, newXp - maxXp, coins + rewards.coins)

          return newLevel
        })

        return newXp - maxXp
      }

      // İlerlemeyi kaydet
      saveGame(playerLevel, newXp, coins + rewards.coins)

      return newXp
    })

    // Altını güncelle
    setCoins((prev) => prev + rewards.coins)

    // Ganimet varsa işle
    if (rewards.loot) {
      addNotification({
        type: "loot",
        title: "Ganimet Bulundu!",
        message: `${rewards.loot.rarity} ${rewards.loot.type} buldun!`,
        duration: 4000,
      })
    }

    // Tamamlama bildirimi göster
    addNotification({
      type: "quest",
      title: "Görev Tamamlandı!",
      message: `${rewards.xp} TP ve ${rewards.coins} altın kazandın!`,
      duration: 3000,
    })
  }

  // Bildirim ekle
  const addNotification = (notification: any) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { ...notification, id }])

    // Belirli süre sonra bildirimi otomatik kaldır
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, notification.duration || 3000)
  }

  // Oyun verilerini kaydet
  const saveGame = (level: number, xp: number, newCoins: number) => {
    const gameData = {
      playerLevel: level,
      currentXp: xp,
      coins: newCoins,
      weaponLevel,
      weaponName,
      weaponRarity,
      stats,
      lastPlayTime: Date.now(),
    }
    localStorage.setItem("swordAscensionSave", JSON.stringify(gameData))
  }

  return (
    <div className="pb-20">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-amber-400">Görevler</h1>
        <p className="text-gray-400 text-xs">Ödüller için görevleri tamamla</p>
      </div>

      {/* Oyuncu İstatistikleri */}
      <PlayerStats
        playerLevel={playerLevel}
        currentXp={currentXp}
        maxXp={maxXp}
        weaponLevel={weaponLevel}
        weaponName={weaponName}
        weaponRarity={weaponRarity}
        coins={coins}
        stats={stats}
      />

      {/* Görev Sistemi */}
      <div className="mx-4 my-4">
        <QuestSystem playerLevel={playerLevel} onQuestComplete={handleQuestComplete} />
      </div>

      {/* Bildirimler */}
      <div className="fixed bottom-20 left-0 right-0 flex flex-col items-center pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`mb-2 px-4 py-2 rounded-lg shadow-lg max-w-xs animate-bounce-in ${
              notification.type === "levelUp"
                ? "bg-blue-600"
                : notification.type === "quest"
                  ? "bg-green-600"
                  : notification.type === "loot"
                    ? "bg-amber-600"
                    : "bg-purple-600"
            }`}
          >
            <h4 className="font-bold">{notification.title}</h4>
            <p className="text-sm">{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
