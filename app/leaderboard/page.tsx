"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Users } from "lucide-react"
import PlayerStats from "@/components/player-stats"

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("global")
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

  const leaderboardData = [
    { rank: 1, name: "KriptoKral", level: 50, weaponLevel: 65, avatar: "👑" },
    { rank: 2, name: "KılıçUstası", level: 45, weaponLevel: 60, avatar: "⚔️" },
    { rank: 3, name: "AltınAvcısı", level: 42, weaponLevel: 55, avatar: "💰" },
    { rank: 4, name: "EjderhaKatili", level: 38, weaponLevel: 50, avatar: "🐉" },
    { rank: 5, name: "AltınToplayıcı", level: 35, weaponLevel: 45, avatar: "🪙" },
    { rank: 6, name: "ŞövalyeSürücü", level: 32, weaponLevel: 40, avatar: "🛡️" },
    { rank: 7, name: "BüyülüMadenci", level: 30, weaponLevel: 38, avatar: "✨" },
    { rank: 8, name: "HazineAvcısı", level: 28, weaponLevel: 35, avatar: "📦" },
    { rank: 9, name: "DestansıSavaşçı", level: 25, weaponLevel: 30, avatar: "🔥" },
    { rank: 10, name: "EfsaneviKahraman", level: 22, weaponLevel: 28, avatar: "🌟" },
  ]

  const friendsData = [
    { rank: 1, name: "Arkadaş1", level: 20, weaponLevel: 25, avatar: "🤝" },
    { rank: 2, name: "Arkadaş2", level: 18, weaponLevel: 22, avatar: "👋" },
    { rank: 3, name: "Arkadaş3", level: 15, weaponLevel: 18, avatar: "🙌" },
  ]

  const currentUserRank = 345

  return (
    <div className="pb-20">
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-amber-400">Sıralama</h1>
        <p className="text-gray-400 text-xs">Diğer oyuncularla rekabet et</p>
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

      {/* Sekmeler */}
      <div className="flex mx-4 mb-4">
        <button
          className={`flex-1 py-2 rounded-l-lg ${
            activeTab === "global" ? "bg-amber-600 text-white" : "bg-[#1a2235] text-gray-400"
          }`}
          onClick={() => setActiveTab("global")}
        >
          <div className="flex items-center justify-center">
            <Trophy className="w-4 h-4 mr-1" />
            Küresel
          </div>
        </button>
        <button
          className={`flex-1 py-2 rounded-r-lg ${
            activeTab === "friends" ? "bg-amber-600 text-white" : "bg-[#1a2235] text-gray-400"
          }`}
          onClick={() => setActiveTab("friends")}
        >
          <div className="flex items-center justify-center">
            <Users className="w-4 h-4 mr-1" />
            Arkadaşlar
          </div>
        </button>
      </div>

      {/* İlk 3 */}
      <div className="flex justify-center items-end mx-4 mb-6">
        {activeTab === "global" ? (
          <>
            <div className="text-center px-2">
              <div className="w-16 h-16 bg-gradient-to-b from-[#C0C0C0] to-[#A0A0A0] rounded-full flex items-center justify-center mx-auto mb-1 border-2 border-[#D0D0D0]">
                <span className="text-2xl">{leaderboardData[1].avatar}</span>
              </div>
              <div className="bg-[#1a2235] rounded-lg p-2 shadow-md">
                <p className="text-xs text-gray-300">2.</p>
                <p className="text-sm font-bold truncate max-w-[70px]">{leaderboardData[1].name}</p>
                <p className="text-xs text-amber-400">Sv.{leaderboardData[1].level}</p>
              </div>
            </div>

            <div className="text-center px-2 -mb-4">
              <div className="w-20 h-20 bg-gradient-to-b from-[#FFD700] to-[#FFC000] rounded-full flex items-center justify-center mx-auto mb-1 border-2 border-[#FFE55C]">
                <span className="text-3xl">{leaderboardData[0].avatar}</span>
              </div>
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-2 shadow-md">
                <Medal className="w-4 h-4 mx-auto text-amber-300" />
                <p className="text-sm font-bold truncate max-w-[80px]">{leaderboardData[0].name}</p>
                <p className="text-xs text-amber-300">Sv.{leaderboardData[0].level}</p>
              </div>
            </div>

            <div className="text-center px-2">
              <div className="w-16 h-16 bg-gradient-to-b from-[#CD7F32] to-[#A05A2C] rounded-full flex items-center justify-center mx-auto mb-1 border-2 border-[#E09245]">
                <span className="text-2xl">{leaderboardData[2].avatar}</span>
              </div>
              <div className="bg-[#1a2235] rounded-lg p-2 shadow-md">
                <p className="text-xs text-gray-300">3.</p>
                <p className="text-sm font-bold truncate max-w-[70px]">{leaderboardData[2].name}</p>
                <p className="text-xs text-amber-400">Sv.{leaderboardData[2].level}</p>
              </div>
            </div>
          </>
        ) : friendsData.length > 0 ? (
          <>
            {friendsData.length >= 2 && (
              <div className="text-center px-2">
                <div className="w-16 h-16 bg-gradient-to-b from-[#C0C0C0] to-[#A0A0A0] rounded-full flex items-center justify-center mx-auto mb-1 border-2 border-[#D0D0D0]">
                  <span className="text-2xl">{friendsData[1].avatar}</span>
                </div>
                <div className="bg-[#1a2235] rounded-lg p-2 shadow-md">
                  <p className="text-xs text-gray-300">2.</p>
                  <p className="text-sm font-bold truncate max-w-[70px]">{friendsData[1].name}</p>
                  <p className="text-xs text-amber-400">Sv.{friendsData[1].level}</p>
                </div>
              </div>
            )}

            <div className="text-center px-2 -mb-4">
              <div className="w-20 h-20 bg-gradient-to-b from-[#FFD700] to-[#FFC000] rounded-full flex items-center justify-center mx-auto mb-1 border-2 border-[#FFE55C]">
                <span className="text-3xl">{friendsData[0].avatar}</span>
              </div>
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-2 shadow-md">
                <Medal className="w-4 h-4 mx-auto text-amber-300" />
                <p className="text-sm font-bold truncate max-w-[80px]">{friendsData[0].name}</p>
                <p className="text-xs text-amber-300">Sv.{friendsData[0].level}</p>
              </div>
            </div>

            {friendsData.length >= 3 && (
              <div className="text-center px-2">
                <div className="w-16 h-16 bg-gradient-to-b from-[#CD7F32] to-[#A05A2C] rounded-full flex items-center justify-center mx-auto mb-1 border-2 border-[#E09245]">
                  <span className="text-2xl">{friendsData[2].avatar}</span>
                </div>
                <div className="bg-[#1a2235] rounded-lg p-2 shadow-md">
                  <p className="text-xs text-gray-300">3.</p>
                  <p className="text-sm font-bold truncate max-w-[70px]">{friendsData[2].name}</p>
                  <p className="text-xs text-amber-400">Sv.{friendsData[2].level}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Henüz arkadaş yok</p>
            <button className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Arkadaş Davet Et</button>
          </div>
        )}
      </div>

      {/* Sıralama Listesi */}
      <div className="mx-4 bg-[#1a2235] rounded-xl overflow-hidden shadow-lg">
        <div className="p-3 bg-[#1e2738] text-sm font-bold flex">
          <div className="w-10 text-center">#</div>
          <div className="flex-1">Oyuncu</div>
          <div className="w-24 text-right">Seviye</div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {(activeTab === "global" ? leaderboardData : friendsData).slice(3).map((player, index) => (
            <div key={index} className="p-3 flex items-center border-t border-gray-800">
              <div className="w-10 text-center text-gray-400">{player.rank}</div>
              <div className="flex-1 flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#1e2738] flex items-center justify-center mr-2">
                  <span>{player.avatar}</span>
                </div>
                <span className="font-medium">{player.name}</span>
              </div>
              <div className="w-24 text-right">
                <span className="text-blue-400">Sv.{player.level}</span>
                <span className="text-xs text-gray-400 ml-1">({player.weaponLevel})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mevcut Kullanıcı */}
        <div className="p-3 flex items-center border-t border-gray-800 bg-[#1e2738]">
          <div className="w-10 text-center text-gray-400">{currentUserRank}</div>
          <div className="flex-1 flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
              <span>😎</span>
            </div>
            <span className="font-medium">Sen</span>
          </div>
          <div className="w-24 text-right">
            <span className="text-blue-400">Sv.{playerLevel}</span>
            <span className="text-xs text-gray-400 ml-1">({weaponLevel})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
