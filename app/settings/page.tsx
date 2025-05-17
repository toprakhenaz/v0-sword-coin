"use client"

import { useState, useEffect } from "react"
import { Save, Trash2, Volume2, Vibrate, Bell } from "lucide-react"
import PlayerStats from "@/components/player-stats"
import DailySystem from "@/components/daily-system"

export default function SettingsPage() {
  // Oyuncu durumu
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

  // Ayarlar
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

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

      // Ayarları yükle
      setSoundEnabled(gameData.settings?.soundEnabled !== false)
      setVibrationEnabled(gameData.settings?.vibrationEnabled !== false)
      setNotificationsEnabled(gameData.settings?.notificationsEnabled !== false)
    }
  }, [])

  // Oyun verilerini kaydet
  const saveGame = () => {
    const gameData = {
      playerLevel,
      currentXp,
      coins,
      weaponLevel,
      weaponName,
      weaponRarity,
      stats,
      settings: {
        soundEnabled,
        vibrationEnabled,
        notificationsEnabled,
      },
      lastPlayTime: Date.now(),
    }
    localStorage.setItem("swordAscensionSave", JSON.stringify(gameData))

    // Bildirim göster
    addNotification({
      type: "success",
      title: "Oyun Kaydedildi",
      message: "İlerlemeniz başarıyla kaydedildi!",
      duration: 3000,
    })
  }

  // Oyun verilerini sıfırla
  const resetGame = () => {
    if (confirm("Oyununuzu sıfırlamak istediğinizden emin misiniz? Tüm ilerlemeniz kaybolacak.")) {
      localStorage.removeItem("swordAscensionSave")

      // Durumu sıfırla
      setPlayerLevel(1)
      setCurrentXp(0)
      setMaxXp(100)
      setCoins(100)
      setWeaponLevel(1)
      setWeaponName("Paslı Kılıç")
      setWeaponRarity("common")
      setStats({
        strength: 5,
        defense: 3,
        agility: 4,
        vitality: 5,
      })

      // Bildirim göster
      addNotification({
        type: "warning",
        title: "Oyun Sıfırlandı",
        message: "Oyununuz başlangıca sıfırlandı.",
        duration: 3000,
      })
    }
  }

  // Günlük ödül talebini işle
  const handleDailyReward = (rewards: { xp: number; coins: number; loot?: any }) => {
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

          return newLevel
        })

        return newXp - maxXp
      }

      return newXp
    })

    // Altını güncelle
    setCoins((prev) => prev + rewards.coins)

    // Özel ganimet varsa işle
    if (rewards.loot) {
      addNotification({
        type: "special",
        title: "Özel Ödül!",
        message: `${rewards.loot.name} aldın!`,
        duration: 4000,
      })
    }

    // Talep bildirimi göster
    addNotification({
      type: "success",
      title: "Günlük Ödül Alındı",
      message: `${rewards.xp} TP ve ${rewards.coins} altın kazandın!`,
      duration: 3000,
    })

    // İlerlemeyi kaydet
    saveGame()
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

  return (
    <div className="pb-20">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-amber-400">Ayarlar</h1>
        <p className="text-gray-400 text-xs">Oyununuzu yönetin</p>
      </div>

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

      {/* Ayarlar */}
      <div className="bg-[#1a2235] rounded-xl p-4 mx-4 my-4 shadow-md border border-gray-800/50">
        <h2 className="text-lg font-bold mb-4">Oyun Ayarları</h2>

        <div className="space-y-4">
          {/* Ses Geçişi */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Volume2 className="w-5 h-5 mr-3 text-blue-400" />
              <span>Ses Efektleri</span>
            </div>
            <button
              className={`w-12 h-6 rounded-full relative ${soundEnabled ? "bg-green-600" : "bg-gray-700"}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                  soundEnabled ? "right-0.5" : "left-0.5"
                }`}
              ></div>
            </button>
          </div>

          {/* Titreşim Geçişi */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Vibrate className="w-5 h-5 mr-3 text-purple-400" />
              <span>Titreşim</span>
            </div>
            <button
              className={`w-12 h-6 rounded-full relative ${vibrationEnabled ? "bg-green-600" : "bg-gray-700"}`}
              onClick={() => setVibrationEnabled(!vibrationEnabled)}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                  vibrationEnabled ? "right-0.5" : "left-0.5"
                }`}
              ></div>
            </button>
          </div>

          {/* Bildirimler Geçişi */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-3 text-amber-400" />
              <span>Bildirimler</span>
            </div>
            <button
              className={`w-12 h-6 rounded-full relative ${notificationsEnabled ? "bg-green-600" : "bg-gray-700"}`}
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                  notificationsEnabled ? "right-0.5" : "left-0.5"
                }`}
              ></div>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <button
              className="w-full bg-blue-600 py-3 rounded-lg font-bold flex items-center justify-center mb-3"
              onClick={saveGame}
            >
              <Save className="w-5 h-5 mr-2" />
              Oyunu Kaydet
            </button>

            <button
              className="w-full bg-red-600 py-3 rounded-lg font-bold flex items-center justify-center"
              onClick={resetGame}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Oyunu Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* Günlük Sistem */}
      <div className="mx-4 my-4">
        <DailySystem onClaimReward={handleDailyReward} />
      </div>

      {/* Oyun Bilgisi */}
      <div className="bg-[#1a2235] rounded-xl p-4 mx-4 my-4 shadow-md border border-gray-800/50">
        <h2 className="text-lg font-bold mb-4">Oyun Bilgisi</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Oyun Sürümü</span>
            <span>1.0.0</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Yapımcı</span>
            <span>Kılıç Yükselişi Ekibi</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Son Kayıt</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Bildirimler */}
      <div className="fixed bottom-20 left-0 right-0 flex flex-col items-center pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`mb-2 px-4 py-2 rounded-lg shadow-lg max-w-xs animate-bounce-in ${
              notification.type === "levelUp"
                ? "bg-blue-600"
                : notification.type === "success"
                  ? "bg-green-600"
                  : notification.type === "warning"
                    ? "bg-amber-600"
                    : notification.type === "special"
                      ? "bg-purple-600"
                      : "bg-red-600"
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
