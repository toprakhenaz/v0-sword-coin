"use client"

import { useState, useEffect } from "react"
import TapSystem from "@/components/tap-system"
import PlayerStats from "@/components/player-stats"
import { Sword, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export default function Home() {
  // Oyuncu durumu
  const [playerLevel, setPlayerLevel] = useState(1)
  const [currentXp, setCurrentXp] = useState(0)
  const [maxXp, setMaxXp] = useState(100)
  const [coins, setCoins] = useState(100)

  // Silah durumu
  const [weaponLevel, setWeaponLevel] = useState(1)
  const [weaponName, setWeaponName] = useState("Paslı Kılıç")
  const [weaponRarity, setWeaponRarity] = useState("common")

  // Yetenekler durumu
  const [activeSkills, setActiveSkills] = useState<string[]>([])

  // İstatistikler durumu
  const [stats, setStats] = useState({
    strength: 5,
    defense: 3,
    agility: 4,
    vitality: 5,
  })

  // Bildirimler
  const [notifications, setNotifications] = useState<any[]>([])

  // Listeleme sayacı ve fiyatı
  const [listingPrice, setListingPrice] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Kaydedilmiş oyun verilerini yükle
  useEffect(() => {
    const loadGame = () => {
      const savedData = localStorage.getItem("swordAscensionSave")

      if (savedData) {
        const gameData = JSON.parse(savedData)

        // Oyuncu verilerini yükle
        setPlayerLevel(gameData.playerLevel || 1)
        setCurrentXp(gameData.currentXp || 0)
        setCoins(gameData.coins || 100)

        // Silah verilerini yükle
        setWeaponLevel(gameData.weaponLevel || 1)
        setWeaponName(gameData.weaponName || "Paslı Kılıç")
        setWeaponRarity(gameData.weaponRarity || "common")

        // Yetenekleri yükle
        setActiveSkills(gameData.activeSkills || [])

        // İstatistikleri yükle
        setStats(
          gameData.stats || {
            strength: 5,
            defense: 3,
            agility: 4,
            vitality: 5,
          },
        )

        // Çevrimdışı ilerlemeyi hesapla
        const lastPlayTime = gameData.lastPlayTime || Date.now()
        const currentTime = Date.now()
        const timeAwaySeconds = Math.floor((currentTime - lastPlayTime) / 1000)

        if (timeAwaySeconds > 60) {
          // Sadece bir dakikadan fazla uzakta ise hesapla
          const offlineXp = Math.floor((timeAwaySeconds / 60) * (5 + playerLevel * 0.5))
          const offlineCoins = Math.floor(offlineXp * 0.1)

          // Çevrimdışı ödülleri ekle
          setCurrentXp((prev) => prev + offlineXp)
          setCoins((prev) => prev + offlineCoins)

          // Bildirim göster
          addNotification({
            type: "offline",
            title: "Çevrimdışı İlerleme",
            message: `Uzaktayken ${offlineXp} TP ve ${offlineCoins} altın kazandın!`,
            duration: 5000,
          })
        }
      }

      // Sonraki seviye için gereken TP'yi hesapla
      setMaxXp(100 * Math.pow(1.2, playerLevel - 1))

      // Listeleme fiyatını API'den al (simülasyon)
      // Gerçek uygulamada bir API çağrısı yapılacak
      setTimeout(() => {
        // Şimdilik null bırakıyoruz, admin panelinden ayarlanacak
        setListingPrice(null)
      }, 1000)
    }

    loadGame()

    // Otomatik kaydetme ayarla
    const saveInterval = setInterval(() => {
      saveGame()
    }, 30000) // Her 30 saniyede bir kaydet

    return () => clearInterval(saveInterval)
  }, [playerLevel])

  // Listeleme sayacı için geri sayım
  useEffect(() => {
    // Hedef tarih: 01.01.2026 13:00
    const targetDate = new Date("2026-01-01T13:00:00").getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        // Süre doldu
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
      })
    }

    // İlk güncelleme
    updateCountdown()

    // Her saniye güncelle
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
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
      activeSkills,
      stats,
      lastPlayTime: Date.now(),
    }

    localStorage.setItem("swordAscensionSave", JSON.stringify(gameData))
  }

  // TP kazancını işle
  const handleXpGain = (amount: number) => {
    setCurrentXp((prev) => {
      const newXp = prev + amount

      // Seviye atlama kontrolü
      if (newXp >= maxXp) {
        // Seviye atla!
        setPlayerLevel((prevLevel) => {
          const newLevel = prevLevel + 1

          // Bildirim göster
          addNotification({
            type: "levelUp",
            title: "Seviye Atladın!",
            message: `Seviye ${newLevel}'e ulaştın!`,
            duration: 3000,
          })

          // İstatistikleri artır
          setStats((prevStats) => ({
            strength: prevStats.strength + 1,
            defense: prevStats.defense + 1,
            agility: prevStats.agility + 1,
            vitality: prevStats.vitality + 1,
          }))

          // Seviyeye göre yetenekleri aç
          if (newLevel === 3 && !activeSkills.includes("doubleStrike")) {
            setActiveSkills((prev) => [...prev, "doubleStrike"])

            addNotification({
              type: "skill",
              title: "Yeni Yetenek Açıldı!",
              message: "Çift Vuruş yeteneğini açtın!",
              duration: 3000,
            })
          }

          if (newLevel === 5 && !activeSkills.includes("shieldBash")) {
            setActiveSkills((prev) => [...prev, "shieldBash"])

            addNotification({
              type: "skill",
              title: "Yeni Yetenek Açıldı!",
              message: "Kalkan Darbesi yeteneğini açtın!",
              duration: 3000,
            })
          }

          // Yeni maksimum TP'yi hesapla
          setMaxXp(100 * Math.pow(1.2, newLevel - 1))

          return newLevel
        })

        // Seviye atladıktan sonra kalan TP'yi döndür
        return newXp - maxXp
      }

      return newXp
    })
  }

  // Altın kazancını işle
  const handleCoinGain = (amount: number) => {
    setCoins((prev) => prev + amount)
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

  // Silahı yükselt
  const upgradeWeapon = () => {
    const upgradeCost = weaponLevel * 100

    if (coins >= upgradeCost) {
      setCoins((prev) => prev - upgradeCost)
      setWeaponLevel((prev) => {
        const newLevel = prev + 1

        // Evrim kontrolü
        if (newLevel === 5) {
          setWeaponName("Çelik Kılıç")
          setWeaponRarity("uncommon")
          addNotification({
            type: "evolution",
            title: "Silah Evrim Geçirdi!",
            message: `Silahın Çelik Kılıç'a evrim geçirdi!`,
            duration: 4000,
          })
        } else if (newLevel === 15) {
          setWeaponName("Büyülü Kılıç")
          setWeaponRarity("rare")
          addNotification({
            type: "evolution",
            title: "Silah Evrim Geçirdi!",
            message: `Silahın Büyülü Kılıç'a evrim geçirdi!`,
            duration: 4000,
          })
        } else if (newLevel === 30) {
          setWeaponName("Ruh Biçici")
          setWeaponRarity("epic")
          addNotification({
            type: "evolution",
            title: "Silah Evrim Geçirdi!",
            message: `Silahın Ruh Biçici'ye evrim geçirdi!`,
            duration: 4000,
          })
        } else if (newLevel === 50) {
          setWeaponName("Yükselmiş Kılıç")
          setWeaponRarity("legendary")
          addNotification({
            type: "evolution",
            title: "Silah Evrim Geçirdi!",
            message: `Silahın Yükselmiş Kılıç'a evrim geçirdi!`,
            duration: 4000,
          })
        }

        return newLevel
      })
    } else {
      addNotification({
        type: "error",
        title: "Yetersiz Altın",
        message: `Silahını yükseltmek için ${upgradeCost} altına ihtiyacın var.`,
        duration: 3000,
      })
    }
  }

  return (
    <div className="pb-20">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-amber-400">Kılıç Yükselişi</h1>
        <p className="text-gray-400 text-xs">Boş Zamanlar İçin RPG Oyunu</p>
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

      {/* Listeleme Sayacı ve Fiyatı (Hourly Earn yerine) */}
      <div className="bg-gradient-to-r from-[#1a2235] to-[#1e2738] rounded-xl mx-4 my-3 p-3 shadow-lg border border-gray-800/50">
        <div className="flex justify-between text-center">
          <div className="text-center flex-1">
            <p className="text-purple-300 text-xs">Listeleme Tarihi</p>
            <div className="flex items-center justify-center bg-[#1e2738]/70 px-2 py-1 rounded-lg mt-1">
              <Clock className="w-4 h-4 mr-1 text-white" />
              <span className="text-base font-bold">
                {timeRemaining.days}g {timeRemaining.hours}s {timeRemaining.minutes}d
              </span>
            </div>
          </div>

          <div className="text-center flex-1">
            <p className="text-green-300 text-xs">Listeleme Fiyatı</p>
            <div className="flex items-center justify-center bg-[#1e2738]/70 px-2 py-1 rounded-lg mt-1">
              <DollarSign className="w-4 h-4 mr-1 text-white" />
              <span className="text-base font-bold">{listingPrice !== null ? `${listingPrice} $` : "?"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dokunma Sistemi */}
      <div className="my-6">
        <TapSystem
          playerLevel={playerLevel}
          weaponLevel={weaponLevel}
          weaponRarity={weaponRarity}
          activeSkills={activeSkills}
          onXpGain={handleXpGain}
          onCoinGain={handleCoinGain}
        />
      </div>

      {/* Silah Yükseltme Butonu */}
      <div className="mx-4 mb-6">
        <button
          className="w-full bg-gradient-to-r from-amber-600 to-amber-700 py-3 rounded-lg font-bold flex items-center justify-center"
          onClick={upgradeWeapon}
        >
          <Sword className="w-5 h-5 mr-2" />
          Silahı Yükselt ({weaponLevel * 100} altın)
        </button>
      </div>

      {/* Hızlı Bağlantılar */}
      <div className="grid grid-cols-2 gap-3 mx-4 mb-6">
        <Link
          href="/quests"
          className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl flex flex-col items-center justify-center"
        >
          <span className="text-lg font-bold mb-1">Görevler</span>
          <span className="text-sm text-blue-200">Ödüller için tamamla</span>
        </Link>

        <Link
          href="/battle"
          className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-xl flex flex-col items-center justify-center"
        >
          <span className="text-lg font-bold mb-1">Savaş</span>
          <span className="text-sm text-red-200">Düşmanlarla savaş</span>
        </Link>
      </div>

      {/* Bildirimler */}
      <div className="fixed bottom-20 left-0 right-0 flex flex-col items-center pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`mb-2 px-4 py-2 rounded-lg shadow-lg max-w-xs animate-bounce-in ${
              notification.type === "levelUp"
                ? "bg-blue-600"
                : notification.type === "evolution"
                  ? "bg-purple-600"
                  : notification.type === "loot"
                    ? "bg-amber-600"
                    : notification.type === "error"
                      ? "bg-red-600"
                      : "bg-green-600"
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
