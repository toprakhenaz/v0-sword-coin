"use client"

import { useState, useEffect } from "react"
import PlayerStats from "@/components/player-stats"
import TapSystem from "@/components/tap-system"
import { Sword, Heart, Zap } from "lucide-react"

export default function BattlePage() {
  // Oyuncu durumu (gerçek bir uygulamada üst bileşenden veya bağlamdan geçirilir)
  const [playerLevel, setPlayerLevel] = useState(1)
  const [currentXp, setCurrentXp] = useState(0)
  const [maxXp, setMaxXp] = useState(100)
  const [coins, setCoins] = useState(100)
  const [weaponLevel, setWeaponLevel] = useState(1)
  const [weaponName, setWeaponName] = useState("Paslı Kılıç")
  const [weaponRarity, setWeaponRarity] = useState("common")
  const [activeSkills, setActiveSkills] = useState<string[]>([])
  const [stats, setStats] = useState({
    strength: 5,
    defense: 3,
    agility: 4,
    vitality: 5,
  })

  // Düşman durumu
  const [enemy, setEnemy] = useState({
    name: "Orman Kurdu",
    level: 1,
    maxHealth: 100,
    currentHealth: 100,
    damage: 5,
    xpReward: 20,
    coinReward: 10,
  })

  // Savaş durumu
  const [battleActive, setBattleActive] = useState(false)
  const [playerHealth, setPlayerHealth] = useState(100)
  const [maxPlayerHealth, setMaxPlayerHealth] = useState(100)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [battleResult, setBattleResult] = useState<"victory" | "defeat" | null>(null)

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
      setActiveSkills(gameData.activeSkills || [])
      setStats(gameData.stats || { strength: 5, defense: 3, agility: 4, vitality: 5 })

      // Canlılık bazında oyuncu sağlığını hesapla
      const health = 100 + (gameData.stats?.vitality || 5) * 10
      setPlayerHealth(health)
      setMaxPlayerHealth(health)
    }

    // Oyuncu seviyesine göre düşman oluştur
    generateEnemy(playerLevel)
  }, [playerLevel])

  // Oyuncu seviyesine göre düşman oluştur
  const generateEnemy = (level: number) => {
    const enemyTypes = [
      { name: "Orman Kurdu", baseHealth: 80, baseDamage: 4 },
      { name: "Goblin Avcısı", baseHealth: 60, baseDamage: 6 },
      { name: "İskelet Savaşçı", baseHealth: 100, baseDamage: 5 },
      { name: "Kara Elf", baseHealth: 90, baseDamage: 7 },
      { name: "Dağ Trolü", baseHealth: 150, baseDamage: 8 },
    ]

    const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
    const enemyLevel = Math.max(1, level - 1 + Math.floor(Math.random() * 3)) // Oyuncudan -1 ila +1 seviye

    const health = Math.floor(enemyType.baseHealth * (1 + (enemyLevel - 1) * 0.2))
    const damage = Math.floor(enemyType.baseDamage * (1 + (enemyLevel - 1) * 0.1))
    const xpReward = Math.floor(20 * enemyLevel * (1 + Math.random() * 0.2))
    const coinReward = Math.floor(xpReward / 2)

    setEnemy({
      name: enemyType.name,
      level: enemyLevel,
      maxHealth: health,
      currentHealth: health,
      damage,
      xpReward,
      coinReward,
    })
  }

  // Savaşı başlat
  const startBattle = () => {
    setBattleActive(true)
    setBattleLog(["Savaş başladı!"])
    setBattleResult(null)
  }

  // Oyuncu saldırısını işle
  const handleXpGain = (amount: number) => {
    if (!battleActive || battleResult) return

    // TP kazancı ve güce dayalı hasarı hesapla
    const damage = Math.floor(amount * (1 + stats.strength / 20))

    // Düşmana hasar uygula
    setEnemy((prev) => {
      const newHealth = Math.max(0, prev.currentHealth - damage)

      // Savaş günlüğüne ekle
      setBattleLog((prevLog) => [...prevLog, `${prev.name}'e ${damage} hasar verdin!`])

      // Düşman yenildi mi kontrol et
      if (newHealth <= 0) {
        handleVictory()
        return { ...prev, currentHealth: 0 }
      }

      // Düşman karşı saldırı yapar
      setTimeout(() => {
        if (battleActive && !battleResult) {
          const enemyDamage = Math.max(1, Math.floor(prev.damage * (1 - stats.defense / 100)))
          setPlayerHealth((prevHealth) => {
            const newPlayerHealth = Math.max(0, prevHealth - enemyDamage)

            // Savaş günlüğüne ekle
            setBattleLog((prevLog) => [...prevLog, `${prev.name} sana ${enemyDamage} hasar verdi!`])

            // Oyuncu yenildi mi kontrol et
            if (newPlayerHealth <= 0) {
              handleDefeat()
              return 0
            }

            return newPlayerHealth
          })
        }
      }, 500)

      return { ...prev, currentHealth: newHealth }
    })
  }

  // Altın kazancını işle (savaşta kullanılmaz)
  const handleCoinGain = () => {}

  // Zafer durumunu işle
  const handleVictory = () => {
    setBattleActive(false)
    setBattleResult("victory")
    setBattleLog((prevLog) => [
      ...prevLog,
      `${enemy.name}'i yendin!`,
      `${enemy.xpReward} TP ve ${enemy.coinReward} altın kazandın!`,
    ])

    // Oyuncu TP ve altınını güncelle
    setCurrentXp((prev) => prev + enemy.xpReward)
    setCoins((prev) => prev + enemy.coinReward)

    // İlerlemeyi kaydet
    const gameData = {
      playerLevel,
      currentXp: currentXp + enemy.xpReward,
      coins: coins + enemy.coinReward,
      weaponLevel,
      weaponName,
      weaponRarity,
      activeSkills,
      stats,
      lastPlayTime: Date.now(),
    }
    localStorage.setItem("swordAscensionSave", JSON.stringify(gameData))
  }

  // Yenilgi durumunu işle
  const handleDefeat = () => {
    setBattleActive(false)
    setBattleResult("defeat")
    setBattleLog((prevLog) => [...prevLog, `${enemy.name} tarafından yenildin!`])
  }

  // Savaşı sıfırla
  const resetBattle = () => {
    generateEnemy(playerLevel)
    setPlayerHealth(maxPlayerHealth)
    setBattleActive(false)
    setBattleLog([])
    setBattleResult(null)
  }

  return (
    <div className="pb-20">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-amber-400">Savaş Arenası</h1>
        <p className="text-gray-400 text-xs">Ödüller için düşmanları yen</p>
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

      {/* Savaş Alanı */}
      <div className="bg-[#1a2235] rounded-xl p-4 mx-4 my-4 shadow-lg border border-gray-800/50">
        {/* Düşman Bilgisi */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-bold">{enemy.name}</h3>
            <div className="flex items-center text-sm">
              <div className="bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs">
                {enemy.level}
              </div>
              <span>Seviye {enemy.level}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              <Heart className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm">
                {enemy.currentHealth}/{enemy.maxHealth}
              </span>
            </div>
            <div className="w-32 bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(enemy.currentHealth / enemy.maxHealth) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Oyuncu Sağlığı */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Sağlığın</span>
            <span className="text-sm">
              {playerHealth}/{maxPlayerHealth}
            </span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${(playerHealth / maxPlayerHealth) * 100}%` }}></div>
          </div>
        </div>

        {/* Savaş Kontrolleri */}
        {!battleActive && !battleResult && (
          <button
            className="w-full bg-gradient-to-r from-red-600 to-red-700 py-3 rounded-lg font-bold flex items-center justify-center"
            onClick={startBattle}
          >
            <Sword className="w-5 h-5 mr-2" />
            Savaşı Başlat
          </button>
        )}

        {/* Savaş Sonucu */}
        {battleResult && (
          <div className={`p-4 rounded-lg mb-4 ${battleResult === "victory" ? "bg-green-600/30" : "bg-red-600/30"}`}>
            <h3 className="text-lg font-bold mb-2">{battleResult === "victory" ? "Zafer!" : "Yenilgi!"}</h3>
            {battleResult === "victory" && (
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-blue-400 mr-1" />
                  <span>{enemy.xpReward} TP</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-amber-400 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
                    <circle cx="12" cy="12" r="8" fill="currentColor" />
                    <circle cx="12" cy="12" r="4" fill="#1a2235" />
                  </svg>
                  <span>{enemy.coinReward} Altın</span>
                </div>
              </div>
            )}
            <button className="w-full bg-blue-600 py-2 rounded-lg font-bold mt-3" onClick={resetBattle}>
              Yeni Savaş
            </button>
          </div>
        )}

        {/* Savaş Günlüğü */}
        {(battleActive || battleResult) && (
          <div className="mt-4 bg-[#1e2738] rounded-lg p-3 max-h-32 overflow-y-auto">
            <h4 className="text-sm font-bold mb-2">Savaş Günlüğü</h4>
            <div className="space-y-1">
              {battleLog.map((log, index) => (
                <p key={index} className="text-xs text-gray-300">
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dokunma Sistemi (sadece savaş sırasında aktif) */}
      {battleActive && !battleResult && (
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
      )}
    </div>
  )
}
