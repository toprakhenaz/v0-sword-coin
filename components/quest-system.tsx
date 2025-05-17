"use client"

import { useState, useEffect } from "react"
import { Clock, Swords, Skull, Trophy, ChevronRight } from "lucide-react"

interface Quest {
  id: string
  name: string
  description: string
  level: number
  difficulty: "easy" | "medium" | "hard" | "boss"
  duration: number // saniye cinsinden
  timeRemaining: number
  rewards: {
    xp: number
    coins: number
    lootChance: number
  }
  isActive: boolean
  isCompleted: boolean
}

interface QuestSystemProps {
  playerLevel: number
  onQuestComplete: (rewards: { xp: number; coins: number; loot?: any }) => void
}

export default function QuestSystem({ playerLevel, onQuestComplete }: QuestSystemProps) {
  const [quests, setQuests] = useState<Quest[]>([])
  const [activeQuestCount, setActiveQuestCount] = useState(0)
  const [maxActiveQuests, setMaxActiveQuests] = useState(2)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)

  // Oyuncu seviyesine göre mevcut görevleri oluştur
  useEffect(() => {
    const generateQuests = () => {
      const questTypes = [
        { name: "Avla", action: "Avla" },
        { name: "Keşfet", action: "Keşfet" },
        { name: "Temizle", action: "Temizle" },
        { name: "Araştır", action: "Araştır" },
      ]

      const locations = [
        "Karanlık Orman",
        "Antik Kalıntılar",
        "Sisli Vadi",
        "Terkedilmiş Maden",
        "Hayaletli Kale",
        "Kristal Mağara",
      ]

      const enemies = ["Goblinler", "İskeletler", "Kurtlar", "Haydutlar", "Karanlık Ruhlar", "Troller", "Tarikatçılar"]

      const newQuests: Quest[] = []

      // Normal görevleri oluştur
      for (let i = 0; i < 5; i++) {
        const questType = questTypes[Math.floor(Math.random() * questTypes.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]
        const enemy = enemies[Math.floor(Math.random() * enemies.length)]

        // Oyuncu seviyesine göre zorluk ölçeklendir
        let difficulty: "easy" | "medium" | "hard"
        const roll = Math.random()
        if (roll < 0.4) difficulty = "easy"
        else if (roll < 0.8) difficulty = "medium"
        else difficulty = "hard"

        // Görev seviyesini oyuncu seviyesine göre ölçeklendir (biraz üstünde veya altında)
        const levelVariance = Math.floor(Math.random() * 5) - 2
        const questLevel = Math.max(1, playerLevel + levelVariance)

        // Zorluğa göre süre
        let duration = 0
        switch (difficulty) {
          case "easy":
            duration = 300 + Math.floor(Math.random() * 300)
            break // 5-10 dk
          case "medium":
            duration = 600 + Math.floor(Math.random() * 600)
            break // 10-20 dk
          case "hard":
            duration = 1200 + Math.floor(Math.random() * 1200)
            break // 20-40 dk
        }

        // Seviye ve zorluğa göre ödülleri hesapla
        const baseXp = questLevel * 50
        const baseCoins = questLevel * 25
        let xpMultiplier = 1
        let coinMultiplier = 1
        let lootChance = 0.05

        switch (difficulty) {
          case "medium":
            xpMultiplier = 1.5
            coinMultiplier = 1.5
            lootChance = 0.1
            break
          case "hard":
            xpMultiplier = 2.5
            coinMultiplier = 2
            lootChance = 0.15
            break
        }

        const rewards = {
          xp: Math.floor(baseXp * xpMultiplier),
          coins: Math.floor(baseCoins * coinMultiplier),
          lootChance: lootChance,
        }

        newQuests.push({
          id: `quest-${i}-${Date.now()}`,
          name: `${questType.action} ${location}`,
          description: `${location}'daki ${enemy}'i ${questType.action.toLowerCase()}.`,
          level: questLevel,
          difficulty,
          duration,
          timeRemaining: duration,
          rewards,
          isActive: false,
          isCompleted: false,
        })
      }

      // Oyuncu seviyesi yeterince yüksekse bir boss görevi ekle
      if (playerLevel >= 5) {
        const bossNames = ["Antik Koruyucu", "Gölge Kral", "Yozlaşmış Savaş Lordu", "Buz Devi"]
        const bossName = bossNames[Math.floor(Math.random() * bossNames.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]

        const questLevel = playerLevel + 2
        const duration = 3600 + Math.floor(Math.random() * 3600) // 1-2 saat

        const rewards = {
          xp: Math.floor(questLevel * 50 * 5),
          coins: Math.floor(questLevel * 25 * 4),
          lootChance: 0.3,
        }

        newQuests.push({
          id: `boss-${Date.now()}`,
          name: `${bossName}'i Yen`,
          description: `${location}'da gizlenen ${bossName}'e meydan oku ve yen.`,
          level: questLevel,
          difficulty: "boss",
          duration,
          timeRemaining: duration,
          rewards,
          isActive: false,
          isCompleted: false,
        })
      }

      // Aktif görevleri koru
      const activeQuests = quests.filter((q) => q.isActive && !q.isCompleted)

      setQuests([...activeQuests, ...newQuests])
    }

    generateQuests()

    // Oyuncu seviyesine göre maksimum aktif görev sayısını güncelle
    setMaxActiveQuests(2 + Math.floor(playerLevel / 10))
  }, [playerLevel])

  // Görev zamanlayıcılarını güncelle
  useEffect(() => {
    const timer = setInterval(() => {
      setQuests((prevQuests) => {
        const updatedQuests = prevQuests.map((quest) => {
          if (quest.isActive && !quest.isCompleted) {
            const newTimeRemaining = Math.max(0, quest.timeRemaining - 1)

            // Görev tamamlandı mı kontrol et
            if (newTimeRemaining === 0 && quest.timeRemaining > 0) {
              // Şanslıysa ganimet oluştur
              let loot = undefined
              if (Math.random() < quest.rewards.lootChance) {
                // Basit ganimet oluşturma
                const lootTypes = ["silah", "zırh", "aksesuar"]
                const lootRarities = ["common", "uncommon", "rare", "epic", "legendary"]

                // Daha yüksek zorluk = daha iyi ganimet şansı
                let rarityIndex = 0
                if (quest.difficulty === "medium") rarityIndex = Math.floor(Math.random() * 3)
                else if (quest.difficulty === "hard") rarityIndex = Math.floor(Math.random() * 4)
                else if (quest.difficulty === "boss") rarityIndex = 1 + Math.floor(Math.random() * 4)

                loot = {
                  type: lootTypes[Math.floor(Math.random() * lootTypes.length)],
                  rarity: lootRarities[rarityIndex],
                  level: quest.level,
                }
              }

              // Tamamlama geri çağrısını tetikle
              onQuestComplete({
                xp: quest.rewards.xp,
                coins: quest.rewards.coins,
                loot,
              })

              return { ...quest, timeRemaining: newTimeRemaining, isCompleted: true }
            }

            return { ...quest, timeRemaining: newTimeRemaining }
          }
          return quest
        })

        return updatedQuests
      })

      // Aktif görev sayısını güncelle
      const active = quests.filter((q) => q.isActive && !q.isCompleted).length
      setActiveQuestCount(active)
    }, 1000)

    return () => clearInterval(timer)
  }, [quests, onQuestComplete])

  const startQuest = (questId: string) => {
    if (activeQuestCount >= maxActiveQuests) return

    setQuests((prevQuests) => prevQuests.map((quest) => (quest.id === questId ? { ...quest, isActive: true } : quest)))

    setActiveQuestCount((prev) => prev + 1)
    setSelectedQuest(null)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}s ${minutes}d`
    } else if (minutes > 0) {
      return `${minutes}d ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400"
      case "medium":
        return "text-blue-400"
      case "hard":
        return "text-purple-400"
      case "boss":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Kolay"
      case "medium":
        return "Orta"
      case "hard":
        return "Zor"
      case "boss":
        return "Boss"
      default:
        return "Kolay"
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Swords className="w-4 h-4 text-green-400" />
      case "medium":
        return <Swords className="w-4 h-4 text-blue-400" />
      case "hard":
        return <Skull className="w-4 h-4 text-purple-400" />
      case "boss":
        return <Skull className="w-4 h-4 text-red-400" />
      default:
        return <Swords className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="bg-[#1a2235] rounded-xl shadow-md border border-gray-800/50">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Görevler</h2>
          <span className="text-sm text-gray-400">
            {activeQuestCount}/{maxActiveQuests} Aktif
          </span>
        </div>
      </div>

      {/* Aktif Görevler */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-2">AKTİF GÖREVLER</h3>

        {quests.filter((q) => q.isActive && !q.isCompleted).length > 0 ? (
          <div className="space-y-3">
            {quests
              .filter((q) => q.isActive && !q.isCompleted)
              .map((quest) => (
                <div key={quest.id} className="bg-[#1e2738] rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{quest.name}</h4>
                      <p className="text-xs text-gray-400">{quest.description}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        quest.difficulty === "easy"
                          ? "bg-green-900/30 text-green-400"
                          : quest.difficulty === "medium"
                            ? "bg-blue-900/30 text-blue-400"
                            : quest.difficulty === "hard"
                              ? "bg-purple-900/30 text-purple-400"
                              : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {getDifficultyName(quest.difficulty).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(quest.timeRemaining)}
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-blue-400">
                        <Trophy className="w-3 h-3 mr-1" />
                        {quest.rewards.xp} TP
                      </div>
                      <div className="flex items-center text-amber-400">
                        <svg
                          className="w-3 h-3 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
                          <circle cx="12" cy="12" r="8" fill="currentColor" />
                          <circle cx="12" cy="12" r="4" fill="#1e2738" />
                        </svg>
                        {quest.rewards.coins}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${100 - (quest.timeRemaining / quest.duration) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Aktif görev yok</div>
        )}
      </div>

      {/* Mevcut Görevler */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">MEVCUT GÖREVLER</h3>

        <div className="space-y-2">
          {quests
            .filter((q) => !q.isActive && !q.isCompleted)
            .map((quest) => (
              <div
                key={quest.id}
                className="bg-[#1e2738] rounded-lg p-3 cursor-pointer hover:bg-[#232d40] transition-colors"
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {getDifficultyIcon(quest.difficulty)}
                    <span className="ml-2 font-medium">{quest.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex justify-between items-center mt-1 text-xs">
                  <span className={`${getDifficultyColor(quest.difficulty)}`}>
                    Sv.{quest.level} {getDifficultyName(quest.difficulty)}
                  </span>
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(quest.duration)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Görev Detayları Modalı */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a2235] rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-800">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">{selectedQuest.name}</h2>
                <button className="text-gray-400 hover:text-white" onClick={() => setSelectedQuest(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-gray-300 mb-4">{selectedQuest.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#1e2738] rounded-lg p-3">
                  <span className="text-xs text-gray-400">Zorluk</span>
                  <div className="flex items-center mt-1">
                    {getDifficultyIcon(selectedQuest.difficulty)}
                    <span className={`ml-2 font-medium ${getDifficultyColor(selectedQuest.difficulty)}`}>
                      {getDifficultyName(selectedQuest.difficulty)}
                    </span>
                  </div>
                </div>

                <div className="bg-[#1e2738] rounded-lg p-3">
                  <span className="text-xs text-gray-400">Süre</span>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="font-medium">{formatTime(selectedQuest.duration)}</span>
                  </div>
                </div>

                <div className="bg-[#1e2738] rounded-lg p-3">
                  <span className="text-xs text-gray-400">Seviye</span>
                  <div className="flex items-center mt-1">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-xs mr-2">
                      {selectedQuest.level}
                    </div>
                    <span className="font-medium">Seviye {selectedQuest.level}</span>
                  </div>
                </div>

                <div className="bg-[#1e2738] rounded-lg p-3">
                  <span className="text-xs text-gray-400">Ganimet Şansı</span>
                  <div className="flex items-center mt-1">
                    <svg
                      className="w-4 h-4 text-purple-400 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 3H19V9H5V3Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
                      <path d="M5 9H19L17 21H7L5 9Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
                    </svg>
                    <span className="font-medium">%{Math.round(selectedQuest.rewards.lootChance * 100)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2738] rounded-lg p-3 mb-4">
                <h3 className="text-sm font-medium mb-2">Ödüller</h3>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-blue-400 mr-2" />
                    <span className="font-medium text-blue-400">{selectedQuest.rewards.xp} TP</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-amber-400 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
                      <circle cx="12" cy="12" r="8" fill="currentColor" />
                      <circle cx="12" cy="12" r="4" fill="#1e2738" />
                    </svg>
                    <span className="font-medium text-amber-400">{selectedQuest.rewards.coins} Altın</span>
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-bold ${
                  activeQuestCount >= maxActiveQuests
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                }`}
                onClick={() => startQuest(selectedQuest.id)}
                disabled={activeQuestCount >= maxActiveQuests}
              >
                {activeQuestCount >= maxActiveQuests ? "Maksimum Aktif Görev Sayısına Ulaşıldı" : "Görevi Başlat"}
              </button>

              {activeQuestCount >= maxActiveQuests && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  Yeni görevler başlatmak için aktif görevleri tamamlayın
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
